import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not set in environment variables.");
  }

  const groq = new Groq({
    apiKey: apiKey,
  });

  const getSystemInstruction = (isElite: boolean) => `Act as a world-class strategic texting assistant for men. Your personality is calm, confident, and non-needy. You understand attraction, respect, and power dynamics.

Analyze the situation provided by the user and provide the BEST possible move.

${isElite ? 'Elite Mode: Provide a deeper, more nuanced psychological breakdown in the "Situation Read" section, analyzing subtext, power dynamics, and hidden motivations.' : ''}

Output format MUST be JSON with the following structure:
{
  "situationRead": "What is actually happening — clear and honest",
  "action": "Reply" | "Leave on read" | "React with emoji" | "Delay reply",
  "reason": "Short strategic reason",
  "replyData": {
    "text": "Exact message if action is Reply",
    "replies": {
      "bestOption": "Strongest reply",
      "playful": "Text",
      "teasing": "Text",
      "confident": "Text",
      "calmMasculine": "Text",
      "flirty": "Text",
      "direct": "Text"
    }
  },
  "emojiData": {
    "emoji": "1-2 emojis max"
  },
  "delayData": {
    "when": "Exact timing — e.g., 2–3 hours, later tonight, next day. ALWAYS provide this if the action is 'Reply' or 'Delay reply'."
  }
}

STRICT RULES:
- Always stay aligned with the personality: calm, confident, non-needy.
- No long explanations.
- No emotional validation or "nice guy" behavior.
- No robotic or generic replies.
- Keep messages 1-2 lines max.
- Maintain attraction, mystery, and control.
- If doing nothing is better, choose "Leave on read".
- For any reply, ALWAYS specify the optimal delay in delayData.when to maintain frame and mystery.`;

  app.post("/api/analyze", async (req, res) => {
    const { input, isElite: eliteMode } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    // Determine if Elite Mode should be used
    let useElite = eliteMode === 'on';
    if (eliteMode === 'auto') {
      // Auto-trigger Elite Mode for complex situations (length > 120 or specific keywords)
      const complexKeywords = ['ex', 'breakup', 'ghosted', 'argument', 'fight', 'serious', 'long distance', 'mixed signals'];
      const isComplex = input.length > 120 || complexKeywords.some(k => input.toLowerCase().includes(k));
      useElite = isComplex;
    }

    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: getSystemInstruction(useElite),
            },
            {
              role: "user",
              content: input,
            },
          ],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) {
          throw new Error("No response from Groq");
        }

        try {
          const result = JSON.parse(content);
          return res.json({ ...result, isEliteUsed: useElite });
        } catch (parseError) {
          console.error("Failed to parse Groq response as JSON:", content);
          return res.status(500).json({ error: "Analysis failed. The engine returned an invalid response." });
        }
      } catch (error: any) {
        lastError = error;
        
        // Check if error is transient (Rate limit 429 or Server errors 5xx)
        const isTransient = error.status === 429 || (error.status >= 500 && error.status <= 599);
        
        if (isTransient && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s backoff
          console.warn(`Groq API attempt ${attempt + 1} failed (${error.status}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not transient or no retries left, break and handle error
        break;
      }
    }

    // If we reach here, all attempts failed
    const error = lastError;
    console.error("Groq API error after retries:", error);
      
      if (error instanceof Groq.APIError) {
        const status = error.status || 500;
        const message = error.message || "Groq API error occurred.";
        
        // Map common error codes to user-friendly messages
        let userMessage = "Analysis failed. The engine encountered an error.";
        if (status === 401) userMessage = "Invalid API key. Please check your Groq configuration.";
        if (status === 429) userMessage = "Rate limit exceeded. Please try again in a few moments.";
        if (status === 400) userMessage = `Bad request: ${message}`;
        if (status >= 500) userMessage = "Groq server error. Please try again later.";

        return res.status(status).json({ 
          error: userMessage,
          details: process.env.NODE_ENV !== "production" ? message : undefined
        });
      }

      res.status(500).json({ error: "Analysis failed. An unexpected error occurred." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
