import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class CoinService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const count = parseInt(domain.replace(".coin", "")) || 1;
    const results = Array.from({ length: count }, () => 
      Math.random() < 0.5 ? "heads" : "tails"
    );
    this.sendResponse(request, send, results.join(", "));
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
