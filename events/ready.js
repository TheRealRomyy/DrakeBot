const checkUnmutes = require("../helpers/checkUnmutes.js");
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
      
      // Load the "unmuter" file
      checkUnmutes.init(client);

      // Load the "checkVoters" file
      checkVoters.init(client);

      // Load the cache
      await loader(client);
      setTimeout(async function() {
        await console.log(`Database Cache: All users (${client.cache.users.size} users), members (${client.cache.members.size} members) and guilds (${client.cache.guilds.size} guilds) are in cache !`);
      }, 3000);

      // Send in the "status" channel a message.
      this.client.channels.cache.get("793262294493560893").send("<:online:750782471423000647> Bot is ready !");

      // Create all activites
      let activities = [
        `${this.client.guilds.cache.size} guilds | ✨`,
        `💻 • v${this.client.cfg.version}`,
        `${this.client.users.cache.size} users | 👤`,
        `📚 • ${this.client.cmds.size} commandes`,
        `🌐 • ${this.client.cfg.dashboard.name}`,
        `📃 • ${this.client.cfg.prefix}help`
      ];

      // Load a scheduler who update status every 20 seconds
		  const botActivities = new CronJob("0/20 * * * * *", async () => {
        const activityname = activities[Math.floor(Math.random() * activities.length)];
        
        client.user.setPresence({
          activity: {
            name: activityname,
            type: "WATCHING"
        }});

      }, null, true, "Europe/Paris");

      const pikaploufColor = new CronJob("*/10   * * * *", async () => { // Every 10 minutes

        const colors = [
          `#001f3f`,
          `#0074D9`,
          `#7FDBFF`,
          `#39CCCC`,
          `#3D9970`,
          `#2ECC40`,
          `#01FF70`,
          `#FFDC00`,
          `#FF851B`,
          `#FF4136`,
          `#85144b`,
          `#F012BE`,
          `#B10DC9`,
          `#111111`,
          `#AAAAAA`,
          `#DDDDDD`,
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];

        this.client.guilds.cache.get("843933749434646568").roles.cache.get("843936630981001246").setColor(color);

      }, null, true, "Europe/Paris");
        
      botActivities.start();
      pikaploufColor.start();
	  };
};

module.exports = Ready;