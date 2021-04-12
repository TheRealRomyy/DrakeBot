const Command = require("../../structure/Commands.js");
const { MessageCollector } = require("discord.js");
const currentGames = {};

class Number extends Command {

	constructor(client) {
		super(client, {
			name: "number",
			aliases: ["guessTheNumber"],
			enabled: true,
			dirname: __dirname,
			botPerms: [],
			userPerms: [],
			restriction: []
		});
	};

	async run(message, args, data) {
		if(currentGames[message.guild.id]) return message.drake("fun/number:GAME_RUNNING", {
			emoji: "error"
		});
		
		const participants = [];
		const number = Math.floor(Math.random() * 30);
		
		await message.drake("fun/number:START", {
			username: message.author.username,
			emoji: "play"
		});
		
		const gameCreatedAt = Date.now();
		
		const collector = new MessageCollector(message.channel, m => !m.author.bot, { time: 480000 });
		
		currentGames[message.guild.id] = message.guild.id;
		
		collector.on("collect", async msg => {
			if(!participants.includes(msg.author.id)) participants.push(msg.author.id);
		
			if (isNaN(msg.content)) return;
			const parsedNumber = parseInt(msg.content, 10);
		
			if (parsedNumber === number) {
		
				message.drake("fun/number:GAME_STATS", {
					winner: msg.author.toString(),
					number,
					time: message.time.convertMS(Date.now()-gameCreatedAt),
					participantCount: participants.length,
					participants: participants.map(p => `<@${p}>`).join("\n"),
					emoji: "congrats"
				});
				delete currentGames[message.guild.id];
				collector.stop(msg.author.username);
			}
			if (parseInt(msg.content) < number) message.drake("fun/number:BIG", { number: parsedNumber })
			if (parseInt(msg.content) > number) message.drake("fun/number:SMALL", { number: parsedNumber })
		});
		
		collector.on("end", (_collected, reason) => {
			if (reason === "time") {
				delete currentGames[message.guild.id];
				return message.drake("fun/number:DEFEAT", { number });
			}
		});
	};
};

module.exports = Number;