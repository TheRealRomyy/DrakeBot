const { MessageEmbed } = require("discord.js");
const cfg = require("../config.json");
const emojis = require("../emojis.json");
const ms = require("ms");
const fs = require("fs")
const moment = require("moment");
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');

module.exports = {

	/** 
	 * Send a random integer
	 * @param { Number } min
	 * @param { Number } max
	 * @return { Number } random integer
	*/

    getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	},
	
	/**
	 * Convert a date from unixtime to date format.
	 * @param { Number } date 
	 * @param { String } format 
	 * @param { String } locale
	 * @return { String } date
	 */
    
    printDate(date, format, locale){
        if(!locale) locale = "fr-FR"
        if(!format) format = "Do MMMM YYYY";
        return moment(new Date(date)).locale("fr").format(format);
	},
	
	/**
	 * Convert a date from unixtime to time elapsed for now.
	 * @param { Number } date 
	 * @param { String } format 
	 * @param { String } locale
	 * @return { String } time elapsed from date
	 */

	printDateFrom(date, format, locale){
		if(!locale) locale = "fr-FR"
		if(!format) format = "Do MMMM YYYY";
		moment.locale("fr");
		return moment.utc(date).startOf('hour').fromNow();
	},

	/**
	 * Send an error
	 * @param { Object } client 
	 * @param { String } message 
	 * @param { String } cmd 
	 * @param { String } error 
	*/
    
    sendErrorCmd(client, message, cmd, error) {
        let devDM = client.users.cache.get('709481084286533773');

        message.drake("errors:SERVER_SEND", {
            emoji: "error"
        })

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("errors:OWNER_SEND:title", {
            cmd,
            emoji: "bug"
        }))
        .setDescription(message.drakeWS("errors:OWNER_SEND:desc", {
            error
        }))
        .setAuthor(message.author.username, message.author.displayAvatarURL( { dynamic: true }))
        .setColor(client.cfg.color.red)

        devDM.send({
			embeds: [embed]
		})
    },

	/**
	 * Send a message to hastebin
	 * @param { String } content
	 * @return { String } hastebin url
	*/

	async hastebin(content) {
		const res = await fetch("https://hastebin.com/documents", {
			method: "POST",
			body: content,
			headers: { "Content-Type": "text/plain" }
		});

		let url = null;
		const json = await res.json();
		if(!json.key){
			return;
		} else {
			url = "https://hastebin.com/" + json.key + ".js";
		};
	
		return url;
	},

	/**
	 * Get a color for the ping
	 * @param { Number } ms 
	 * @return { String } emoji
	 */

	getPingColor(ms) {
		if(ms > 500) {
			return "<:dnd:750782449168023612>";
		} else if(ms > 200) {
			return "<:idle:750782527626543136>";
		} else {
			return "<:online:750782471423000647>";
		};
	},

	/**
	 * Get daily drakecoin price
	 * @return { int } drakecoin price (in percent)
	*/

	getDailyDrakecoinPrice() {
		let price = this.getRandomInt(-1, 1);

		if(price > 0) {
			return price;
		} else {
			price = this.getRandomInt(-25, 25);
			return price;
		};
	},

	/**
	 * Send a message when someone is sanctionned
	 * @param { Object } user 
	 * @param { String } type 
	 * @param { String } reason 
	 * @param { Number } duration 
	*/

	sendSanctionMessage(message, type, user, reason, duration) {
		const embed = new MessageEmbed()
		.setAuthor(user.tag + " " + message.drakeWS(`misc:${type.toUpperCase()}_MSG`), user.displayAvatarURL({ dynamic: true }))
		.setFooter(cfg.footer)
		.setColor(type.includes("un") ? cfg.color.green : (type == "warn" ? cfg.color.orange : (type == "ban" ? cfg.color.red : (type == "mute" ? cfg.color.purple : cfg.color.blue)))) // Franchement dégeulasse mais flemme
		if(reason) embed.setDescription(emojis[type] + ` \`Reason:\` ${reason} ${duration ? `\n\`Duration:\` ${duration}` : ""}`)
		if(type === "mute" && (!reason && reason === message.drakeWS("misc:NO_REASON"))) embed.setDescription(emojis[type] + ` \`Duration:\` ${duration}`)

		message.channel.send({
			embeds: [embed]
		})
	},

	/**
	 * Send a message in the mod log channel when a moderationa action is done
	 * @param { String } type 
	 * @param { Object } user 
	 * @param { Object } channel 
	 * @param { String } moderator 
	 * @param { String } reason 
	 * @param { Number } duration 
	*/

	sendModLog(type, user, channel, moderator, cases, reason, duration) {

		const embed = new MessageEmbed()
		.setTitle(`${emojis[type]} ${this.pretify(type)}${cases && cases !== null ? " #" + cases : ""}`)
		.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
		.addField("**Moderator:**", "`" + moderator.tag + "`")
		.setFooter(`User ID: ${user.id}・${this.getDate()}`)
		.setColor(type.includes("un") ? cfg.color.green : cfg.color.orange)
		if(reason) embed.addField("**Reason:**", "`" + reason + "`")
		if(duration) embed.addField("**Duration:**", "`" + duration + "`")

		channel.send({
			embeds: [embed]
		});
	},

	/**
	 * Make a text more pretty
	 * @param { String } text 
	 * @return { String } text pretyfied
	*/

	pretify(text) {
		let firstLetter = text[0].toUpperCase();
		let textWithoutLetter = text.slice(1).toLowerCase();

		return firstLetter + textWithoutLetter;
	},

	/**
	 * Get the date
	 * @return { String } date 
	*/

	getDate() {
		const date = new Date();

		return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
	},

	/**
	 * Convert letter to number or number to letter
	 * @param { String } type
	 * @param { String } string
	 * @return { String } conversion 
	*/

	numberLetterConverter(type, string) {
		let letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

		if(type === "ntl") {
			if(isNaN(string) || parseInt(string) > 26 || 0 > parseInt(string)) return "Error";

			return letters[parseInt(string) - 1];
		} else if(type === "ltn") {

			return letters.indexOf(string.toLowerCase()) + 1;
		} else {
			return "Error";
		};
	},

	/**
	 * Cast number to number with letter
	 * @param { Number } number
	 * @return { String } number 
	*/

	convertNumber(number) {
		if(number == "1") return "one";
		if(number == "2") return "two";
		if(number == "3") return "three";
	},

	/**
	 * Warn an user
	 * @param { Object } member 
	 * @param { Object } message 
	 * @param { Object } moderator 
	 * @param { Object } guildData 
	 * @param { String } reason 
	 * @param { Object } memberData 
	 * @param { Object } client 
	*/

	async warn(member, message, moderator, guildData, reason, memberData, client) {

		let logReason = false;

		if(reason === message.drakeWS("misc:PUB") || reason === message.drakeWS("misc:BADWORDS") || reason === message.drakeWS("misc:FULLMAJ")) logReason = true;

		await member.send({
			content: message.drakeWS("moderation/warn:WARN_DM", {
				emoji: "warn",
				username: member.user.username,
				server: message.guild.name,
				moderator: moderator.tag,
				reason
			})
		}).catch(() => {});

		guildData.cases++;
		guildData.save(guildData);

		const caseInfo = {
			moderator: moderator.id,
			date: Date.now(),
			type: "warn",
			case: guildData.cases,
			reason: reason,
		};
		
		memberData.sanctions.push(caseInfo);
		memberData.save(memberData);

		if(guildData.plugins.logs.mod) {
			if(!client.channels.cache.get(guildData.plugins.logs.mod)) {
				guildData.plugins.logs.mod = false;
				await guildData.save(guildData)
			};

			this.sendModLog("warn", member.user, client.channels.cache.get(guildData.plugins.logs.mod), moderator, guildData.cases, logReason ? reason + `\n(${message.content})`: reason);
		};

		return this.sendSanctionMessage(message, "warn", member.user, reason)
	},

	/**
	 * Check auto sanctions
	 * @param { Object } guildData 
	 * @param { Object } member 
	 * @param { Object } memberData 
	 * @param { Object } message 
	 * @param { Object } client 
	*/

	async checkAutoSanctions(guildData, member, memberData, message, client) {

		const reason = "Auto Sanction";

		const autoSanctions = guildData.autosanction;
        if(autoSanctions.length === 0) return;

        const userWarns = memberData.sanctions.filter(sanction => sanction.type === "warn");

        autoSanctions.forEach(sanction => {

            let warnsInTime = 0;

            userWarns.forEach(sanctionOfUser => {
				if(sanctionOfUser.date < (Date.now() + sanction.time)) warnsInTime++;
			});

            if(warnsInTime === sanction.warns) {
                switch(parseInt(sanction.sanction)) {
                    case 1:
						this.mute(member, message, client.user, guildData, reason, memberData, client, sanction.timeOfSanction)
                        break;
                    case 2:
						this.kick(member, message, client.user, guildData, reason, memberData, client)
                        break;
                    case 3:
						this.softban(member.user, message, client.user, guildData, reason, memberData, client)
                        break;
                    case 4:
						this.ban(member.user, message, client.user, guildData, reason, memberData, client)
                        break;
                    default:
                        throw new Error("Default case in switch"); // Pas d'idée de nom pour l'erreur
                };
            };
        });
	},

	/**
	 * Mute an user
	 * @param { Object } member 
	 * @param { Object } message 
	 * @param { Object } moderator 
	 * @param { Object } guildData 
	 * @param { String } reason 
	 * @param { Object } memberData 
	 * @param { Object } client 
	 * @param { Number } time 
	*/

	async mute(member, message, moderator, guildData, reason, memberData, client, time) {
		let muteRole = message.guild.roles.cache.find(r => r.name === 'Drake - Mute');

		if(!muteRole) {
			muteRole = await message.guild.roles.create({
				name: 'Drake - Mute',
				color: '#000',
				permissions: [],
				reason: "Setup mute DrakeBot"
			});
	
			message.guild.channels.cache.forEach(async (channel, id) => {
				await channel.permissionOverwrites.edit(muteRole, {
					SEND_MESSAGES: false,
					ADD_REACTIONS: false,
					CONNECT: false
				});
			});
		};

		await member.roles.add(muteRole);

		member.send({
			content: message.drakeWS("moderation/mute:MUTE_DM", {
				emoji: "mute",
				username: member.user.username,
				server: message.guild.name,
				moderator: moderator.tag,
				time: message.time.convertMS(time),
				reason: reason,
			})
		}).catch(() => {});;

		this.sendSanctionMessage(message, "mute", member.user, reason, message.time.convertMS(time))

		guildData.cases++;

		const caseInfo = {
			moderator: moderator.id,
			date: Date.now(),
			type: "mute",
			case: guildData.cases,
			reason: reason,
			time: ms(time),
		};

		memberData.mute.muted = true;
		memberData.mute.endDate = Date.now() + time;
		memberData.mute.case = guildData.cases;
		memberData.sanctions.push(caseInfo);

		if(guildData.plugins.logs.mod) {
			if(!client.channels.cache.get(guildData.plugins.logs.mod)) {
				guildData.plugins.logs.mod = false;
				await guildData.save(guildData)
			};

			this.sendModLog("mute", member.user, client.channels.cache.get(guildData.plugins.logs.mod), moderator, guildData.cases, reason, message.time.convertMS(time));
		};

		await client.mutedUsers.set(`${member.id}${message.guild.id}`, memberData);
		
		await memberData.save(memberData);
		await guildData.save(guildData);
	},

	/**
	 * Kick an user
	 * @param { Object } member 
	 * @param { Object } message 
	 * @param { Object } moderator 
	 * @param { Object } guildData 
	 * @param { String } reason 
	 * @param { Object } memberData 
	 * @param { Object } client 
	*/

	async kick(member, message, moderator, guildData, reason, memberData, client) {
		await member.send({
			content: message.drakeWS("moderation/kick:KICK_DM", {
				emoji: "door",
				username: member.user.username,
				server: message.guild.name,
				moderator: moderator.tag,
				reason
			})
		}).catch(() => {});

		await member.kick(message.drakeWS("moderation/kick:LOG", {
			moderator: moderator.username,
			reason
		})).catch(() => {
			return message.drake("moderation/kick:NOT_KICKABLE", {
				emoji: "error"
			});
		});

		guildData.cases++;
		await guildData.save(guildData);

		const caseInfo = {
			moderator: moderator.id,
			date: Date.now(),
			type: "kick",
			case: guildData.cases,
			reason: reason,
		};
		
		memberData.sanctions.push(caseInfo);
		memberData.save(memberData);

		if(guildData.plugins.logs.mod) {
			if(!client.channels.cache.get(guildData.plugins.logs.mod)) {
				guildData.plugins.logs.mod = false;
				await guildData.save(guildData)
			};

			this.sendModLog("kick", member.user, client.channels.cache.get(guildData.plugins.logs.mod), moderator, guildData.cases, reason);
		};

		return this.sendSanctionMessage(message, "kick", member.user, reason)
	},

	/**
	 *  Ban an user
	 * @param { Object } member 
	 * @param { Object } message 
	 * @param { Object } moderator 
	 * @param { Object } guildData 
	 * @param { String } reason 
	 * @param { Object } memberData 
	 * @param { Object } client 
	*/

	async ban(user, message, moderator, guildData, reason, memberData, client) {
		let logReason = message.drakeWS("moderation/ban:LOG", {
            moderator: moderator.username,
            reason
        });

		await user.send({
			content: message.drakeWS("moderation/ban:BAN_DM", {
				emoji: "ban",
				username: user.username,
				server: message.guild.name,
				moderator: moderator.tag,
				reason
			})
		}).catch(() => {});

		await message.guild.members.ban(user, { reason: logReason } ).then(() => {
			guildData.cases++;
			guildData.save(guildData);

			const caseInfo = {
				moderator: moderator.id,
				date: Date.now(),
				type: "ban",
				case: guildData.cases,
				reason: reason,
			};
			
			if(memberData !== null) {
				memberData.sanctions.push(caseInfo);
				memberData.save(memberData);
			} else {
				console.error("Memberdata == null");
			};

			if(guildData.plugins.logs.mod) {
				if(!client.channels.cache.get(guildData.plugins.logs.mod)) {
					guildData.plugins.logs.mod = false;
				};

				this.sendModLog("ban", user, client.channels.cache.get(guildData.plugins.logs.mod), moderator, guildData.cases, reason);
			};
			
			return this.sendSanctionMessage(message, "ban", user, reason)
		}).catch((error) => {
			this.sendErrorCmd(client, message, "ban", error);
		});

		await guildData.save(guildData)
	},

	/**
	 *  Softban an user
	 * @param { Object } member 
	 * @param { Object } message 
	 * @param { Object } moderator 
	 * @param { Object } guildData 
	 * @param { String } reason 
	 * @param { Object } memberData 
	 * @param { Object } client 
	*/

	async softban(user, message, moderator, guildData, reason, memberData, client) {
		let logReason = message.drakeWS("moderation/ban:LOG", {
            moderator: moderator.username,
            reason
        });

		await user.send({
			content: message.drakeWS("moderation/ban:BAN_DM", {
				emoji: "ban",
				username: user.username,
				server: message.guild.name,
				moderator: moderator.tag,
				reason
			})
		}).catch(() => {});

		await message.guild.members.ban(user, { reason: logReason } ).then(async () => {

			await message.guild.bans.fetch().then(bans => {
                let banUser = bans.find(b => b.user.id == m.user.id);
                message.guild.members.unban(banUser.user, `${client.user.tag} | ` + reason);
            });

			guildData.cases++;
			guildData.save(guildData);

			const caseInfo = {
				moderator: moderator.id,
				date: Date.now(),
				type: "ban",
				case: guildData.cases,
				reason: reason,
			};
			
			if(memberData !== null) {
				memberData.sanctions.push(caseInfo);
				memberData.save(memberData);
			} else {
				console.error("Memberdata == null");
			};

			if(guildData.plugins.logs.mod) {
				if(!client.channels.cache.get(guildData.plugins.logs.mod)) {
					guildData.plugins.logs.mod = false;
				};

				this.sendModLog("softban", user, client.channels.cache.get(guildData.plugins.logs.mod), moderator, guildData.cases, reason);
			};
			
			return this.sendSanctionMessage(message, "softban", user, reason)
		}).catch((error) => {
			this.sendErrorCmd(client, message, "softban", error);
		});

		await guildData.save(guildData)
	},

	/**
	 * Get all files of a dir (from https://coderrocketfuel.com/article/get-the-number-of-files-in-a-directory-using-node-js)
	 * @param { String } dirPath 
	 * @return { Array } files
	*/

	async getAllDirFiles(dirPath, arrayOfFiles) {
		files = fs.readdirSync(dirPath);
	  
		arrayOfFiles = arrayOfFiles || [];
	  
		files.forEach(function(file) {
			arrayOfFiles.push(file);
		});
	  
		return arrayOfFiles;
	},

	/**
	 * Send server count to top.gg
	 * @param { Number } serverCount 
	*/

	async sendServerCount(client) {
		const headers =  { 
			"content-type": "application/json", 
			"Authorization": client.cfg.api.dbl.token 
		};

		const res = await fetch("https://top.gg/api/bots/stats", {
			method: "POST",
			headers,
			body: JSON.stringify({
				server_count: client.guilds.cache.size,
			}),
		});

		const json = await res.json();

		if (!res.error) client.logger.log("Top.gg: Stats successfully posted.");
		else client.logger.error("Top.gg: Stats cannot be posted. Error: " + json.error);
	},

	/**
	 * Get the bot prefix which is used
	 * @param { Object } message 
	 * @param { Object } data  
	*/

	async getPrefix (message, data) {
		const prefixes = [
			`<@!${message.client.user.id}> `,
			`<@${message.client.user.id}> `,
			message.client.user.username.toLowerCase(),
			data.guild.prefix
		];

		let prefix = null;

		prefixes.forEach((p) => {
			if(message.content.startsWith(p) || message.content.toLowerCase().startsWith(p)) prefix = p;			
		});
		return prefix;
	},
};