import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class DiceService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const query = domain.replace(".dice", "");
    try {
      const result = this.rollDice(query);
      this.sendResponse(request, send, result);
    } catch (error) {
      this.sendResponse(request, send, "Invalid dice notation");
    }
  }

  private rollDice(notation: string): string {
    const [diceNotation, modifier] = notation.split('/');
    const [count, sides] = diceNotation.toLowerCase().split('d').map(Number);
    
    if (isNaN(count) || isNaN(sides) || count < 1 || sides < 1) {
      throw new Error("Invalid dice notation");
    }

    const rolls = Array.from({ length: count }, () => 
      Math.floor(Math.random() * sides) + 1
    );
    
    const sum = rolls.reduce((a, b) => a + b, 0) + (parseInt(modifier) || 0);
    return `Rolls: [${rolls.join(', ')}] Total: ${sum}`;
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
