const Command = require("../../structure/Commands");
const { MessageEmbed, MessageActionRow, MessageSelectMenuù } = require("discord.js");

class BugReport extends Command {

	constructor (client) {
		super(client, {
			name: "bug-report",
			aliases: [ "br", "report-bug" ],
			dirname: __dirname,
			enabled: true,
			botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
			userPerms: [],
			cooldown: 3,
			restriction: [],

            slashCommandOptions: {
                description: "Report a bug to the bot developer"
            }
		});
	};

	async run (message, args, data) {

		const client = this.client;

		const group1 = new MessageActionRow()
		.addComponents(
			new MessageSelectMenu()
				.setCustomId(`${Date.now()}${message.guild.id}${message.channel.id}`)
				.setPlaceholder('Quel type de bug voulez vous report ?')
				.addOptions([
					{
						label: '🔨 Commandes',
						description: 'Un bug qui survient lors de l\'éxécution d\'une commande',
						value: 'command',
					},
					{
						label: '👤 Status',
						description: 'Un bug avec le status du bot',
						value: 'status',
					},
					{
						label: '⚙️ Autre',
						description: 'Un autre bug',
						value: 'other',
					},
				]),
		);

		message.channel.send({
			content: "Quel type de bug avez vous rencontré",
			components: [group1]
		});
	};
};

module.exports = BugReport;