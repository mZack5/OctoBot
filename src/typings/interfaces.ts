import { Message } from 'discord.js';

export interface GotHTTPOptions {
   [key: string]: string | boolean | object | undefined;
   throwHttpErrors: boolean;
   json: boolean | JSON;
   baseUrl?: string;
   responseType: string;
   headers: {
      [key: string]: string;
   };
}

export interface DiscordEmbedReply {
   embed: {
      title?: string;
      color: number;
      description: string;
   };
}

export interface Command {
   (message: Message, args: string[]): void;
   default(message: Message, args: string[]): void;
   help: {
      name: string;
      help?: string;
      timeout?: number;
   };
}

export interface ConfigOptions {
   prefix: string;
   gameUrl: string;
   game: string;
   gameState: 'PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING' | undefined;
   admins: string[];
   droplet: {
      messageId: string;
      channelId: string;
      id: number;
      name: string;
   };
}

export interface CommandFunction {
   (message: Message, args: string[]): void | Promise<void>;
}

// Below are all types for our homebrew digitalOcean library

export interface AllDroplets {
   droplets: Droplet[];
   links: Links;
   meta: DOMeta;
}

export interface AllSnapshots {
   snapshots: Snapshot[];
   links: Links;
   meta: DOMeta;
}

export interface Snapshot {
   id: string;
   name: string;
   regions: string[];
   created_at: Date;
   resource_id: string[];
   resource_type: string;
   min_disk_size: number;
   size_gigabytes: number;
   tags: string[];
}

export interface ReturnedDroplet {
   droplet: Droplet;
}

export interface Droplet {
   id: number;
   name: string;
   memory: number;
   vcpus: number;
   disk: number;
   locked: boolean;
   status: string;
   kernel: {
      id: number;
      name: string;
      version: string;
   };
   created_at: Date;
   features: string[];
   backup_ids: number[];
   snapshot_ids: string[];
   image: {
      id: number;
      name: string;
      distribution: string;
      slug: string;
      public: boolean;
      regions: string[];
      created_at: Date;
      type: string;
      min_disk_size: number;
      size_gigabytes: number;
   };
   volume_ids: string[];
   size: string;
   size_slug: string;
   networks: {
      v4: V4[];
      v6: V6[];
   };
   region: {
      name: string;
      slug: string;
      sizes: string[];
      features: string[];
      available?: boolean | undefined;
   };
   tags: string[];
}

export interface DropletAction {
   action: Droplet;
}

export interface V4 {
   ip_address: string;
   netmask: string;
   gateway: string;
   type: string;
}

export interface V6 {
   ip_address: string;
   netmask: number;
   gateway: string;
   type: string;
}

export interface Links {
   pages: {
      last: string;
      next: string;
   };
}

export interface DOMeta {
   total: number;
}

export interface DropletOptions {
   name: string;
   region: string;
   size: string;
   image: string;
   ssh_keys: string[];
}

// below are all types for our cloudfalre homebrew lib

export interface CFHttpOptions {
   [key: string]: string | boolean | object | undefined;
   throwHttpErrors: boolean;
   json: boolean | JSON;
   baseUrl?: string;
   responseType: string;
   headers: {
      [key: string]: string;
   };
}

export interface ListZoneResponse {
   success: boolean;
   errors: string[];
   messages: string[];
   result: Zone[];
}

export interface ListZoneDnsRecords {
   success: boolean;
   errors: string[];
   messages: string[];
   result: DnsResult[];
}

export interface DnsRecord {
   type: string;
   name: string;
   content: string;
   ttl: number;
}

export interface UpdateDnsResponse {
   success: boolean;
   errors: string[];
   messages: string[];
   result: DnsResult;
}

export interface DnsResult {
   id: string;
   type: string;
   name: string;
   content: string;
   proxiable: boolean;
   proxied: boolean;
   ttl: number;
   locked: boolean;
   zone_id: string;
   zone_name: string;
   created_on: Date;
   modified_on: Date;
}

export interface Zone {
   id: string;
   name: string;
   development_mode: number;
   original_name_servers: string[];
   original_registrar: string;
   original_dnshost: string;
   created_on: Date;
   modified_on: Date;
   activated_on: Date;
   owner: {
      id: string;
      email: string;
      type: string;
   };
   account: {
      id: string;
      name: string;
   };
   permissions: string[];
   plan: Plan;
   plan_pending: Plan;
   status: string;
   paused: boolean;
   type: string;
   name_servers: string[];

}

export interface Plan {
   id: string;
   name: string;
   price: number;
   currency: string;
   frequency: string;
   legacy_id: string;
   is_subscribed: boolean;
   can_subscribe: boolean;
}
