import { readFileSync } from 'fs';
import { ConfigOptions } from '../typings/interfaces';

export function checkAdmin(uid: string): boolean {
   const config: ConfigOptions = JSON.parse(readFileSync(`${process.env.configFile}.json`).toString());
   return config.admins.includes(uid);
}
