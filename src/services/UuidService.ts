import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";
import { randomUUID } from "crypto";

export class UuidService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const count = parseInt(domain.replace(".uuid", "")) || 1;
    const uuids = Array.from({ length: count }, () => randomUUID());
    this.sendResponse(request, send, uuids.join("\n"));
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
