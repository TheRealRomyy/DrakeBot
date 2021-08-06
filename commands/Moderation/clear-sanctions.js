const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class ClearSanctions extends Command {

    constructor(client) {
        super(client, {
            name: "clear-sanctions",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: [ "MANAGE_MESSAGES" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Clear all sanctions of an user",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "Wich user ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(m => m.user.username === args[0]);

        if(!member) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "clear-sanctions <user>"
        });

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);
        
		memberData.sanctions = [];
        await memberData.save();
        
		return message.drake("moderation/clear-sanctions:SUCCES", {
            emoji: "succes",
			username: member.user.tag
		});
    };

    async runInteraction(interaction, data) {

        const user = interaction.options.getUser("user");
        const memberData = await this.client.db.findOrCreateMember(user.id, interaction.guild);
        
		memberData.sanctions = [];
        await memberData.save();
        
		return interaction.reply({
            content: interaction.drakeWS("moderation/clear-sanctions:SUCCES", {
                emoji: "succes",
                username: user.tag
            })
		});
    };
};

module.exports = ClearSanctions;