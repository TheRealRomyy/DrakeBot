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
            restriction: [],

			slashCommandOptions: {
				description: "Play a game of \"guess the number\""
			}
        });
    };

	async run(message, args, data) {

		const client = this.client;
		
		if(client.numberGame[message.guild.id]) return message.drake("fun/number:GAME_RUNNING", {
			emoji: "error"
		});
		
		const participants = [];
		const number = Math.floor(Math.random() * 30);
		
		message.drake("fun/number:START", {
			user: message.author.id,
			emoji: "play"
		});
		
		const gameCreatedAt = Date.now();
		
		const collector = new MessageCollector(message.channel, {
			filter: m => !m.author.bot,
			time: 480000 
		});
		
		client.numberGame[message.guild.id] = message.guild.id;
		
		collector.on("collect", async msg => {
			if(isNaN(msg.content)) return;
			
			if(!participants.includes(msg.author.id)) participants.push(msg.author.id);
	
			const parsedNumber = parseInt(msg.content, 10);
		
			if (parsedNumber === number) {

				let newRecord = false;

				const time = Date.now() - gameCreatedAt;
		
				message.drake("fun/number:GAME_STATS", {
					winner: msg.author.toString(),
					number,
					time: message.time.convertMS(time),
					participantCount: participants.length,
					participants: participants.map(p => `<@${p}>`).join("\n"),
					emoji: "congrats"
				});


				const winnerData = await client.db.findOrCreateUser(msg.author);

				if(winnerData.record.length != 0) {
					winnerData.record.forEach(record => {
						if(record.type !== "number") return;

						if(record.time > time) {

							newRecord = true;

							record.guild = message.guild.id;
							record.time = time;
						};
					});
				} else {
					let recordInfo = {
						type: "number",
						time: time,
						guild: message.guild.id,
					};

					newRecord = true;
					winnerData.record.push(recordInfo);
				};

				if(newRecord) {
					message.drake("fun/number:RECORD", {
						emoji: "trophy",
						time: message.time.convertMS(time),
						user: msg.author.id
					});
				};

				collector.stop(msg.author.username);
				delete client.numberGame[message.guild.id];
				await winnerData.save();
			};

			if(parseInt(msg.content) < number) message.drake("fun/number:BIG", { number: parsedNumber })
			if(parseInt(msg.content) > number) message.drake("fun/number:SMALL", { number: parsedNumber })
		});
		
		collector.on("end", (_collected, reason) => {
			if(reason === "time") {
				delete client.numberGame[message.guild.id];
				return message.drake("fun/number:DEFEAT", { number, emoji: "error" });
			};
		});
	};
};

module.exports = GuessTheNumber;