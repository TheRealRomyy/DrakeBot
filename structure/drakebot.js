const { Client, Collection, MessageEmbed, Intents } = require("discord.js");
const CronJob = require("cron").CronJob;
const fs = require("fs");
const util = require("util");
const path = require("path");
const moment = require("moment");

const readdir = util.promisify(fs.readdir);

class DrakeBot extends Client {

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_INVITES,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.GUILD_PRESENCES
            ],
            partials: [ "REACTION", "MESSAGE", "CHANNEL", "GUILD_MEMBER", "USER" ],
            allowedMentions: {
                parse: ["users", "roles", "everyone"],
                repliedUser: true
            }
        });

        this.cfg = require("../config.json");
        this.emotes = require("../emojis.json");
		this.formater = require("../helpers/formater");
		this.functions = require("../helpers/functions");
		this.dashboard = require("../dashboard/app");
		this.shop = require("../shop.js");
		this.db = new (require("../database/postgres.js"))(this);
		this.antiraid = new (require("../antiraid/Manager"))(this)

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

		// Load the extenders, discord reply & discord buttons
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

			await this.channels.cache.get("793941589113700392").send({
                embeds: [embed]
            });
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
            console.log(`Event: '${eventName}' was succesfully loaded !`);
            this.on(eventName, (...args) => event.run(...args));
            delete require.cache[require.resolve(`../events/${file}`)];
		}); 
    };

	async synchronizeSlashCommands (guildID) {
        const commands = Array.from(this.cmds.filter((c) => c.slashCommandOptions).values());
        const fetchOptions = guildID && { guildId: guildID };

        try {
            const exisitingSlashCommands = await this.application.commands.fetch(fetchOptions);
            
            let createdCommands = exisitingSlashCommands.filter((slashCommand) => {
                return commands.some((c) => {
                    return c.slashCommandOptions.name === slashCommand.name
                        // TODO: implement comparison of options
                        // && JSON.stringify(c.slashCommandOptions.options) === JSON.stringify(slashCommand.options)
                        && c.slashCommandOptions.description === slashCommand.description;
                });
            });

            createdCommands = Array.from(createdCommands.values());

            for (const command of commands) {
                // if the command is already created
                if (createdCommands.some((slashCommand) => slashCommand.name === command.help.name)) continue;
                // otherwise create it
                if(guildID === "739217304935596100") console.log(`Creating ${command.help.name} slash command`);
                await this.application.commands.create(command.slashCommandOptions, guildID);
                createdCommands.push(command.slashCommandOptions);
            };
    
            for (const slashCommand of Array.from(exisitingSlashCommands.values())) {
                // if the command is not created
                if (!createdCommands.some((shouldBeCreatedSlashCommand) => shouldBeCreatedSlashCommand.name === slashCommand.name)) {
                    // delete it
                    if(guildID === "739217304935596100") console.log(`Deleting ${slashCommand.name} slash command`);
                    await this.application.commands.delete(slashCommand.id, guildID);
                };
            };
        } catch(error) {
            if(error.code === "50001") {
                const guild = this.guilds.cache.get(guildID);
                const guildOwner = this.users.cache.get(guild.ownerId);

                const invite = "https://discord.com/api/oauth2/authorize?client_id=762965943529766912&permissions=8&redirect_uri=https%3A%2F%2Fdrakebot.xyz&scope=bot%20applications.commands";
                guild.leave();

                try {
                    guildOwner.send({
                        content: "I just leaved your server `" + guild.name + "` because he doesn't allow me to use slashs commands. Please re-add me with this link : " + invite
                    });
                } catch(err) {
                    const channel = guild.channels.cache.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
                    channel.send({
                        content: "I just leaved your server `" + guild.name + "` because he doesn't allow me to use slashs commands. Please re-add me with this link : " + invite
                    });
                };
            } else console.error;
        };
    };


    async loadCommand(commandPath, commandName) {
		try {
			const props = new(require(`.${commandPath}/${commandName}`))(this);
			console.log(`Command: '${commandName}' (${props.help.category}) was successfully loaded !`);
            props.settings.location = commandPath;
            if(props.init) props.init(this);
			this.cmds.set(props.help.name, props);
			props.help.aliases.forEach((alias) => {
				this.aliases.set(alias, props.help.name);
			});
		} catch (e) {
			return console.error(`Command: '${commandName}' can't be load: ${e}`);
		};
	};
	
	async unloadCommand(commandPath, commandName) {
		let command;
		if(this.cmds.has(commandName)) {
			command = this.cmds.get(commandName);
		} else if(this.aliases.has(commandName)){
			command = this.cmds.get(this.aliases.get(commandName));
		}
		if(!command) return console.log(`Command: '${commandName}' does not exist !`);
		if(command.shutdown) await command.shutdown(this);
		console.log(`Command: '${commandName}' was unloaded !`);
		delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
		return false;
    };

	convertTime(time, type, noPrefix, locale){
		if(!type) time = "to";
		if(!locale) locale = "fr-FR"
		const m = moment(time).locale("fr");
		return (type === "to" ? m.toNow(noPrefix) : m.fromNow(noPrefix));
	};
};

module.exports = DrakeBot;