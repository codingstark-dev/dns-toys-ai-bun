import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class CidrService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const cidr = domain.replace(".cidr", "");
    try {
      const range = this.calculateCidrRange(cidr);
      this.sendResponse(request, send, range);
    } catch (error) {
      this.sendResponse(request, send, `Error parsing CIDR: ${cidr}`);
    }
  }

  private calculateCidrRange(cidr: string): string {
    const [ip, prefix] = cidr.split("/");

    if (ip.includes(":")) {
      return this.calculateIpv6Range(ip, parseInt(prefix));
    } else {  
      return this.calculateIpv4Range(ip, parseInt(prefix));
    }
  }

  private calculateIpv4Range(ip: string, prefix: number): string {
    const ipNum = this.ipv4ToNumber(ip);
    const mask = -1 << (32 - prefix);
    const network = ipNum & mask;
    const broadcast = network | (~mask >>> 0);

    const first = network + 1;
    const last = broadcast - 1;

    return `First: ${this.numberToIpv4(first)} Last: ${this.numberToIpv4(
      last
    )}`;
  }

  private ipv4ToNumber(ip: string): number {
    return (
      ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>>
      0
    );
  }

  private numberToIpv4(num: number): string {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join(".");
  }

  private calculateIpv6Range(ip: string, prefix: number): string {
    return `IPv6 CIDR calculation: ${ip}/${prefix}`;
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
