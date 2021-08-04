const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class ServerList extends Command {

	constructor (client) {
		super(client, {
            name: "serverlist",
            aliases: [ "slist", "server-list", "sl" ],
			dirname: __dirname,
			enabled: true,
			botPers: [],
			userPerms: [],
            cooldown: 3,
            restriction: [ "MODERATOR" ]
		});
	}

	async run (message, args, data) {
        
		await message.delete();

		let i0 = 0;
		let i1 = 10;
		let page = 1;

		let description = 
        `Serveurs: ${this.client.guilds.cache.size}\n\n`+
		this.client.guilds.cache.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
			.map((r, i) => `**${i + 1}** - ${r.name} | **${r.memberCount} Membres**`)
			.slice(0, 10)
			.join("\n");

		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setColor(this.client.cfg.color.purple)
			.setFooter(this.client.user.username)
			.setTitle(`Page: ${page}/${Math.ceil(this.client.guilds.cache.size/10)}`)
			.setDescription(description);

		const msg = await message.channel.send({
			embeds: [embed]
		});
        
		await msg.react("⬅");
		await msg.react("➡");
		await msg.react("❌");

		const collector = msg.createReactionCollector((reaction, user) => user.id === message.author.id);

		collector.on("collect", async(reaction) => {

			if(reaction._emoji.name === "⬅") {

				// Updates variables
				i0 = i0-10;
				i1 = i1-10;
				page = page-1;
                
				// if there is no guild to display, delete the message
				if(i0 < 0){
					return msg.delete();
				}
				if(!i0 || !i1){
					return msg.delete();
				}
                
				description = `Serveurs: ${this.client.guilds.cache.size}\n\n`+
				this.client.guilds.cache.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
					.map((r, i) => `**${i + 1}** - ${r.name} | **${r.memberCount} Membres**`)
					.slice(i0, i1)
					.join("\n");

				// Update the embed with new informations
				embed.setTitle(`Page: ${page}/${Math.round(this.client.guilds.cache.size/10)}`)
					.setDescription(description);
            
				// Edit the message 
				msg.edit({
					embeds: [embed]
				});
            
			}

			if(reaction._emoji.name === "➡"){

				// Updates variables
				i0 = i0+10;
				i1 = i1+10;
				page = page+1;

				// if there is no guild to display, delete the message
				if(i1 > this.client.guilds.cache.size + 10){
					return msg.delete();
				}
				if(!i0 || !i1){
					return msg.delete();
				}

				description = `Serveurs: ${this.client.guilds.cache.size}\n\n`+
				this.client.guilds.cache.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
					.map((r, i) => `**${i + 1}** - ${r.name} | **${r.memberCount} Membres**`)
					.slice(i0, i1)
					.join("\n");

				// Update the embed with new informations
				embed.setTitle(`Page: ${page}/${Math.round(this.client.guilds.cache.size/10)}`)
					.setDescription(description);
            
				// Edit the message 
				msg.edit({
					embeds: [embed]
				});

			}

			if(reaction._emoji.name === "❌"){
				return msg.delete().catch(() => {}); 
			}

			// Remove the reaction when the user react to the message
			await reaction.users.remove(message.author.id);
		});
	};
};

module.exports = ServerList;