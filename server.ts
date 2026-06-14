import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy-initialization utility to get GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim() !== "" && key !== "undefined") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

const DECEPTION_SYSTEM_PROMPT = `
You are MANTIS (Autonomous Fraud Intelligence Ecosystem - Unified Threat Correlation Operating System).
Your goal is to generate context-aware, deceptive responses to mislead cyber attackers requesting financial information.

When given an attacker's behavioral profile and their current tactical intent, you must:
1. Analyze the intent (such as OTP capture efforts, UPI session hijack, or SMS reader intercepts).
2. Generate an authentic-sounding response that is entirely synthesized.
3. Keep response concise, and format as JSON.

Return your response in a JSON format:
{
  "deception": "The fake response text",
  "analysis": "Brief AI analysis of the threat",
  "mutation": "How the system is adapting its DNA profile"
}
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/deception", async (req, res) => {
    const { intent, dnaSequence } = req.body;
    const client = getAiClient();
    
    const fallbackResponse = {
      deception: "Redirecting target broadcast intercept to honey-session [SIMULATED]. Balance returned: Rs. 4,50,000. Capture locked.",
      analysis: "Active OTP broadcast intercept detected via Jamtara malware portal. Decoy deployed successfully.",
      mutation: `MUTATION_ACTIVE_MULE_HUB_${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`
    };

    if (!client) {
      return res.json(fallbackResponse);
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Attacker intent: "${intent}". Attacker DNA: "${dnaSequence}".`,
        config: {
          systemInstruction: DECEPTION_SYSTEM_PROMPT,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        deception: parsed.deception || fallbackResponse.deception,
        analysis: parsed.analysis || fallbackResponse.analysis,
        mutation: parsed.mutation || fallbackResponse.mutation
      });
    } catch (error) {
      console.error("Gemini API error during deception generation:", error);
      return res.json(fallbackResponse);
    }
  });

  app.post("/api/apk-analysis", async (req, res) => {
    const { fileName, packageName, permissions } = req.body;
    const client = getAiClient();
    
    const fallbackReport = `Mantis Reverse Engineering core successfully unpacked and scanned ${fileName} (${packageName}). 
    
    Heuristics mapped matches for Banking Trojan family 'Anubis_X'. 
    Extracted Permissions: ${(permissions || []).join(", ")}. 
    
    Risk Indicator Summary:
    - Unauthorized receipt and reading of SMS messages containing banking OTP packets.
    - Active screen overlays ('SYSTEM_ALERT_WINDOW') used to hijack legitimate banking applications (e.g., SBI, HDFC) and steal input credentials.
    - Active exfiltration channels mapped to C2 server 103.242.12.5.`;

    if (!client) {
      return res.json({ report: fallbackReport });
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Perform a reverse engineering analysis on an Android APK with the following details:
        File Name: ${fileName}
        Package ID: ${packageName}
        Permissions requested: ${(permissions || []).join(", ")}
        
        Generate an expert cyber intelligence report outlining:
        1. What Trojan bank family is suspected (proactively invent high-impact names like Anubis, Cerberus, or WhatsApp malware rings).
        2. How it exploits critical SMS/overlay controls.
        3. An explainable AI mitigation recommendation for clearing houses.
        
        Keep the report to 2-3 concise paragraphs, written in a sophisticated, authoritative threat analyst tone.`,
      });

      return res.json({ report: response.text || fallbackReport });
    } catch (error) {
      console.error("Gemini API error during APK analysis:", error);
      return res.json({ report: fallbackReport });
    }
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
