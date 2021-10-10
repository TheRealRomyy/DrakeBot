const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class ResetLevel extends Command {

    constructor(client) {
        super(client, {
            name: "reset-level",
            aliases: ["reset-xp", "resetlevel", "reset-lvl"],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Reset the level of a member or of the entire guild",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: false,
                        description: "What member will his exp reset ? (default is guild)"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!data.guild.plugins.levels.enabled) return message.drake("misc:LEVEL_DISABLED", {
            emoji: "errors"
        });
    
        if(args[0]) {
    
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if(!member) return message.drake("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "reset-level (user)"
            });
    
            const memberData = (member.id === message.author.id ? data.member : await this.client.db.findOrCreateMember(member, message.guild));

            memberData.level = 0;
            memberData.exp = 0;
            memberData.exptotal = 0;
            await memberData.save(memberData);

            return message.drake("level/reset-level:SUCCES_MEMBER", {
                emoji: "succes",
                username: member.user.username
            });
    
        } else {
    
            const members = await this.client.db.fetchGuildMembers(message.guild.id);

            await members.forEach(async (m) => {
                const memberData = await this.client.db.findOrCreateMember(m, message.guild);
                memberData.level = 0;
                memberData.exp = 0;
                memberData.exptotal = 0;
                await memberData.save(memberData);
            });


            return message.drake("level/reset-level:SUCCES_GUILD", {
                emoji: "succes",
                guild: message.guild.name
            });
        };
    };

    async runInteraction(interaction, data) {

        if(!data.guild.plugins.levels.enabled) return interaction.reply({
            content: interaction.drakeWS("misc:LEVEL_DISABLED", {
                emoji: "errors"
            })
        });
    
        if(interaction.options.getUser("user")) {
    
            const user = interaction.options.getUser("user");
            const memberData = (user.id === interaction.user.id ? data.member : await this.client.db.findOrCreateMember(user.id, interaction.guild));

            memberData.level = 0;
            memberData.exp = 0;
            memberData.exptotal = 0;
            await memberData.save(memberData);

            return interaction.reply({
                content: interaction.drakeWS("level/reset-level:SUCCES_MEMBER", {
                    emoji: "succes",
                    username: user.username
                })
            });
    
        } else {
    
            const members = await this.client.db.fetchGuildMembers(interaction.guild.id);

            await members.forEach(async (m) => {
                const memberData = await this.client.db.findOrCreateMember(m, interaction.guild);
                memberData.level = 0;
                memberData.exp = 0;
                memberData.exptotal = 0;
                await memberData.save(memberData);
            });


            return interaction.reply({
                content: interaction.drakeWS("level/reset-level:SUCCES_GUILD", {
                    emoji: "succes",
                    guild: interaction.guild.name
                })
            });
        };
    };
};

module.exports = ResetLevel;