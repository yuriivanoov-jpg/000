import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY not found in environment variables. Running in design mockup mode.");
}

// API proxy for the AI Design Companion
app.post("/api/gemini/generate", async (req, res) => {
  const { prompt, systemInstruction, image } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Fallback mockup responses if API Key is not set
  if (!ai) {
    setTimeout(() => {
      const mockResponses: { [key: string]: string } = {
        "hello": "Hello! I am Clara, Kaelen, Sienna, and Dax of the Atelier Design Council. We can help you create amazing layouts, recommend gorgeous color harmonies, and write stylish style variables. Ask us anything about modern design!",
        "ux": "In 2026, user experience is centered around fluid micro-interactions, highly tactile glassmorphism, and cognitive weight reduction. Design should feel organic, fast, and respond to gravity and touch.",
        "colors": "Try a cosmic glass palette: Base of deep charcoal (#121214), border accents of electric coral (#ff7657), and text of crisp silver-white (#f3f4f6)."
      };
      
      const lower = prompt.toLowerCase();
      let reply = "Atelier AI Council Active: That's a beautiful concept! To fully unlock custom dynamic layouts and upload live design images, plug in your Gemini API Key in the Secrets Panel. Here is a design suggestion: try pairing high-contrast typography with a sharp square layout.";
      
      if (image) {
        reply = "Atelier AI Council: I see you uploaded an image! To let our design companions analyze this visual reference, please make sure your Gemini API Key is configured in the Secrets panel. For now, it looks like a gorgeous spatial layout with elegant color values.";
      } else if (lower.includes("hello") || lower.includes("привет")) {
        reply = mockResponses["hello"];
      } else if (lower.includes("ux") || lower.includes("design") || lower.includes("дизайн")) {
        reply = mockResponses["ux"];
      } else if (lower.includes("color") || lower.includes("цвет")) {
        reply = mockResponses["colors"];
      }
      
      return res.json({ text: reply });
    }, 600);
    return;
  }

  try {
    let contents: any = prompt;

    if (image) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        };
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "You are an ultra-knowledgeable 2026 Web Designer and Aesthetic Expert. Keep your answers structured, sleek, creative, and professional. Provide directly useful feedback.",
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during generation" });
  }
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

setupServer();
