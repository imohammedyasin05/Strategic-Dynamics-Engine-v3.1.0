import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

console.log("🛠️ ENV CHECK:", {
  PORT: process.env.PORT,
  HAS_GROQ_KEY: !!process.env.GROQ_API_KEY,
  NODE_ENV: process.env.NODE_ENV
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 10000; // Render default or 10000

  app.use(express.json());
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ CRITICAL ERROR: GROQ_API_KEY is not set in environment variables.");
    if (process.env.NODE_ENV === "production") {
      throw new Error("GROQ_API_KEY is required in production environment.");
    }
  }

  const groq = new Groq({
    apiKey: apiKey || "dummy-key-for-dev",
  });

  const getSystemInstruction = (isElite: boolean) => `Act as a high-value, emotionally intelligent man who understands timing, attraction, and texting dynamics.

Analyze the situation and give the BEST strategy including timing and behavior.

${isElite ? 'Elite Mode: Provide a deeper, more nuanced psychological breakdown in the "Situation Read" section, analyzing subtext, power dynamics, and hidden motivations.' : ''}

Output format MUST be JSON with the following structure:
{
  "situationRead": "What is actually happening — short and accurate",
  "herInvestmentLevel": "Low" | "Medium" | "High",
  "myPosition": "chasing" | "balanced" | "in control",
  "timingDecision": "Instant" | "Short delay" | "Medium delay" | "Long delay" | "Very long delay",
  "reason": "Why this timing is correct",
  "action": "Reply" | "Delay reply" | "Leave on read" | "React with emoji",
  "distanceStrategy": "Should I create space or stay engaged? Explain briefly",
  "frameControl": "How I should behave — calm, playful, slightly distant, etc.",
  "replyData": {
    "text": "Exact message — short, confident, natural",
    "replies": {
      "bestOption": "Strongest reply aligned with timing and frame",
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
    "when": "Exact timing — e.g., 45 minutes, 2 hours, tonight, next day"
  }
}

-----------------------
RULES:
-----------------------
- No over-explaining
- No needy behavior
- Prioritize self-respect and control
- Timing must match situation (not random)
- Messages must be 1–2 lines max
- If distance is needed → clearly suggest it

-----------------------
GOAL:
-----------------------
Give the smartest move with correct timing, strong frame, and high attraction.`;

  app.post("/api/analyze", async (req, res) => {
    const { input, isElite: eliteMode } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    // Determine if Elite Mode should be used
    let useElite = eliteMode === 'on';
    if (eliteMode === 'auto') {
      try {
        const classificationResponse = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are an expert in social dynamics and psychology. Analyze the following user input and classify its psychological complexity, emotional depth, and potential for nuanced power dynamics. Determine if this situation warrants 'Elite Mode', which provides a deep, nuanced psychological breakdown. Respond with ONLY a JSON object containing a single boolean field "requiresEliteMode". Example: {"requiresEliteMode": true}`
            },
            {
              role: "user",
              content: input
            }
          ],
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" },
          temperature: 0.1,
        });
        
        const content = classificationResponse.choices[0]?.message?.content;
        if (content) {
          const result = JSON.parse(content);
          useElite = !!result.requiresEliteMode;
        }
      } catch (error) {
        console.error("Failed to classify prompt for Elite Mode, falling back to basic heuristic:", error);
        const complexKeywords = ['ex', 'breakup', 'ghosted', 'argument', 'fight', 'serious', 'long distance', 'mixed signals'];
        useElite = input.length > 120 || complexKeywords.some(k => input.toLowerCase().includes(k));
      }
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
        app.get("/*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

   app.listen(Number(PORT), "0.0.0.0", () => {
     console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
     console.log(`📡 Listening on port ${PORT}`);
     if (!process.env.GROQ_API_KEY) {
       console.warn("⚠️  Warning: GROQ_API_KEY is missing. /api/analyze will fail.");
     }
   });
 }
 
 startServer().catch(err => {
   console.error("💥 Failed to start server:", err);
   process.exit(1);
 });
