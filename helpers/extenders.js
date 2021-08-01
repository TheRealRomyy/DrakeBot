const { Message, Guild, Interaction } = require("discord.js");
const moment = require("moment");

/**
 * Translate a text from a guild
 * @param { string } key 
 * @param { object } args
 * @return { string } language 
*/

Guild.prototype.translate = function(key, args) {
	let language = this.client.translations.get(this.data.language);
	let string = language(key, args);
	if (args && args.emoji) string = `${this.client.emotes[args.emoji]} ${string}`;
	return string;
};

/**
 * Translate a text from a message
 * @param { string } key 
 * @param { object } args
 * @return { string } language 
*/

Message.prototype.translate = function(key, args) {
	const language = this.client.translations.get(
		this.guild ? this.guild.data.language : "en-US"
	);
	if (!language) throw "Message: Invalid language set in data.";
	return language(key, args);
};

/**
 * Translate, replace with emoji and send a text from a message
 * @param { string } key 
 * @param { object } args
 * @return { string } language 
*/

Message.prototype.drake = function(key, args, options = {}) {
	let string = this.translate(key, args);
	if (args && args.emoji) string = `${this.client.emotes[args.emoji]} ${string}`;
	this.channel.send({
		content: string
	});
};

/**
 * Translate and replace with emoji a text from a message
 * @param { string } key 
 * @param { object } args
 * @return { string } language 
*/

Message.prototype.drakeWS = function(key, args, options = {}) {
	let string = this.translate(key, args);
	if (args && args.emoji) string = `${this.client.emotes[args.emoji]} ${string}`;
	return string;
};

/**
 * Translate, replace with emoji and send a text from a message
 * @param { string } key 
 * @param { object } args
 * @return { string } language 
*/

Interaction.prototype.drake = function(key, args, options = {}) {
	let string = this.translate(key, args);
	if (args && args.emoji) string = `${this.client.emotes[args.emoji]} ${string}`;
	this.channel.send({
		content: string
	});
};

/**
 * Translate and replace with emoji a text from a message
 * @param { string } key 
 * @param { object } args
 * @return { string } language 
*/

Interaction.prototype.drakeWS = function(key, args, options = {}) {
	let string = this.translate(key, args);
	if (args && args.emoji) string = `${this.client.emotes[args.emoji]} ${string}`;
	return string;
};

/**
 * Translate a text from a message
 * @param { string } key 
 * @param { object } args
 * @return { string } language 
*/

Interaction.prototype.translate = function(key, args) {
	const language = this.client.translations.get(
		this.guild ? this.guild.data.language : "en-US"
	);
	if (!language) throw "Message: Invalid language set in data.";
	return language(key, args);
};

/**
 * Convert time
*/

Message.prototype.time = class Time {

	static convertMS(ms) {
		const absoluteSeconds = Math.floor((ms / 1000) % 60);
		const absoluteMinutes = Math.floor((ms / (1000 * 60)) % 60);
		const absoluteHours = Math.floor((ms / (1000 * 60 * 60)) % 24);
		const absoluteDays = Math.floor(ms / (1000 * 60 * 60 * 24));
		
	const d = absoluteDays
		? absoluteDays === 1
			? Message.drakeWS("time:ONE_DAY")
			: Message.drakeWS("time:DAYS", { amount: absoluteDays })
		: null;
	const h = absoluteHours
		? absoluteHours === 1
			? Message.drakeWS("time:ONE_HOUR")
			: Message.drakeWS("time:HOURS", { amount: absoluteHours })
		: null;
	const m = absoluteMinutes
		? absoluteMinutes === 1
			? Message.drakeWS("time:ONE_MINUTE")
			: Message.drakeWS("time:MINUTES", { amount: absoluteMinutes })
		: null;
	const s = absoluteSeconds
		? absoluteSeconds === 1
			? Message.drakeWS("time:ONE_SECOND")
			: Message.drakeWS("time:SECONDS", { amount: absoluteSeconds })
		: null;
	const ams = ms
	? ms === 1
		? Message.drakeWS("time:ONE_MILISECOND")
		: Message.drakeWS("time:MILISECONDS", { amount: ms })
	: null;

		const absoluteTime = [];
		if (d) absoluteTime.push(d);
		if (h) absoluteTime.push(h);
		if (m) absoluteTime.push(m);
		if (s) absoluteTime.push(s);
		if (absoluteTime.length === 0) absoluteTime.push(ams);

		return absoluteTime.join(", ");
	};

	static printDate(date, format, locale){
		if(!locale) locale = "fr-FR"
		if(!format) format = "Do MMMM YYYY";
		return moment(new Date(date)).locale("fr").format(format);
	};

	static printDateFrom(date, format, locale){
		if(!locale) locale = "fr-FR"
		if(!format) format = "Do MMMM YYYY";
		moment.locale("fr");
		return moment.utc(date).startOf('hour').fromNow();
	};
};

/**
 * Convert time
*/

Interaction.prototype.time = class Time {

	static convertMS(ms) {
		const absoluteSeconds = Math.floor((ms / 1000) % 60);
		const absoluteMinutes = Math.floor((ms / (1000 * 60)) % 60);
		const absoluteHours = Math.floor((ms / (1000 * 60 * 60)) % 24);
		const absoluteDays = Math.floor(ms / (1000 * 60 * 60 * 24));
		
	const d = absoluteDays
		? absoluteDays === 1
			? Message.drakeWS("time:ONE_DAY")
			: Message.drakeWS("time:DAYS", { amount: absoluteDays })
		: null;
	const h = absoluteHours
		? absoluteHours === 1
			? Message.drakeWS("time:ONE_HOUR")
			: Message.drakeWS("time:HOURS", { amount: absoluteHours })
		: null;
	const m = absoluteMinutes
		? absoluteMinutes === 1
			? Message.drakeWS("time:ONE_MINUTE")
			: Message.drakeWS("time:MINUTES", { amount: absoluteMinutes })
		: null;
	const s = absoluteSeconds
		? absoluteSeconds === 1
			? Message.drakeWS("time:ONE_SECOND")
			: Message.drakeWS("time:SECONDS", { amount: absoluteSeconds })
		: null;
	const ams = ms
	? ms === 1
		? Message.drakeWS("time:ONE_MILISECOND")
		: Message.drakeWS("time:MILISECONDS", { amount: ms })
	: null;

		const absoluteTime = [];
		if (d) absoluteTime.push(d);
		if (h) absoluteTime.push(h);
		if (m) absoluteTime.push(m);
		if (s) absoluteTime.push(s);
		if (absoluteTime.length === 0) absoluteTime.push(ams);

		return absoluteTime.join(", ");
	};

	static printDate(date, format, locale){
		if(!locale) locale = "fr-FR"
		if(!format) format = "Do MMMM YYYY";
		return moment(new Date(date)).locale("fr").format(format);
	};

	static printDateFrom(date, format, locale){
		if(!locale) locale = "fr-FR"
		if(!format) format = "Do MMMM YYYY";
		moment.locale("fr");
		return moment.utc(date).startOf('hour').fromNow();
	};
};