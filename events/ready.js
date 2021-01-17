const loader = require('../database/loader.js')
const checkUnmutes = require("../helpers/checkUnmutes.js");

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

      // Load the cache
      await loader(client)

      // Send in the "status" channel a message.
      this.client.channels.cache.get("793262294493560893").send("<:online:750782471423000647> Bot is ready !");

      // Set and clear the interval
      var interval;
      clearInterval(interval);

      //Update the game every 20s
      interval = setInterval(() => {
          
        let activities = [
          `${this.client.guilds.cache.size} guilds | ✨`,
          `💻 • v${this.client.cfg.version}`,
          `${this.client.users.cache.size} users | 👤`,
          `📚 • ${this.client.cmds.size} commandes`,
          `🌐 • ${this.client.cfg.dashboard.name}`,
          `📃 • ${this.client.cfg.prefix}help`
        ];
        
        const activityname = activities[Math.floor(Math.random() * activities.length)];
        
        client.user.setPresence({
          activity: {
            name: activityname,
            type: "WATCHING"
          }
        });
      }, 25000);
	};
};

module.exports = Ready;