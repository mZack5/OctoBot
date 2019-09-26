export function checkRequired(): boolean {
   if (process.env.discordToken
      && process.env.botOwner
      && process.env.digitalToken
      && process.env.cloudToken
      && process.env.cloudEmail
      && process.env.configFile
      && process.env.dbChannel
      && process.env.loggingChannel
      && process.env.errorsChannel) {
      return true;
   }
   return false;
}
