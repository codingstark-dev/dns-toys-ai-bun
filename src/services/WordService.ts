import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class WordService {
  private readonly units = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];

  private readonly tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];

  async handleQuery(domain: string, request: Packet, send: Function) {
    const number = parseInt(domain.replace(".words", ""));
    const words = this.numberToWords(number);
    this.sendResponse(request, send, words);
  }

  private numberToWords(num: number): string {
    if (num === 0) return "zero";
    if (num < 0) return "minus " + this.numberToWords(Math.abs(num));
    if (num < 20) return this.units[num];
    if (num < 100) {
      return this.tens[Math.floor(num / 10)] + 
        (num % 10 ? " " + this.units[num % 10] : "");
    }
    if (num < 1000) {
      return this.units[Math.floor(num / 100)] + " hundred" + 
        (num % 100 ? " and " + this.numberToWords(num % 100) : "");
    } else if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      let words = this.numberToWords(thousands) + " thousand";
      if (remainder) {
        words += (remainder < 100 ? " and " : " ") + this.numberToWords(remainder);
      }
      return words;
    } else {
      return "number too large";
    }
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
