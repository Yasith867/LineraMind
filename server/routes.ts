import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register AI Integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Ask AI Endpoint
  app.post(api.ai.ask.path, async (req, res) => {
    try {
      const { question } = api.ai.ask.input.parse(req.body);

      // 1. Call AI
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: "You are LineraMind, an advanced AI running on the Linera protocol. Be concise, accurate, and technical." },
          { role: "user", content: question }
        ],
        max_completion_tokens: 500,
      });

      const answer = response.choices[0].message.content || "No response generated.";

      // 2. Simulate Linera Microchain Storage
      // In a real implementation, this would submit a transaction to a Linera chain.
      // Here we simulate the chain state.
      const mockChainId = "e476187f6dd84755966526189874552"; // Simulated Chain ID
      const mockBlockHeight = Math.floor(Math.random() * 1000000); // Simulated Block Height

      const entry = await storage.createEntry({
        question,
        answer,
        chainId: mockChainId,
        blockHeight: mockBlockHeight
      });

      res.json(entry);
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ message: "Failed to process request on Linera chain" });
    }
  });

  // Verify Endpoint
  app.get(api.ai.verify.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getEntry(id);

      if (!entry) {
        return res.status(404).json({ message: "Entry not found on chain" });
      }

      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Seed Data
  try {
    const existing = await storage.getEntry(1);
    if (!existing) {
      console.log("Seeding database...");
      await storage.createEntry({
        question: "What is Linera?",
        answer: "Linera is a decentralized protocol designed for high-performance, low-latency applications. It uses microchains to allow parallel execution of operations, enabling web2-like responsiveness on a blockchain.",
        chainId: "e476187f6dd84755966526189874552",
        blockHeight: 100
      });
      await storage.createEntry({
        question: "Why is real-time important?",
        answer: "Real-time execution ensures that user interactions are confirmed instantly, preventing the lag typical of traditional blockchains. This is crucial for applications like payments, gaming, and messaging.",
        chainId: "e476187f6dd84755966526189874552",
        blockHeight: 101
      });
    }
  } catch (e) {
    console.error("Error seeding database:", e);
  }

  return httpServer;
}
