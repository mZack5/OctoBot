import http from 'http';
import { exportFile } from './fileLoader';
import { bot } from './bot';

const port = process.env.PORT || 5010;
let httpServer: http.Server;
let herokuPing: NodeJS.Timeout;

export function startTimers(): void {
   // create a http server that we can http get from our bot
   // so heroku doesnt disable the dyno from no traffic
   httpServer = http.createServer((_req, res): void => {
      res.end();
   }).listen(port);

   if (process.env.NODE_ENV === 'production') {
      // ping our dyno every 15 minutes so heroku doesnt murder it
      herokuPing = setInterval((): void => {
         http.get('https://botty-boi.herokuapp.com/');
      }, 900000);
   }
}

async function stopBot(doArchive?: boolean): Promise<void> {
   console.log('Goodbye!');
   httpServer.close();
   clearInterval(herokuPing);
   if (doArchive) {
      await exportFile(`${process.env.configFile}.json`, true);
   } else {
      await exportFile(`${process.env.configFile}.json`);
   }
   bot.destroy();
   return Promise.resolve();
}

process.on('SIGINT', async (): Promise<void> => {
   await stopBot();
   process.exit(0);
});

// only archive the database on sigterm
process.on('SIGTERM', async (): Promise<void> => {
   await stopBot();
   process.exit(0);
});
