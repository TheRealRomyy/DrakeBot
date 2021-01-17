const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Ping extends Command {

	constructor (client) {
		super(client, {
			name: "ping",
			aliases: [ "pong", "latency" ],
			dirname: __dirname,
			enabled: true,
			botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
			userPerms: [],
			cooldown: 3,
			restriction: [],
		});
	};

	async run (message, args, data) {

		const client = this.client;

		const embed = new MessageEmbed()
		.setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
		.setTitle(message.drakeWS("general/ping:TITLE", {
			emoji: "ping"
		}))
		.setColor(client.cfg.color.green)
		.addField(message.drakeWS("general/ping:BOT"), client.emotes.waiting, true)
		.addField(message.drakeWS("general/ping:VPS"), client.emotes.waiting, true)
		.setFooter(client.cfg.footer)
	
		message.channel.send(embed).then( msg => {
	
			let bot = msg.createdTimestamp - message.createdTimestamp;
			let vps = Math.round(client.ws.ping);
			
			const embed2 = new MessageEmbed()
			.setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
			.setTitle(message.drakeWS("general/ping:TITLE", {
				emoji: "ping"
			}))
			.setColor((bot + vps) > 1000 ? client.cfg.color.red : ((bot + vps) > 350 ? client.cfg.color.orange : client.cfg.color.green))
			.addField(client.functions.getPingColor(bot) + " " + message.drakeWS("general/ping:BOT"), "```" + bot + "ms```", true)
			.addField(client.functions.getPingColor(vps) + " " + message.drakeWS("general/ping:VPS"), "```" + vps + "ms```", true)
			.setFooter(client.cfg.footer)
			msg.edit(embed2);
		
		});
	};
};

module.exports = Ping;