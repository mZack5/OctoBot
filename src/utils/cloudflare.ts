import got from 'got';
import {
   CFHttpOptions, ListZoneResponse, ListZoneDnsRecords,
   DnsRecord, UpdateDnsResponse,
} from '../typings/interfaces';
import { logger } from './logger';

class CloudFlare {
   private httpGetOptions: CFHttpOptions;

   private httpPostOptions: CFHttpOptions;

   constructor() {
      this.httpGetOptions = {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36)',
            'X-Auth-Key': process.env.cloudToken as string,
            'X-Auth-Email': process.env.cloudEmail as string,
         },
         throwHttpErrors: true,
         json: true,
         baseUrl: 'https://api.cloudflare.com/client/v4/',
         responseType: 'json',
      };
      this.httpPostOptions = this.httpGetOptions;
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   private async getJSON(endPoint: string): Promise<any> {
      try {
         const req = await got(endPoint, this.httpGetOptions);
         return req.body;
      } catch (e) {
         logger.error('getJSON::cloudflare', e);
         return '';
      }
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   private async postJSON(endPoint: string, payload: any): Promise<any> {
      try {
         this.httpPostOptions.body = payload;
         const req = await got.put(endPoint, this.httpPostOptions);
         return req.body;
      } catch (e) {
         logger.error('getJSON::cloudflare', e);
         return '';
      }
   }

   public getAllZones(): Promise<ListZoneResponse> {
      return this.getJSON('zones');
   }

   public getDnsForZone(zoneId: string): Promise<ListZoneDnsRecords> {
      return this.getJSON(`zones/${zoneId}/dns_records`);
   }

   public updateDnsZone(zondId: string, dnsRecordId: string, dnsRecord: DnsRecord): Promise<UpdateDnsResponse> {
      return this.postJSON(`zones/${zondId}/dns_records/${dnsRecordId}`, dnsRecord);
   }
}

export const cFlare = new CloudFlare();
