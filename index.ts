import { createServer as DNSServer } from "dns2";
import type {
  DnsRequest as Packet,
  DnsQuestion,
  DnsServerListenOptions,
} from "dns2";
import { Packet as DNSPacket } from "dns2";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
// import { z } from "zod";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict",
});

// const DNSResponseSchema = z.object({
//   answer: z.string().max(255),
//   category: z.enum(["general", "technical", "error"]),
// });

class AIDNSServer {
  private server: ReturnType<typeof DNSServer>;
  private model: ReturnType<typeof openai.chat>;
  private cache: CacheManager;

  constructor() {
    this.model = openai.chat("gpt-4o-mini-2024-07-18", {
      user: "dns-server",
    });

    this.cache = new CacheManager(300);

    this.server = DNSServer({
      udp: true,
      tcp: true,
      handle: (request, send, rinfo) => {
        if (!request?.questions?.length) {
          console.error("Invalid DNS request:", request);
          return;
        }
        this.handleRequest(request, send, rinfo);
      },
    });
  }

  private async handleRequest(request: Packet, send: Function, rinfo: any) {
    const question = request.questions[0] as DnsQuestion;
    const domain = question.name.toLowerCase();

    try {
      if (domain.endsWith(".ai")) {
        await this.handleAIQuery(domain, request, send);
      } else if (domain === "help") {
        this.sendHelpResponse(request, send);
      } else {
        this.sendError(request, send, "Unknown query type");
      }
    } catch (error) {
      console.error("Error handling request:", error);
      this.sendError(request, send, "Internal server error");
    }
  }

  private async handleAIQuery(domain: string, request: Packet, send: Function) {
    const query = domain.slice(0, -3).replace(/-/g, " ");

    const cachedResponse = this.cache.get(query);
    if (cachedResponse) {
      console.log(`Cache hit for query: ${query}`);
      return this.sendResponse(request, send, cachedResponse);
    }

    try {
      const { text } = await generateText({
        model: this.model,
        maxTokens: 100,
        messages: [
          {
            role: "system",
            content:
              "You are a DNS-based AI assistant. Provide concise, accurate answers that fit within DNS TXT record limits (255 characters).",
          },
          {
            role: "user",
            content: query,
          },
        ],
      });

      this.cache.set(query, text);
      this.sendResponse(request, send, text);
    } catch (error) {
      console.error("AI generation error:", error);
      this.sendError(request, send, "Failed to generate AI response");
    }
  }

  private sendResponse(request: Packet, send: Function, text: string) {
    const truncatedText = text.slice(0, 255);

    const response = DNSPacket.createResponseFromRequest(request);
    response.answers.push({
      name: request.questions[0].name,
      type: DNSPacket.TYPE.TXT,
      class: DNSPacket.CLASS.IN,
      ttl: 300,
      data: truncatedText,
    });

    send(response);
  }

  private sendHelpResponse(request: Packet, send: Function) {
    const helpText =
      "AI DNS Server: Query format: your-question.ai (e.g., what-is-javascript.ai)";
    this.sendResponse(request, send, helpText);
  }

  private sendError(request: Packet, send: Function, message: string) {
    this.sendResponse(request, send, `Error: ${message}`);
  }

  public start(port: number = 53) {
    this.server.listen({
      udp: { port, address: "0.0.0.0" },
      tcp: { port, address: "0.0.0.0" },
    } satisfies DnsServerListenOptions);
    console.log(`AI DNS server listening on port ${port}`);
  }
}

class CacheManager {
  private cache: Map<string, { response: string; timestamp: number }>;
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  set(key: string, value: string) {
    this.cache.set(key, {
      response: value,
      timestamp: Date.now(),
    });
  }

  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.response;
  }
}

const server = new AIDNSServer();
server.start(53);
