import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";
import { dns } from "bun";

export class ForexService {
  private readonly API_KEY = process.env.EXCHANGE_RATE_API_KEY
  private readonly BASE_URL = "https://v6.exchangerate-api.com/v6";

  constructor() {
    dns.prefetch("v6.exchangerate-api.com");
  }

  async handleQuery(domain: string, request: Packet, send: Function) {
    const query = domain.replace(".fx", "");
    const [amount, to] = query.split("-");
    const value = parseFloat(amount.replace(/[^0-9.]/g, ""));
    const from = amount.replace(/[0-9.]/g, "");

    try {
      const rate = await this.fetchExchangeRate(from, to);
      const converted = value * rate;
      this.sendResponse(
        request,
        send,
        `${value} ${from} = ${converted.toFixed(2)} ${to}`
      );
    } catch (error) {
      this.sendResponse(request, send, `Error converting ${from} to ${to}`);
    }
  }

  private async fetchExchangeRate(from: string, to: string): Promise<number> {
    const response = await fetch(
      `${this.BASE_URL}/${this.API_KEY}/pair/${from}/${to}`
    );

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.conversion_rate) {
      throw new Error("Exchange rate not found");
    }

    return data.conversion_rate;
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
