import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";
// import * as cheerio from "cheerio";

export class WeatherService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const city = domain.replace(".weather", "");
    try {
      const weather = await this.fetchWeather(city);
      this.sendResponse(request, send, weather);
    } catch (error) {
      this.sendResponse(request, send, `Error fetching weather for ${city}`);
    }
  }

  private async fetchWeather(city: string): Promise<string> {
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = await response.json();
    const current = data.current_condition?.[0] ?? {};
    const temp = current.temp_C ? `${current.temp_C}C` : "N/A";
    const condition = current.weatherDesc?.[0]?.value || "N/A";
    const wind = current.windspeedKmph ? `${current.windspeedKmph}km/h` : "N/A";
    const precip = current.precipMM ? `${current.precipMM}mm` : "N/A";

    return `${temp}|${condition}|${wind}|${precip}`;
  }

  // private decodeOctalString(str: string): string {
  //   const bytes = str
  //     .split("\\")
  //     .filter(Boolean)
  //     .map((part) => parseInt(part, 8));

  //   if (bytes.length > 0) {
  //     return Buffer.from(bytes).toString();
  //   }
  //   return str;
  // }

  // private sanitizeOctalString(str: string): string {
  //   if (str.includes("\\")) {
  //     const bytes = str
  //       .split("\\")
  //       .filter(Boolean)
  //       .map((part) => {
  //         try {
  //           return parseInt(part, 8);
  //         } catch {
  //           return part.charCodeAt(0);
  //         }
  //       });

  //     try {
  //       return Buffer.from(bytes)
  //         .toString("utf8")
  //         .replace("\u00B0", "°") 
  //         .replace("\u2197", "↗"); 
  //     } catch {
  //       return str;
  //     }
  //   }
  //   return str;
  // }

  // private cleanWeatherText(text: string): string {
  //   return text.replace(/\\(\d{3})/g, (match, octal) => {
  //     const byte = parseInt(octal, 8);
  //     return String.fromCharCode(byte);
  //   });
  // }

  // private decodeDecimalEscapes(str: string): string {
  //   const segments = str.split(/(\\\d+)/);
  //   const bytes: number[] = [];
  //   for (const seg of segments) {
  //     const match = seg.match(/^\\(\d+)$/);
  //     if (match) {
  //       bytes.push(parseInt(match[1], 10));
  //     } else {
    
  //       for (let i = 0; i < seg.length; i++) {
  //         bytes.push(seg.charCodeAt(i));
  //       }
  //     }
  //   }
  //   return Buffer.from(bytes).toString("utf8");
  // }

  private sendResponse(request: Packet, send: Function, text: string) {
    const response = DNSPacket.createResponseFromRequest(request);
    const [temp, condition, wind, precip] = text.split("|");

    [temp, condition, wind, precip].forEach((val) => {
      response.answers.push({
        name: request.questions[0].name,
        type: DNSPacket.TYPE.TXT,
        class: DNSPacket.CLASS.IN,
        ttl: 300,
        data: val,
      });
    });
    send(response);
  }
}
