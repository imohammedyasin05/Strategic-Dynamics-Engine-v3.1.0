import Groq from "groq-sdk";

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

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { input?: string; isElite?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { input, isElite: eliteMode } = body;

  if (!input) {
    return new Response(JSON.stringify({ error: "Input is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let useElite = eliteMode === "on";
  if (eliteMode === "auto") {
    const complexKeywords = [
      "ex",
      "breakup",
      "ghosted",
      "argument",
      "fight",
      "serious",
      "long distance",
      "mixed signals",
    ];
    const isComplex =
      input.length > 120 ||
      complexKeywords.some((k) => input.toLowerCase().includes(k));
    useElite = isComplex;
  }

  const groq = new Groq({ apiKey });

  const maxRetries = 2;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: getSystemInstruction(useElite) },
          { role: "user", content: input },
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
        return new Response(JSON.stringify({ ...result, isEliteUsed: useElite }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse Groq response as JSON:", content);
        return new Response(
          JSON.stringify({
            error: "Analysis failed. The engine returned an invalid response.",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (error: any) {
      lastError = error;
      const isTransient =
        error.status === 429 ||
        (error.status >= 500 && error.status <= 599);

      if (isTransient && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `Groq API attempt ${attempt + 1} failed (${error.status}). Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  const error = lastError;
  console.error("Groq API error after retries:", error);

  if (error instanceof Groq.APIError) {
    const status = error.status || 500;
    const message = error.message || "Groq API error occurred.";

    let userMessage = "Analysis failed. The engine encountered an error.";
    if (status === 401)
      userMessage = "Invalid API key. Please check your Groq configuration.";
    if (status === 429)
      userMessage = "Rate limit exceeded. Please try again in a few moments.";
    if (status === 400) userMessage = `Bad request: ${message}`;
    if (status >= 500)
      userMessage = "Groq server error. Please try again later.";

    return new Response(
      JSON.stringify({
        error: userMessage,
        details:
          process.env.NODE_ENV !== "production" ? message : undefined,
      }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "Analysis failed. An unexpected error occurred." }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
