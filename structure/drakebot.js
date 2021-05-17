const { Client, Collection, MessageEmbed } = require("discord.js");
const CronJob = require("cron").CronJob;
const chalk = require("chalk");
const fs = require("fs");
const util = require("util");
const path = require("path");
const moment = require("moment");

const readdir = util.promisify(fs.readdir);

class DrakeBot extends Client {

    constructor(option) {
        super(option);

        this.cfg = require("../config.json");
        this.emotes = require("../emojis.json");
		this.formater = require("../helpers/formater");
		this.functions = require("../helpers/functions");
		this.dashboard = require("../dashboard/app");
		this.shop = require("../shop.js");
		this.db = new (require('../database/postgres.js'))(this);

		this.cmds = new Collection();
		this.aliases = new Collection();
		this.mutedUsers = new Collection();

		this.snipe = {};
		this.numberGame = {};
		this.pool = this.db.pool;

		this.serverAdds = 0;
		this.serverRemoves = 0;
		this.commandsRun = 0;

		this.cache = {};
		this.cache.guilds = new Collection();
		this.cache.users = new Collection();
		this.cache.members = new Collection();
		this.cache.master = new Collection();
    };


    async init() {

		// Load the extenders
		require("../helpers/extenders");

		// Load the scheduled report with crown
		const scheduler = new CronJob("0 */60 * * * *", async () => {
			const dataClient = await this.db.findOrCreateClient();

			const embed = new MessageEmbed()
			.setAuthor("Au rapport !", "https://cdn.discordapp.com/attachments/769328286014111774/799357794536652880/calendar2.png")
			.setColor(this.cfg.color.green)
			.setDescription(`\`💻 Commandes éxécutés:\` **${this.commandsRun}** (Total:` + "  " + `**${dataClient.count}**) \n \n\`📊 Serveurs gagnés:\` **${this.serverAdds - this.serverRemoves}**` + "  " + `(**+${this.serverAdds}**, **-${this.serverRemoves}**)`)
			.setFooter(this.cfg.footer);

			this.serverAdds = 0;
			this.serverRemoves = 0;
			this.commandsRun = 0;

			await this.channels.cache.get("793941589113700392").send(embed);
		}, null, true, "Europe/Paris");
		scheduler.start();

		// Load the languages
        const languages = require("../helpers/lang");
        this.translations = await languages();

		// Load all commands
        const directories = await readdir("./commands/");
        directories.forEach(async (dir) => {
            const commands = await readdir("./commands/"+dir+"/");
            commands.filter((cmd) => cmd.split(".").pop() === "js").forEach((cmd) => {
                this.loadCommand("./commands/"+dir, cmd);
            });
        });
		
		// Load all events
        const evtFiles = await readdir("./events/");
        evtFiles.forEach((file) => {
            const eventName = file.split(".")[0];
            const event = new (require(`../events/${file}`))(this);
            console.log(chalk.magenta(`Event: '${chalk.bold(eventName)}' was succesfully loaded !`));
            this.on(eventName, (...args) => event.run(...args));
            delete require.cache[require.resolve(`../events/${file}`)];
		}); 
    };


    async loadCommand(commandPath, commandName) {
		try {
			const props = new(require(`.${commandPath}/${commandName}`))(this);
			console.log(chalk.cyan(`Command: '${chalk.bold(commandName)}' (${chalk.bold(props.help.category)}) was successfully loaded !`));
            props.settings.location = commandPath;
            if(props.init) props.init(this);
			this.cmds.set(props.help.name, props);
			props.help.aliases.forEach((alias) => {
				this.aliases.set(alias, props.help.name);
			});
		} catch (e) {
			return console.log((chalk.red`Command: '${chalk.bold(commandName)}' can't be load: ${e}`));
		};
	};
	
	async unloadCommand(commandPath, commandName) {
		let command;
		if(this.cmds.has(commandName)) {
			command = this.cmds.get(commandName);
		} else if(this.aliases.has(commandName)){
			command = this.cmds.get(this.aliases.get(commandName));
		}
		if(!command) return console.log((chalk.red`Command: '${chalk.bold(commandName)}' does not exist !`));
		if(command.shutdown) await command.shutdown(this);
		console.log(chalk.red(`Command: '${chalk.bold(commandName)}' was unloaded !`));
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return false;
    };

	convertTime(time, type, noPrefix, locale){
		if(!type) time = "to";
		if(!locale) locale = "fr-FR"
		const m = moment(time).locale("fr");
		return (type === "to" ? m.toNow(noPrefix) : m.fromNow(noPrefix));
	};

	async saveJSONFile(typeOrDir){
		return new Promise(async (resolve, reject) => {
			let data = null;

			if(typeOrDir === "config") {
				data = this.cfg;
				typeOrDir = "../config.json";
			} else {
				data = JSON.stringify(require(typeOrDir));
			};

			if(!data) reject("Error while loading the data of this file");

			await fs.writeFileSync(typeOrDir, data);

			resolve("Config successfully saved !");
		});
	};
};

module.exports = DrakeBot;