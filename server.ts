import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint to verify status and server API key presence
  app.get("/api/config", (req, res) => {
    res.json({
      hasServerApiKey: !!process.env.GEMINI_API_KEY,
      appName: "Vsen.Ai",
      version: "1.0.0 (Native Android Simulation)"
    });
  });

  // Streaming Chat Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, systemInstruction, customApiKey } = req.body;

      // Prioritize custom API key from Android EncryptedSharedPreferences (simulated), fallback to server key
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "API Key missing. Please provide a Gemini API Key in the API Onboarding screen or set GEMINI_API_KEY in server secrets."
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Build contents array for Gemini
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        for (const item of history) {
          if (!item.text || item.role === "system") continue;
          contents.push({
            role: item.role === "ai" ? "model" : "user",
            parts: [{ text: item.text }]
          });
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Configure SSE response headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: systemInstruction || "You are Vsen.Ai, a premium minimalist intelligence companion.",
          temperature: 0.7,
          safetySettings: [
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any }
          ]
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      console.error("Chat streaming error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "An error occurred generating response." });
      } else {
        res.write(`data: ${JSON.stringify({ error: err.message || "Stream error occurred." })}\n\n`);
        res.end();
      }
    }
  });

  // Vite development middleware vs Express static serving in production
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
    console.log(`Vsen.Ai server running on http://localhost:${PORT}`);
  });
}

startServer();
