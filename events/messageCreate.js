const { MessageEmbed } = require("discord.js");
const { Guild } = require("../database/models.js");
const AutomodManager = require ("../antiraid/AutomodManager.js");
const Persos = require("../structure/Persos.js");
const Time = require("../helpers/timeManager.js");

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
        message.__proto__.time = new Time(message);
        
		if(message.content === `<@!${client.user.id}>` || message.content === `<@${client.user.id}>`) return message.drake("misc:HELLO", {
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

        /* TEMP ZONE */

        if(data.member.exptotal === null) data.member.exptotal = 0;
        if(data.guild.reactionroles === null) data.guild.reactionroles = new Array();
        if(data.guild.reactioncount === null) data.guild.reactioncount = 0;
        if(!data.guild.rolemoneycount) data.guild.rolemoneycount = 0;
        if(!data.guild.rolemoney) data.guild.rolemoney = [];
        if(!data.guild.plugins.autosanctions || !Array.isArray(data.guild.plugins.autosanctions)) data.guild.plugins.autosanctions = [];
        if(!data.guild.sanctioncase) data.guild.sanctioncase = 0;
        if(!data.member.ban) data.member.ban = {
            banned: false,
            case: null,
            endDate: null
        };

        if(data.guild.antiraid === null) data.guild.antiraid = Guild[13];

        /* END TEMP ZONE */

        await new AutomodManager(client, message, data).check();
        await updateXp(message, data);
        client.synchronizeSlashCommands(message.guild.id);

        if(message.content === "@someone") {
            const randomUser = message.guild.members.cache.random(1)[0].user;

            const someoneEmbed = new MessageEmbed()
                .setFooter("ID: " + randomUser.id)
                .setColor(client.cfg.color.blue)
                .setAuthor(randomUser.tag, randomUser.displayAvatarURL({dynamic:true}));
            
            message.reply({
                embeds: [someoneEmbed]
            })
        };

        if(message.content.includes("d!nath") || message.content.includes("d!bastien") || message.content.includes("d!thomas") || message.content.includes("d!oxam") || message.content.includes("d!antonin")) {
            const Perso = new Persos(client, message);
            return await Perso.run();
        };

        if(message.channel.id === data.guild.plugins.suggestions && !message.content.includes("--comment")) {            
            const embed = new MessageEmbed()
                .setTitle(message.drakeWS("general/suggest:TITLE"))
                .setColor("ORANGE")
                .setThumbnail("https://cdn.discordapp.com/attachments/759728705730773022/767132300290031676/light.png")
                .setDescription(message.content)
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                .setFooter(this.client.cfg.footer);

            let msg = await message.channel.send({
                embeds: [embed]
            });

            await message.delete().catch(() => {});
    
            await msg.react('✅');
            await msg.react('➖');
            await msg.react('❌');
        }

        const prefix = await client.functions.getPrefix(message, data);
        if(!prefix || message.content === prefix) return;

		const args = message.content.slice(typeof prefix === "string" ? prefix.length : 0).trim().split(/ +/g);
		const commandName = args.shift().toLowerCase();
        const cmd = client.cmds.get(commandName) || client.cmds.get(client.aliases.get(commandName));
        
        if(!cmd) {
			const customCommand = data.guild.customcommands.find((c) => c.name === commandName);
			if(customCommand && customCommand.response != ""){
                //Check si l'user est blacklist
                if(data.client.blacklist.users.includes(message.author.id)) return message.drake("errors:USER_BLACKLIST", {
                    emoji: "error"
                });
                //Check si la guild est blacklist
                if(data.client.blacklist.guilds.includes(message.guild.id)) return message.drake("errors:GUILD_BLACKLIST", {
                    emoji: "error"
                });  

				return message.channel.send({
                    content: customCommand.response
                });
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
            if(!cmd.settings.enabled) return message.drake("errors:DISABLED", {
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
                client.logger.command(message.guild.name, message.author.username, message.content);

                if(client.cfg.staff.support.includes(message.author.id) || client.cfg.staff.owner.includes(message.author.id)) {
                    const staffEmbed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
                    .setTimestamp()
                    .setFooter(message.author.id)
                    .setDescription(`**[CMD - ${client.cfg.staff.support.includes(message.author.id) ? "STAFF" : "OWNER"}]** Guild: \`${message.guild.name}\` (||${message.guild.id}||) => \`\`\`${message.content}\`\`\``)
                    .setColor("RANDOM");

                    client.channels.cache.get("793587196887040030").send({
                        embeds: [staffEmbed]
                    });
                } else {
                    const embed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
                    .setDescription(`**[CMD]** Guild: \`${message.guild.name}\` (||${message.guild.id}||) => \`\`\`${message.content}\`\`\``)
                    .setTimestamp()
                    .setFooter(message.author.id)
                    .setColor("RANDOM");
                    client.channels.cache.get('768125802423255051').send({
                        embeds: [embed]
                    });
                };
            } catch(err) {
                message.drake("misc:ERROR", {
                    cmd: commandName,
                    support: "https://discord.gg/Z7XyHzYmr7"
                });

                client.emit("error", err);
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

            const neededExp = 5 * (level ^ 2) + (50 * level) + 100;

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
                    .replace(/{user.nickname}/g, message.guild.members.cache.get(message.author.id).nickname !== null ? message.guild.members.cache.get(message.author.id).nickname : message.author.username)
                    .replace(/{level}/g, parseInt(level+1, 10))
                    .replace(/{xp}/g, data.member.exptotal);
                channel.send(tad);
                if(data.guild.plugins.levels.rankRewards) {
                    const roleReward = data.guild.plugins.levels.rankRewards.find((r) => r.level == parseInt(level+1, 10))
                    if(roleReward) message.member.roles.add(roleReward.rank).catch(() => {});
                };
            };
            await data.member.save(data.member);
        };
    };
};

module.exports = Message;