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