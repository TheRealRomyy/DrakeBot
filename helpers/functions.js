const { MessageEmbed } = require("discord.js");
const cfg = require("../config.js");
const emojis = require("../emojis.json");
const moment = require("moment");
const fetch = require('node-fetch');

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

        devDM.send(embed)
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
	 * @param {*} ms 
	 * @return { string } emoji
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
		.setTitle(message.drakeWS(`misc:${type.toUpperCase()}_MSG`, {
			user: user.tag,
			emoji: "success2"
		}))
		.setFooter(cfg.footer)
		.setColor(cfg.color.blue)
		if(reason && reason !== message.drakeWS("misc:NO_REASON")) embed.setDescription(`\`Reason:\` ${reason} ${duration ? `\n\`Duration:\` ${duration}` : ""}`)
		if(type === "mute" && (!reason && reason === message.drakeWS("misc:NO_REASON"))) embed.setDescription(`\`Duration:\` ${duration}`)

		message.channel.send(embed)
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

		channel.send(embed);
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
		await member.send(message.drakeWS("moderation/warn:WARN_DM", {
			emoji: "warn",
			username: member.user.username,
			server: message.guild.name,
			moderator: moderator.tag,
			reason
		})).catch(() => {});

		guildData.cases++;
		guildData.save();

		const caseInfo = {
			moderator: moderator.id,
			date: Date.now(),
			type: "warn",
			case: guildData.cases,
			reason: reason,
		};
		
		memberData.sanctions.push(caseInfo);
		memberData.save();

		if(guildData.plugins.logs.mod) {
			if(!client.channels.cache.get(guildData.plugins.logs.mod)) {
				guildData.plugins.logs.mod = false;
				await guildData.save()
			};

			this.sendModLog("warn", member.user, client.channels.cache.get(guildData.plugins.logs.mod), message.author, guildData.cases, reason);
		};

		return this.sendSanctionMessage(message, "warn", member.user, reason)
	},
};