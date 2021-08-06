const Command = require("../../structure/Commands");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Pay extends Command {

    constructor(client) {
        super(client, {
            name: "pay",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Pay a member",
                options: [
                    {
                        name: "member",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "Wich user ?"
                    },
                    {
                        name: "amount",
                        type: ApplicationCommandOptionTypes.NUMBER,
                        required: true,
                        description: "How many money ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!args[0] || !args[1] || isNaN(args[1]) || (parseInt(args[1]) < 0)) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "pay <user> <amount>"
        });

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const amount = parseInt(args[1]);

        if(member.user.bot) return message.drake("economy/pay:BOT", {
            emoji: "error",
            bot: member.user.username
        });

        if(member.id === message.author.id) return message.drake("economy/pay:YOURSELF", {
            emoji: "error"
        });

        if(amount > data.member.money) return message.drake("economy/pay:NOT_ENOUGHT_MONEY", {
            emoji: "error"
        });

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);

        data.member.money -= amount;
        await data.member.save(data.member);

        memberData.money += amount;
        await memberData.save(memberData);

        return message.drake("economy/pay:SUCCES", {
            username: member.user.username,
            amount,
            symbol: data.guild.symbol,
            emoji: "succes"
        });

    };

    async runInteraction(interaction, data) {

        const member = interaction.options.getUser("member") ? interaction.guild.members.cache.get(interaction.options.getUser("member").id) : null;
        const amount = interaction.options.getNumber("amount");

        if(!member || amount < 0) return interaction.reply({
            content: interaction.drakeWS("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "pay <user> <amount>"
            }),
            ephemeral: true
        });

        if(member.user.bot) return interaction.reply({
            content: interaction.drakeWS("economy/pay:BOT", {
                emoji: "error",
                bot: member.user.username
            }),
            ephemeral: true
        });

        if(member.id === interaction.user.id) return interaction.reply({
            content: interaction.drakeWS("economy/pay:YOURSELF", {
                emoji: "error"
            }),
            ephemeral: true
        });

        if(amount > data.member.money) return interaction.reply({
            content: interaction.drakeWS("economy/pay:NOT_ENOUGHT_MONEY", {
                emoji: "error"
            }),
            ephemeral: true
        });

        const memberData = await this.client.db.findOrCreateMember(member.id, interaction.guild);

        data.member.money -= amount;
        await data.member.save(data.member);

        memberData.money += amount;
        await memberData.save(memberData);

        return interaction.reply({
            content: interaction.drakeWS("economy/pay:SUCCES", {
                username: member.user.username,
                amount,
                symbol: data.guild.symbol,
                emoji: "succes"
            })
        });

    };
};

module.exports = Pay;