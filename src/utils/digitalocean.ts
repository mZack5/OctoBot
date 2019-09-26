import got from 'got';
import {
   GotHTTPOptions, AllDroplets, AllSnapshots,
   DropletOptions, DropletAction, ReturnedDroplet,
} from '../typings/interfaces';
import { logger } from './logger';

class DigitalOcean {
   private httpGetOptions: GotHTTPOptions;

   private httpPostOptions: GotHTTPOptions;

   constructor() {
      this.httpGetOptions = {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36)',
            Authorization: `Bearer ${process.env.digitalToken}`,
         },
         throwHttpErrors: true,
         json: true,
         baseUrl: 'https://api.digitalocean.com/v2/',
         responseType: 'json',
      };
      this.httpPostOptions = this.httpGetOptions;
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   private async getJSON(endPoint: string): Promise<any> {
      try {
         delete this.httpGetOptions.body;
         const req = await got(endPoint, this.httpGetOptions);
         return req.body;
      } catch (e) {
         logger.error('getJSON::digitalocean', e);
         return '';
      }
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   private async postJSON(endPoint: string, payload: any): Promise<any> {
      try {
         this.httpPostOptions.body = payload;
         const req = await got.post(endPoint, this.httpPostOptions);
         return req.body;
      } catch (e) {
         logger.error('postJSON::digitalocean', e);
         return '';
      }
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   private async sendDelete(endPoint: string): Promise<any> {
      try {
         const req = await got.delete(endPoint, this.httpGetOptions);
         return req.body;
      } catch (e) {
         logger.error('sendDelete::digitalocean', e);
         return '';
      }
   }

   public getAllDroplets(): Promise<AllDroplets> {
      return this.getJSON('droplets');
   }

   public getSnapshots(): Promise<AllSnapshots> {
      return this.getJSON('snapshots');
   }

   public createDroplet(dropletConfig: DropletOptions): Promise<ReturnedDroplet> {
      return this.postJSON('droplets', dropletConfig);
   }

   public getDropletById(dropletId: number): Promise<ReturnedDroplet> {
      return this.getJSON(`droplets/${dropletId}`);
   }

   public runDropletAction(dropletId: number, action: string): Promise<DropletAction> {
      return this.postJSON(`droplets/${dropletId}/actions`, { type: action });
   }

   public deleteDroplet(dropletId: number): Promise<void> {
      return this.sendDelete(`droplets/${dropletId}`);
   }
}

export const dOcean = new DigitalOcean();

// async function test(): Promise<void> {
//    const { droplet } = await dOcean.getDropletById(160557235);
//    console.log(`asdf: ${JSON.stringify(droplet, null, 2)}`);
//    droplet.networks.v4 = [];
//    if (droplet.networks.v4.length) {
//       console.log('shits good');
//    }
// }
// test();
