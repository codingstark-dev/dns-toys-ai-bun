import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class AerialService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    try {
      
      let cleanDomain = domain.replace(/\.$/, '');

      
      cleanDomain = cleanDomain
        .toLowerCase()
        .replace(/\.aerial$/, '')
        .replace(/^a/, '');

      
      const [point1, point2] = cleanDomain.split('/');
      
      if (!this.isValidCoordinateString(point1) || !this.isValidCoordinateString(point2)) {
        throw new Error('Invalid coordinate format');
      }

      const [lat1, lon1] = point1.split(',').map(Number);
      const [lat2, lon2] = point2.split(',').map(Number);
      
      console.log('Parsed coordinates:', { lat1, lon1, lat2, lon2 }); 
      
      const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
      this.sendResponse(request, send, `aerial distance = ${distance.toFixed(2)} KM`);
    } catch (error) {
      console.error('Error:', error);
      this.sendResponse(request, send, "Invalid coordinates format");
    }
  }

  private isValidCoordinateString(coord: string): boolean {
    if (!coord) return false;
    const [lat, lon] = coord.split(',').map(Number);
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private sendResponse(request: Packet, send: Function, text: string) {
    const response = DNSPacket.createResponseFromRequest(request);
    response.answers.push({
      name: request.questions[0].name,
      type: DNSPacket.TYPE.TXT,
      class: DNSPacket.CLASS.IN,
      ttl: 900, 
      data: text,
    });
    send(response);
  }
}
