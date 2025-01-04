import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";
import { readFileSync } from "fs";
import { join } from "path";

export class ExcuseService {
  private excuses: string[];

  constructor() {
    this.excuses = readFileSync(join(__dirname, '../../data/excuses.txt'), 'utf-8')
      .split('\n')
      .filter(line => line && !line.startsWith('#'));
  }

  async handleQuery(domain: string, request: Packet, send: Function) {
    const randomExcuse = this.excuses[Math.floor(Math.random() * this.excuses.length)];
    this.sendResponse(request, send, randomExcuse);
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
