const Command = require("../../structure/Commands.js");
const { MessageCollector } = require("discord.js");

class GuessTheNumber extends Command {

    constructor(client) {
        super(client, {
            name: "number",
            aliases: ["gtn", "guessTheNumber"],
            enabled: true,
            botPerms: [],
            userPerms: [],
            dirname: __dirname,
            restriction: []
        });
    };

	async run(message, args, data) {

		const currentGames = {};
		const client = this.client;
		
		if(currentGames[message.guild.id]) return message.drake("fun/number:GAME_RUNNING", {
			emoji: "error"
		});
		
		const participants = [];
		const number = Math.floor(Math.random() * 30);
		
		message.drake("fun/number:START", {
			user: message.author.id,
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

				let newRecord = false;

				const time = message.time.convertMS(Date.now() - gameCreatedAt);
		
				message.drake("fun/number:GAME_STATS", {
					winner: msg.author.toString(),
					number,
					time: time,
					participantCount: participants.length,
					participants: participants.map(p => `<@${p}>`).join("\n"),
					emoji: "congrats"
				});


				const winnerData = await client.db.findOrCreateUser(msg.author);

				if(winnerData.record.length != 0) {
					winnerData.record.forEach(record => {
						if(record.type !== "number") return;
	
						if(record.time > time) {
	
							let recordInfo = {
								type: "number",
								time: Date.now() - gameCreatedAt,
								guild: message.guild.id,
							};
							
							newRecord = true;
							record = recordInfo;
						};
					});
				} else {
					let recordInfo = {
						type: "number",
						time: Date.now() - gameCreatedAt,
						guild: message.guild.id,
					};

					newRecord = true;
					winnerData.record.push(recordInfo);
				};

				if(newRecord) {
					message.drake("fun/number:RECORD", {
						emoji: "trophy",
						time,
						user: msg.author.id
					});
				};

				collector.stop(msg.author.username);
				delete currentGames[message.guild.id];
				await winnerData.save();
			};

			if(parseInt(msg.content) < number) message.drake("fun/number:BIG", { number: parsedNumber })
			if(parseInt(msg.content) > number) message.drake("fun/number:SMALL", { number: parsedNumber })
		});
		
		collector.on("end", (_collected, reason) => {
			if(reason === "time") {
				delete currentGames[message.guild.id];
				return message.drake("fun/number:DEFEAT", { number });
			};
		});
	};
};

module.exports = GuessTheNumber;