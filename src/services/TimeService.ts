import { DateTime } from "luxon";
import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class TimeService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const query = domain.replace(".time", "");

    if (query.includes("-")) {
      return this.handleTimeConversion(query, request, send);
    }
    return this.handleCityTime(query, request, send);
  }

  private async handleCityTime(city: string, request: Packet, send: Function) {
    const time = DateTime.now().setZone(this.getCityTimezone(city));
    this.sendResponse(request, send, time.toFormat("yyyy-MM-dd HH:mm:ss z"));
  }

  private async handleTimeConversion(
    query: string,
    request: Packet,
    send: Function
  ) {
    const [time, from, to] = query.split("-");
    const fromZone = this.getCityTimezone(from);
    const toZone = this.getCityTimezone(to);

    const dateTime = DateTime.fromISO(time, { zone: fromZone }).setZone(toZone);

    this.sendResponse(
      request,
      send,
      dateTime.toFormat("yyyy-MM-dd HH:mm:ss z")
    );
  }

  private getCityTimezone(city: string): string {
    const timezones: Record<string, string> = {
      mumbai: "Asia/Kolkata",
      newyork: "America/New_York",
      london: "Europe/London",
      tokyo: "Asia/Tokyo",
      sydney: "Australia/Sydney",
      paris: "Europe/Paris",
      berlin: "Europe/Berlin",
      moscow: "Europe/Moscow",
      beijing: "Asia/Shanghai",
      dubai: "Asia/Dubai",
      singapore: "Asia/Singapore",
      toronto: "America/Toronto",
      losangeles: "America/Los_Angeles",
      chicago: "America/Chicago",
      houston: "America/Chicago",
      mexicocity: "America/Mexico_City",
      santiago: "America/Santiago",
      buenosaires: "America/Argentina/Buenos_Aires",
      saopaulo: "America/Sao_Paulo",
      johannesburg: "Africa/Johannesburg",
      cairo: "Africa/Cairo",
      lagos: "Africa/Lagos",
      nairobi: "Africa/Nairobi",
      casablanca: "Africa/Casablanca",
    };
    return timezones[city.toLowerCase()] || "UTC";
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
