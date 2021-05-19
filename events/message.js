const { MessageEmbed } = require("discord.js");
const Persos = require("../structure/Persos.js");
const chalk = require("chalk");
const moment = require("moment");

const xpCooldown = {};
const cmdCooldown = {};

class Message {

	constructor(client) {
		this.client = client;
    };

	async run(message) {

        const client = this.client;

        if(message.author.bot || !message.guild || !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

        const data = {
            user: await this.client.db.findOrCreateUser(message.author),
            member: await this.client.db.findOrCreateMember(message.author, message.guild),
            guild: await this.client.db.findOrCreateGuild(message.guild),

            client: await this.client.db.findOrCreateClient(),
            cfg: this.client.cfg,
        };

        message.guild.data = data.guild;

        message.__proto__.time = {

            convertMS(ms) {
                const absoluteSeconds = Math.floor((ms / 1000) % 60);
                const absoluteMinutes = Math.floor((ms / (1000 * 60)) % 60);
                const absoluteHours = Math.floor((ms / (1000 * 60 * 60)) % 24);
                const absoluteDays = Math.floor(ms / (1000 * 60 * 60 * 24));
                
            const d = absoluteDays
                ? absoluteDays === 1
                    ? message.drakeWS("time:ONE_DAY")
                    : message.drakeWS("time:DAYS", { amount: absoluteDays })
                : null;
            const h = absoluteHours
                ? absoluteHours === 1
                    ? message.drakeWS("time:ONE_HOUR")
                    : message.drakeWS("time:HOURS", { amount: absoluteHours })
                : null;
            const m = absoluteMinutes
                ? absoluteMinutes === 1
                    ? message.drakeWS("time:ONE_MINUTE")
                    : message.drakeWS("time:MINUTES", { amount: absoluteMinutes })
                : null;
            const s = absoluteSeconds
                ? absoluteSeconds === 1
                    ? message.drakeWS("time:ONE_SECOND")
                    : message.drakeWS("time:SECONDS", { amount: absoluteSeconds })
                : null;
            const ams = ms
            ? ms === 1
                ? message.drakeWS("time:ONE_MILISECOND")
                : message.drakeWS("time:MILISECONDS", { amount: ms })
            : null;
        
                const absoluteTime = [];
                if (d) absoluteTime.push(d);
                if (h) absoluteTime.push(h);
                if (m) absoluteTime.push(m);
                if (s) absoluteTime.push(s);
                if (absoluteTime.length === 0) absoluteTime.push(ams);
        
                return absoluteTime.join(", ");
            },

            printDate(date, format, locale){
                if(!locale) locale = "fr-FR"
                if(!format) format = "Do MMMM YYYY";
                return moment(new Date(date)).locale("fr").format(format);
            },

            printDateFrom(date, format, locale){
                if(!locale) locale = "fr-FR"
                if(!format) format = "Do MMMM YYYY";
                moment.locale("fr");
                return moment.utc(date).startOf('hour').fromNow();
            }
        };
        
		if(message.content == "<@!" + client.user.id + ">") return message.drake("misc:HELLO", {
            user: message.author.username,
            prefix: data.guild.prefix,
            emoji: "info"
        });

        if(data.user.afk !== null){
            data.user.afk = null;
            await data.user.save();
            message.drake("general/afk:DELETED", {
                username: message.author.username,
                emoji: "afk"
            });
        };

        message.mentions.users.forEach(async (user) => {
            const mentionnedData = await client.db.findOrCreateUser(user);
            if(mentionnedData.afk !== null && !message.content.startsWith(this.client.cfg.prefix)) message.drake("general/afk:AFK", {
                    username: user.username,
                    reason: mentionnedData.afk,
                    emoji: "afk"
            });
        });

        if(data.guild.plugins.automod.antiMajs.enabled && !message.member.hasPermission("MANAGE_MESSAGES")) {
            let max = Math.round(message.content.length / 1.5);
            let count = 0;
            let majs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
            for(let i = message.content.length; i >- 1; i--) {
                if(majs.indexOf(message.content[i]) !== -1) {
                   count++;
                };
            };
    
            if(count >= max) {
                message.delete();
                client.functions.warn(message.member, message, client.user, data.guild, message.drakeWS("misc:FULLMAJ"), data.member, client);
            }; 
        };

        if(data.guild.plugins.automod.antiBadwords.enabled && !message.member.hasPermission("MANAGE_MESSAGES")) {
            let infraction = false;
            await client.cfg.badwords.forEach((word) => {
                if(message.content.includes(word)) infraction = true;
            });

            if(infraction == true) {
                message.delete();
                client.functions.warn(message.member, message, client.user, data.guild, message.drakeWS("misc:BADWORDS"), data.member, client);
            }
        };

        if(data.guild.plugins.automod.antiPub.enabled && !message.member.hasPermission("MANAGE_MESSAGES") && (message.content.includes("http://") || message.content.includes("https://") || message.content.includes("discord.gg") || message.content.includes(".gg/"))) {
            message.delete();
            client.functions.warn(message.member, message, client.user, data.guild, message.drakeWS("misc:PUB"), data.member, client);
        };

        if(data.member.exptotal === null) data.member.exptotal = 0;
        if(data.guild.reactionroles === null) data.guild.reactionroles = new Array();
        if(data.guild.reactioncount === null) data.guild.reactioncount = 0;

        await updateXp(message, data);

        const prefix = data.guild.prefix;
        if(!message.content.startsWith(prefix) || message.content === prefix) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const commandName = args.shift().toLowerCase();
        const cmd = client.cmds.get(commandName) || client.cmds.get(client.aliases.get(commandName));

        if(message.content.includes("d!nath") || message.content.includes("d!bastien") || message.content.includes("d!thomas") || message.content.includes("d!oxam") || message.content.includes("d!antonin")) {
            const Perso = new Persos(client, message);
            return await Perso.run();
        };
        
        if(!cmd) {
			const customCommand = data.guild.customcommands.find((c) => c.name === commandName);
			if(customCommand){
                //Check si l'user est blacklist
                if(data.client.blacklist.users.includes(message.author.id)) return message.drake("errors:USER_BLACKLIST", {
                    emoji: "error"
                });
                //Check si la guild est blacklist
                if(data.client.blacklist.guilds.includes(message.guild.id)) return message.drake("errors:GUILD_BLACKLIST", {
                    emoji: "error"
                });  

				return message.channel.send(customCommand.response);
            };
		} else {

            // if(cmd.help.category === "Economy" && !client.cfg.staff.support.includes(message.author.id) && !client.cfg.staff.owner.includes(message.author.id)) return message.channel.send(`${client.emotes.status.idle} **L'économie est actuellement en maintenance !** \n \nRejoignez le support (https://discord.gg/mYDdTbx) pour savoir quand elle sera redisponible !`);

            // Check si l'user est blacklist
            if(data.client.blacklist.users.includes(message.author.id)) return message.drake("errors:USER_BLACKLIST", {
                emoji: "error"
            });

            // Check si la guild est blacklist
            if(data.client.blacklist.guilds.includes(message.guild.id)) return message.drake("errors:GUILD_BLACKLIST", {
                emoji: "error"
            });

            // Check si la commande est activée
            if(cmd.settings.enabled === false) return message.drake("errors:DISABLED", {
                emoji: "error"
            });

            // Check si le bot est en maintenance
            if(!client.cfg.enabled && !client.cfg.staff.owner.includes(message.author.id)) return message.channel.send(client.emotes["error"] + " **Le bot est actuellement en maintenance !**")

            // Check les "bot Perms"
            if(cmd.settings.botPerms) {
                let neededPerms = [];

                if(!cmd.settings.botPerms.includes("EMBED_LINKS") && !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) neededPerms.push(message.drakeWS("discord_errors:EMBED_LINKS"));

                await cmd.settings.botPerms.forEach((perm) => {
                    if(!message.channel.permissionsFor(message.guild.me).has(perm)) neededPerms.push(message.drakeWS(`discord_errors:${perm.toUpperCase()}`));
                });

                if(neededPerms.length > 1) {
                    return message.drake("errors:BOT_PERMISSIONS", {
                        perms: neededPerms.map((p) => `\`${p}\``).join(", "),
                        emoji: "error"
                    });
                } else if(neededPerms.length == 1){
                    return message.drake("errors:BOT_PERMISSION", {
                        perm: "`" + neededPerms[0] + "`",
                        emoji: "error"
                    });
                };
            };

            // Check les "user Perms"
            if(cmd.settings.userPerms) {
                let neededPerms = [];

                await cmd.settings.userPerms.forEach((perm) => {
                    if(!message.channel.permissionsFor(message.member).has(perm) && !client.cfg.staff.owner.includes(message.author.id)) neededPerms.push(message.drakeWS(`discord_errors:${perm.toUpperCase()}`));
                });

                if(neededPerms.length > 1) {
                    return message.drake("errors:PERMISSIONS", {
                        perms: neededPerms.map((p) => `\`${p}\``).join(", "),
                        emoji: "error"
                    });
                } else if(neededPerms.length == 1){
                    return message.drake("errors:PERMISSION", {
                        perm: "`" + neededPerms[0] + "`",
                        emoji: "error"
                    });
                };
            };

            // Check les "restrictions"
            if(cmd.settings.restriction) {

                const rest = cmd.settings.restriction;

                if(rest.includes("OWNER") && !client.cfg.staff.owner.includes(message.author.id)) return message.drake("errors:PERMISSION", {
                    emoji: "error",
                    perm: "`" + message.drakeWS("discord_errors:BOT_OWNER") + "`"
                });

                if(rest.includes("MODERATOR") && (!client.cfg.staff.support.includes(message.author.id) && !client.cfg.staff.owner.includes(message.author.id))) return message.drake("errors:PERMISSION", {
                    emoji: "error",
                    perm: "`" + message.drakeWS("discord_errors:BOT_MODERATOR") + "`"
                });

                if(rest.includes("NFSW") && !message.channel.nfsw) return message.drake("errors:NFSW", {
                    emoji: "error"
                });
            };

            // Check le cooldown
            let uCooldown = cmdCooldown[message.author.id];
            if(!uCooldown){
                cmdCooldown[message.author.id] = {};
                uCooldown = cmdCooldown[message.author.id];
            };
            const time = uCooldown[cmd.help.name] || 0;
            if(time && (time > Date.now())){
                return message.drake("errors:COOLDOWN", {
                    timeH: Math.ceil((time-Date.now())/1000) + "s",
                    emoji: "time"
                });
            };
            
            try{

                // Cooldown
                if(!client.cfg.staff.owner.includes(message.author.id)) cmdCooldown[message.author.id][cmd.help.name] = Date.now() + (cmd.settings.cooldown ? (cmd.settings.cooldown * 1000) : 3000);

                // Enregistrer dans le nombre de commandes
                data.client.count++;
                client.commandsRun++;
                
                await data.client.save();
                
                // Run
                cmd.run(message, args, data)//.catch(error => client.functions.sendErrorCmd(client, message, cmd.help.name, error));

                // Log
                console.log(chalk.blueBright(`[${new Date().toLocaleTimeString()}] [CMD] Guild: ${chalk.bold(message.guild.name)} | Author: ${chalk.bold(message.author.username)} => ${chalk.bold(message.content)}`));

                if(client.cfg.staff.support.includes(message.author.id) || client.cfg.staff.owner.includes(message.author.id)) {
                    const staffEmbed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
                    .setTimestamp()
                    .setFooter(message.author.id)
                    .setDescription(`**[CMD - ${client.cfg.staff.support.includes(message.author.id) ? "STAFF" : "OWNER"}]** Guild: \`${message.guild.name}\` (||${message.guild.id}||) => \`\`\`${message.content}\`\`\``)
                    .setColor("RANDOM");

                    client.channels.cache.get("793587196887040030").send(staffEmbed);
                } else {
                    const embed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
                    .setDescription(`**[CMD]** Guild: \`${message.guild.name}\` (||${message.guild.id}||) => \`\`\`${message.content}\`\`\``)
                    .setTimestamp()
                    .setFooter(message.author.id)
                    .setColor("RANDOM");
                    client.channels.cache.get('768125802423255051').send(embed);
                };
            } catch(err) {
                client.functions.sendErrorCmd(client, message, cmd.help.name, err);
            };
        };

        async function updateXp(msg, data) {

            if(!data.guild.plugins.levels.enabled) return;

            const actualExp = parseInt(data.member.exp);
            const level = parseInt(data.member.level);
        
            const cooldown = xpCooldown[msg.author.id];
            if(cooldown && cooldown > Date.now()) return;

            const toWait = Date.now() + 7500;
            xpCooldown[msg.author.id] = toWait; 
            
            const wonExp = Math.floor(Math.random() * ( Math.floor(5) - Math.ceil(2))) + Math.ceil(2);
            const newExp = actualExp + wonExp;

            const neededExp = 7 * (level * level) + 80 * level + 100;

            data.member.exp += wonExp;
            data.member.exptotal += wonExp;
        
            if(newExp >= neededExp) {
                let channel = null;
                data.member.level = parseInt(level + 1, 10);
                data.member.exp = 0;
                if(data.guild.plugins.levels.channel == "current") channel = message.channel;
                channel = message.guild.channels.cache.get(data.guild.plugins.levels.channel);
                if(!channel) channel = message.channel;
                const tad = data.guild.plugins.levels.message
                    .replace(/{user}/g, message.author)
                    .replace(/{user.nickname}/g, message.guild.member(message.author).nickname !== null ? message.guild.member(message.author).nickname : message.author.username)
                    .replace(/{level}/g, parseInt(level+1, 10))
                    .replace(/{xp}/g, data.member.exptotal);
                channel.send(tad);
                if(data.guild.plugins.levels.rankRewards) {
                    const roleReward = data.guild.plugins.levels.rankRewards.find((r) => r.level == parseInt(level+1, 10))
                    if(roleReward) message.member.roles.add(roleReward.rank).catch(() => {});
                };
            };
            await data.member.save().catch(error => console.log("Error: " + error));
        };
    };
};

module.exports = Message;