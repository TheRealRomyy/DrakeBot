const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class ResetMoney extends Command {

    constructor(client) {
        super(client, {
            name: "reset-money",
            aliases: ["resetmoney"],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Reset the money of a member or of the entire guild",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: false,
                        description: "What member will his money be reset ? (default is guild)"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {
    
        if(args[0]) {
    
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if(!member) return message.drake("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "reset-money (user)"
            });
    
            const memberData = (member.id === message.author.id ? data.member : await this.client.db.findOrCreateMember(member, message.guild));

            memberData.money = 0;
            memberData.banksold = 0;
            await memberData.save(memberData);

            return message.drake("economy/reset-money:SUCCES_MEMBER", {
                emoji: "succes",
                username: member.user.username
            });
    
        } else {
    
            const members = await this.client.db.fetchGuildMembers(message.guild.id);

            await members.forEach(async (m) => {
                const memberData = await this.client.db.findOrCreateMember(m, message.guild);

                memberData.money = 0;
                memberData.banksold = 0;
                
                await memberData.save(memberData);
            });


            return message.drake("economy/reset-money:SUCCES_GUILD", {
                emoji: "succes",
                guild: message.guild.name
            });
        };
    };

    async runInteraction(interaction, data) {
    
        if(interaction.options.getUser("user")) {
    
            const user = interaction.options.getUser("user");
            const memberData = (user.id === interaction.user.id ? data.member : await this.client.db.findOrCreateMember(user.id, interaction.guild));

            memberData.money = 0;
            memberData.banksold = 0;
            await memberData.save(memberData);

            return interaction.reply({
                content: interaction.drakeWS("economy/reset-money:SUCCES_MEMBER", {
                    emoji: "succes",
                    username: user.username
                })
            });
    
        } else {
    
            const members = await this.client.db.fetchGuildMembers(interaction.guild.id);

            await members.forEach(async (m) => {
                const memberData = await this.client.db.findOrCreateMember(m, interaction.guild);

                memberData.money = 0;
                memberData.banksold = 0;
                
                await memberData.save(memberData);
            });


            return interaction.reply({
                content: interaction.drakeWS("economy/reset-money:SUCCES_GUILD", {
                    emoji: "succes",
                    guild: interaction.guild.name
                })
            });
        };
    };
};

module.exports = ResetMoney;