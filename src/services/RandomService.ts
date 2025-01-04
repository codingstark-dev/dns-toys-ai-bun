import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class RandomService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const range = domain.replace(".rand", "").split("-");
    const min = parseInt(range[0]);
    const max = parseInt(range[1]);
    
    if (isNaN(min) || isNaN(max)) {
      this.sendResponse(request, send, "Invalid range format");
      return;
    }

    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    this.sendResponse(request, send, random.toString());
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
