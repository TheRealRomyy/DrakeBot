const checkAutoSanctions = require("../helpers/checkAutoSanctions.js");
const checkVoters = require("../helpers/checkVoters.js");
const loader = require("../database/loader.js");

const CronJob = require("cron").CronJob;

class Ready {

	constructor(client) {
		this.client = client;
	};

	async run() {

      const client = this.client;

      console.log(`================= \n${this.client.user.username} is ready ! (${this.client.user.id}) \nAt ${this.client.guilds.cache.size} guilds \n=================`);

      // Start the dashboard
      if(client.cfg.dashboard.enabled) client.dashboard.load(client);

      // Load the "autoSanctions" file
      checkAutoSanctions.checkUnbans(client);
      checkAutoSanctions.checkUnmutes(client);

      // Load the "checkVoters" file
      checkVoters.init(client);

      // Send stats on top.gg
      client.functions.sendServerCount(this.client);

      // Load the cache
      await loader(client);
      setTimeout(async function() {
        await client.logger.log(`Cache: All users (${client.cache.users.size} users), members (${client.cache.members.size} members) and guilds (${client.cache.guilds.size} guilds) are in cache !`);
      }, 1500);
 

      // Send in the "status" channel a message.
      this.client.channels.cache.get("793262294493560893").send({
        content:"<:online:750782471423000647> Bot is ready !"
      });

      // Create all activites
      let possibleActivities = [
        `${this.client.guilds.cache.size} guilds | ✨`,
        `💻 • v${this.client.cfg.version}`,
        //`${this.client.users.cache.size} users | 👤`,
        `📚 • ${this.client.cmds.size} commandes`,
        `🌐 • ${this.client.cfg.dashboard.name}`,
        `📃 • ${this.client.cfg.prefix}help`
      ];

      // Load a scheduler who update status every 20 seconds
		  const botActivities = new CronJob("0/20 * * * * *", async () => {
        const activityname = possibleActivities[Math.floor(Math.random() * possibleActivities.length)];
        
        client.user.setPresence({
          status: "online",
          activities: [{
            name: activityname,
            type: "WATCHING"
          }]
        });

      }, null, true, "Europe/Paris");
        
      botActivities.start();
	  };
};

module.exports = Ready;