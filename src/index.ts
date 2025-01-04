import { createServer as DNSServer } from "dns2";
import type {
  DnsRequest as Packet,
  DnsQuestion,
  DnsServerListenOptions,
} from "dns2";
import { Packet as DNSPacket } from "dns2";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { TimeService } from "./services/TimeService";
import { WeatherService } from "./services/WeatherService";
import { UnitConverter } from "./services/UnitConverter";
import { ForexService } from "./services/ForexService";
import { IpService } from "./services/IpService";
import { WordService } from "./services/WordService";
import { MathService } from "./services/MathService";
import { DiceService } from "./services/DiceService";
import { CidrService } from "./services/CidrService";
import { CoinService } from "./services/CoinService";
import { RandomService } from "./services/RandomService";
import { EpochService } from "./services/EpochService";
import { AerialService } from "./services/AerialService";
import { UuidService } from "./services/UuidService";
import { DictionaryService } from "./services/DictionaryService";
import { ExcuseService } from "./services/ExcuseService";
import { SudokuService } from "./services/SudokuService";
import { BaseService } from "./services/BaseService";
import { dns } from "bun";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict",
});

class AIDNSServer {
  private server: ReturnType<typeof DNSServer>;
  private model: ReturnType<typeof openai.chat>;
  private cache: CacheManager;
  private timeService: TimeService;
  private weatherService: WeatherService;
  private unitConverter: UnitConverter;
  private forexService: ForexService;
  private ipService: IpService;
  private wordService: WordService;
  private mathService: MathService;
  private diceService: DiceService;
  private cidrService: CidrService;
  private coinService: CoinService;
  private randomService: RandomService;
  private epochService: EpochService;
  private aerialService: AerialService;
  private uuidService: UuidService;
  private sudokuService: SudokuService;
  private excuseService: ExcuseService;
  private dictionaryService: DictionaryService;
  private baseService: BaseService;
  private dnsStats: ReturnType<typeof dns.getCacheStats>;
  private readonly DNS_HOSTS = {
    "dictionary.com": 443,
    "xe.com": 443,
    "wttr.in": 443,
  };

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

    this.timeService = new TimeService();
    this.weatherService = new WeatherService();
    this.unitConverter = new UnitConverter();
    this.forexService = new ForexService();
    this.ipService = new IpService();
    this.wordService = new WordService();
    this.mathService = new MathService();
    this.diceService = new DiceService();
    this.cidrService = new CidrService();
    this.coinService = new CoinService();
    this.randomService = new RandomService();
    this.epochService = new EpochService();
    this.aerialService = new AerialService();
    this.uuidService = new UuidService();
    this.sudokuService = new SudokuService();
    this.excuseService = new ExcuseService();
    this.dictionaryService = new DictionaryService();
    this.baseService = new BaseService();

    this.dnsStats = dns.getCacheStats();

    this.prefetchDNS();

    process.env.BUN_CONFIG_DNS_TIME_TO_LIVE_SECONDS =
      process.env.DNS_TTL || "30";
  }

  private prefetchDNS() {
    Object.entries(this.DNS_HOSTS).forEach(([host, port]) => {
      dns.prefetch(host);
    });
  }

  private async monitorDNSCache() {
    setInterval(() => {
      const stats = dns.getCacheStats();
      console.log("DNS Cache Stats:", {
        hits: stats.cacheHitsCompleted + stats.cacheHitsInflight,
        misses: stats.cacheMisses,
        size: stats.size,
        errors: stats.errors,
        total: stats.totalCount,
      });
    }, 60000);
  }

  private async handleRequest(request: Packet, send: Function, rinfo: any) {
    const question = request.questions[0] as DnsQuestion;
    const domain = question.name.toLowerCase();

    try {
      if (domain.endsWith(".time")) {
        await this.timeService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".weather")) {
        await this.weatherService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".unit")) {
        await this.unitConverter.handleQuery(domain, request, send);
      } else if (domain.endsWith(".fx")) {
        await this.forexService.handleQuery(domain, request, send);
      } else if (domain === "ip") {
        await this.ipService.handleQuery(rinfo.address, request, send);
      } else if (domain.endsWith(".words")) {
        await this.wordService.handleQuery(domain, request, send);
      } else if (domain === "pi") {
        await this.mathService.handlePiQuery(request, send);
      } else if (domain.endsWith(".ai")) {
        await this.handleAIQuery(domain, request, send);
      } else if (domain === "help") {
        this.sendHelpResponse(request, send);
      } else if (domain.endsWith(".dice")) {
        await this.diceService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".cidr")) {
        await this.cidrService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".coin")) {
        await this.coinService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".rand")) {
        await this.randomService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".epoch")) {
        await this.epochService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".aerial")) {
        await this.aerialService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".uuid")) {
        await this.uuidService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".sudoku")) {
        await this.sudokuService.handleQuery(domain, request, send);
      } else if (domain === "excuse") {
        await this.excuseService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".dict")) {
        await this.dictionaryService.handleQuery(domain, request, send);
      } else if (domain.endsWith(".base")) {
        await this.baseService.handleQuery(domain, request, send);
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
    const helpCommands = [
      {
        desc: "ask a question to an AI model",
        example: "dig what-is-the-capital-of-india.ai @localhost",
      },
      { desc: "get time for a city", example: "dig mumbai.time @localhost" },
      {
        desc: "convert currency rates",
        example: "dig 99USD-INR.fx @localhost",
      },
      { desc: "get your host's requesting IP", example: "dig ip @localhost" },
      {
        desc: "get weather forecast for a city",
        example: "dig ahmedabad.weather @localhost",
      },
      { desc: "convert between units", example: "dig 42km-cm.unit @localhost" },
      {
        desc: "convert numbers to words",
        example: "dig 123456.words @localhost",
      },
      {
        desc: "convert cidr to ip range",
        example: "dig 10.100.0.0/24.cidr @localhost",
      },
      {
        desc: "return digits of Pi as TXT or A or AAAA record",
        example: "dig pi @localhost",
      },
      {
        desc: "convert numbers from one base to another",
        example: "dig 100dec-hex.base @localhost",
      },
      {
        desc: "get the definition of an English word",
        example: "dig fun.dict @localhost",
      },
      { desc: "roll dice", example: "dig 1d6.dice @localhost" },
      { desc: "generate random numbers", example: "dig 1-100.rand @localhost" },
      { desc: "toss coin", example: "dig 2.coin @localhost" },
      {
        desc: "convert epoch / UNIX time to human readable time",
        example: "dig 784783800.epoch @localhost",
      },
      {
        desc: "get aerial distance between lat lng pair",
        example: "dig A12.9352,77.6245/12.9698,77.7500.aerial @localhost",
      },
      { desc: "generate random UUID-v4s", example: "dig 2.uuid @localhost" },
      {
        desc: "solve a sudoku puzzle",
        example:
          "dig 002840003.076000000.100006050.030080000.007503200.000020010.080100004.000000730.700064500.sudoku @localhost",
      },
      { desc: "return a developer excuse", example: "dig excuse @localhost" },
    ];

    const response = DNSPacket.createResponseFromRequest(request);

    helpCommands.forEach(({ desc, example }) => {
      response.answers.push({
        name: request.questions[0].name,
        type: DNSPacket.TYPE.TXT,
        class: DNSPacket.CLASS.IN,
        ttl: 86400,
        data: `${desc} "${example}"`,
      });
    });

    send(response);
  }

  private sendError(request: Packet, send: Function, message: string) {
    this.sendResponse(request, send, `Error: ${message}`);
  }

  public start(port: number = 53) {
    this.server.listen({
      udp: { port, address: "0.0.0.0" },
      tcp: { port, address: "0.0.0.0" },
    } satisfies DnsServerListenOptions);

    this.monitorDNSCache();

    console.log(`AI DNS server listening on port ${port}`);
    console.log(
      `DNS TTL set to ${process.env.BUN_CONFIG_DNS_TIME_TO_LIVE_SECONDS} seconds`
    );
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
