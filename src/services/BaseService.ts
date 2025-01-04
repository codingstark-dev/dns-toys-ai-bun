import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class BaseService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const query = domain.replace(".base", "");
    const [number, conversion] = query.split("-");

    try {
      const result = this.convertBase(number, conversion);
      this.sendResponse(request, send, result);
    } catch (error) {
      this.sendResponse(request, send, "Invalid base conversion format");
    }
  }

  private convertBase(number: string, targetBase: string): string {
    let value: number;
    let result: string;
    if (number.endsWith("dec")) {
      value = parseInt(number.replace("dec", ""), 10);
    } else if (number.endsWith("hex")) {
      value = parseInt(number.replace("hex", ""), 16);
    } else if (number.endsWith("bin")) {
      value = parseInt(number.replace("bin", ""), 2);
    } else if (number.endsWith("oct")) {
      value = parseInt(number.replace("oct", ""), 8);
    } else {
      value = parseInt(number, 10);
    }

    switch (targetBase.toLowerCase()) {
      case "hex":
        result = value.toString(16).toUpperCase();
        break;
      case "bin":
        result = value.toString(2);
        break;
      case "oct":
        result = value.toString(8);
        break;
      case "dec":
        result = value.toString(10);
        break;
      default:
        throw new Error("Unsupported target base");
    }

    return `${number} = ${result}`;
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
