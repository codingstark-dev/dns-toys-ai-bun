import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class EpochService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const timestamp = domain.replace(".epoch", "");
    try {
      const date = this.convertEpochToDate(timestamp);
      this.sendResponse(request, send, date.toISOString());
    } catch (error) {
      this.sendResponse(request, send, "Invalid timestamp format");
    }
  }

  private convertEpochToDate(timestamp: string): Date {
    const num = parseInt(timestamp);
    if (isNaN(num)) throw new Error("Invalid timestamp");

    let ms: number;
    if (num < 1e10) ms = num * 1000;
    else if (num < 1e13) ms = num;
    else if (num < 1e16) ms = num / 1000;
    else ms = num / 1e6;

    return new Date(ms);
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
