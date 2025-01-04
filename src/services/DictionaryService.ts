import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";
import { dns } from "bun";

interface DictionaryEntry {
  word: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export class DictionaryService {
  private readonly API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";

  constructor() {
    dns.prefetch("www.dictionary.com");
  }

  async handleQuery(domain: string, request: Packet, send: Function) {
    const word = domain.replace(".dict", "").replace(/-/g, " ");
    try {
      const definition = await this.fetchDefinition(word);
      this.sendResponse(request, send, definition);
    } catch (error) {
      this.sendResponse(request, send, `No definition found for: ${word}`);
    }
  }

  private async fetchDefinition(word: string): Promise<string> {
    const response = await fetch(
      `${this.API_BASE}/${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      throw new Error("Word not found");
    }

    const [entry] = (await response.json()) as DictionaryEntry[];
    const firstMeaning = entry.meanings[0];
    const definition = firstMeaning.definitions[0].definition;

    const formatted = `[${firstMeaning.partOfSpeech}] ${definition}`;
    return formatted.length > 255
      ? formatted.substring(0, 252) + "..."
      : formatted;
  }

  private sendResponse(request: Packet, send: Function, text: string) {
    const response = DNSPacket.createResponseFromRequest(request);
    response.answers.push({
      name: request.questions[0].name,
      type: DNSPacket.TYPE.TXT,
      class: DNSPacket.CLASS.IN,
      ttl: 300,
      data: text,
    });
    send(response);
  }
}
