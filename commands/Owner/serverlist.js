const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const ms = require("ms");

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
        
		await message.delete().catch(() => {});

		// Variables for pages
		let i0 = 0;
		let i1 = 10;
		let page = 1;

		// Shortcuts
		let totalServers = this.client.guilds.cache.size;
		let totalPages = Math.round(totalServers / 10);

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

		let nextButton = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Next ➡️')
			.setDisabled(false)
			.setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NEXT-SERVERLIST`);
	
		let previousButton = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Previous ⬅️')
			.setDisabled(false)
			.setCustomId(`${message.guild.id}${message.author.id}${Date.now()}PREVIOUS-SERVERLIST`);
	
		let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);

		const msg = await message.channel.send({
			embeds: [embed],
			components: [group1]
		});

		const filter = (button) => button.user.id === message.author.id && (
			button.customId === nextButton.customId ||
			button.customId === previousButton.customId
		);

		const collector = msg.createMessageComponentCollector({ 
			filter, 
			time: ms("10m"), 
			errors: ['time'] 
		});

		collector.on("collect", async button => {

			await button.deferUpdate();

			if(button.customId === previousButton.customId) {

				// Security Check
				if ((i0 - 10) + 1 < 0) return;

				// Update variables
				i0 -= 10;
				i1 -= 10;
				page--;

				// Check of the variables
				if (!i1) return;

				description = `Serveurs: ${this.client.guilds.cache.size}\n\n` +
				this.client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount)
					.map(guild => guild)
					.map((guild, i) => `**${i + 1}** - ${guild.name} | **${guild.memberCount} Membres**`)
					.slice(i0, i1)
					.join("\n");

				// Update the embed with new informations
				embed.setTitle(`Page: ${page}/${totalPages}`)
					.setDescription(description);
            
				// Edit the message 
				msg.edit({
					embeds: [embed]
				}).catch(() => {});;
			};

			if(button.customId === nextButton.customId) {

				// Security Check
				if ((i1 + 10) > totalServers + 10) return;

				// Update variables
				i0 += 10;
				i1 += 10;
				page++;

				// Check of the variables								
				if (!i0 || !i1) return;

				description = `Serveurs: ${this.client.guilds.cache.size}\n\n` +
				this.client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount)
					.map(guild => guild)	
					.map((guild, i) => `**${i + 1}** - ${guild.name} | **${guild.memberCount} Membres**`)
					.slice(i0, i1)
					.join("\n");

				// Update the embed with new informations
				embed.setTitle(`Page: ${page}/${totalPages}`)
					.setDescription(description);
            
				// Edit the message 
				msg.edit({
					embeds: [embed]
				}).catch(() => {});;
			};
		});

		collector.on("end", async () => {
			let nextButton = new MessageButton()
			.setStyle('SECONDARY')
			.setLabel('Next ➡️')
			.setDisabled(true)
			.setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NEXT-SERVERLIST`);
	  
			let previousButton = new MessageButton()
			.setStyle('SECONDARY')
			.setLabel('Previous ⬅️')
			.setDisabled(true)
			.setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NEXT-SERVERLIST`);
	
			let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);
	
			msg.edit({
			  components: [group1]
			}).catch(() => {});;
		});
	};
};

module.exports = ServerList;