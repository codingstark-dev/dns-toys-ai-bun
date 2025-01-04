import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class MathService {
  async handlePiQuery(request: Packet, send: Function) {
    this.sendResponse(request, send, Math.PI.toString());
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
