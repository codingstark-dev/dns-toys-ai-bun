import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class UnitConverter {
  private readonly conversions: Record<string, (value: number) => number> = {
    "km-mi": (km) => km * 0.621371,
    "mi-km": (mi) => mi * 1.60934,
    "kg-lb": (kg) => kg * 2.20462,
    "lb-kg": (lb) => lb * 0.453592,
    "c-f": (c) => (c * 9) / 5 + 32,
    "f-c": (f) => ((f - 32) * 5) / 9,
    "m-cm": (m) => m * 100,
    "cm-m": (cm) => cm / 100,
    "m-km": (m) => m / 1000,
    "km-m": (km) => km * 1000,
    "cm-km": (cm) => cm / 100000,
    "km-cm": (km) => km * 100000,
    "miles-km": (miles) => miles * 1.60934,
    "km-miles": (km) => km / 1.60934,
    "miles-m": (miles) => miles * 1609.34,
  };

  async handleQuery(domain: string, request: Packet, send: Function) {
    const query = domain.replace(".unit", "");
    const [valueWithUnit, targetUnit] = query.split("-");
    const value = parseFloat(valueWithUnit.replace(/[^0-9.-]/g, ""));
    const unit = valueWithUnit.replace(/[0-9.-]/g, "").toLowerCase();
    const targetUnitLower = targetUnit.toLowerCase();
    const conversionKey = `${unit}-${targetUnitLower}`;

    if (this.conversions[conversionKey]) {
      const result = this.conversions[conversionKey](value);

      this.sendResponse(
        request,
        send,
        `${value}${valueWithUnit.replace(/[0-9.-]/g, "")} = ${result.toFixed(
          2
        )}${targetUnit}`
      );
    } else {
      this.sendResponse(
        request,
        send,
        `Unsupported conversion: ${unit} to ${targetUnitLower}`
      );
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
