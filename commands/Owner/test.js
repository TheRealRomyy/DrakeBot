const Command = require("../../structure/Commands.js");
const { MessageAttachment } = require("discord.js");
const canvacord = require("canvacord");

class Test extends Command {

	constructor (client) {
		super(client, {
            name: "test",
            aliases: [],
			dirname: __dirname,
			enabled: true,
			botPers: [],
			userPerms: [],
            cooldown: 3,
            restriction: [ "MODERATOR" ]
		});
	}

	async run (message, args, data) {

		const user = message.mentions.users.first() || this.client.users.cache.get(args[0]) || message.author;
    	const spotify = user.presence.activities.find(act => act.type === "LISTENING" && act.name === "Spotify"); 

		if(spotify) {
			let card = new canvacord.Spotify()
			.setAuthor(spotify.state)
			.setAlbum(spotify.assets.largeText || spotify.state)
			.setEndTimestamp(spotify.timestamps.end)
			.setStartTimestamp(spotify.timestamps.start)
			.setTitle(spotify.details)
			.setImage(spotify.assets.largeImageURL({
				format: "png",
				size: 1024
			}));
	
			let spotifyData = await card.build()
			const attachment = new MessageAttachment(spotifyData, `spotify-${user.id}.png`);
			return message.channel.send({
				files: [attachment]
			});
		} else {
			return message.channel.send({
				content: `${user} n'écoute pas spotify actuellement !`
			});
		};
	};
};

module.exports = Test;