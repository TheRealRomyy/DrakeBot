const Command = require("../../structure/Commands");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Deposit extends Command {

    constructor(client) {
        super(client, {
            name: "deposit",
            aliases: [ "bank", "dep", "deep" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Deposit your money at the bank",
                options: [
                    {
                        name: "amount",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "How many money ? (type \"all\" to deposit all money)"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "deposit <all/amount>"
        });

        if(args[0] === "all") {
            let amount = data.member.money;
            let amountStr = amount.toString();

            if(amount == 0) return message.drake("economy/deposit:NOT_ENOUGHT", {
                emoji: "error"
            });

            if((amount + data.member.banksold) > 10000) return message.drake("economy/deposit:MAX_AMOUNT", {
                emoji: "error",
                symbol: data.guild.symbol
            });

            data.member.money = 0;
            data.member.banksold += amount;

            await data.member.save(data.member);

            return message.drake("economy/deposit:SUCCES", {
                emoji: "succes",
                amount: amountStr,
                symbol: data.guild.symbol
            });
        };

        if(isNaN(args[0])) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "deposit <all/amount>"
        });

        let amount = parseInt(args[0]);
        let amountStr = amount.toString();

        if(amount < 1) return message.drake("economy/deposit:TOO_LOW_AMOUNT", {
            emoji: "error",
            symbol: data.guild.symbol
        });

        if(amount > data.member.money) return message.drake("economy/deposit:NOT_ENOUGHT", {
            emoji: "error"
        });

        if((amount + data.member.banksold) > 10000) return message.drake("economy/deposit:MAX_AMOUNT", {
            emoji: "error",
            symbol: data.guild.symbol
        });

        data.member.money -= amount;
        data.member.banksold += amount;

        await data.member.save(data.member);

        return message.drake("economy/deposit:SUCCES", {
            emoji: "succes",
            amount: amountStr,
            symbol: data.guild.symbol
        });
    };

    async runInteraction(interaction, data) {

        if(interaction.options.getString("amount") === "all") {
            let amount = data.member.money;
            let amountStr = amount.toString();

            if(amount == 0) return interaction.reply({
                content: interaction.drakeWS("economy/deposit:NOT_ENOUGHT", {
                    emoji: "error"
                }),
                ephemeral: true
            });

            if((amount + data.member.banksold) > 10000) return interaction.reply({
                content: interaction.drakeWS("economy/deposit:MAX_AMOUNT", {
                    emoji: "error",
                    symbol: data.guild.symbol
                }),
                ephemeral: true
            });

            data.member.money = 0;
            data.member.banksold += amount;

            await data.member.save(data.member);

            return interaction.reply({
                content: interaction.drakeWS("economy/deposit:SUCCES", {
                    emoji: "succes",
                    amount: amountStr,
                    symbol: data.guild.symbol
                })
            });
        };

        if(isNaN(interaction.options.getString("amount"))) return interaction.reply({
            content: interaction.drakeWS("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "deposit <all/amount>"
            }),
            ephemeral: true
        });

        let amount = parseInt(interaction.options.getString("amount"));
        let amountStr = amount.toString();

        if(amount > data.member.money) return interaction.reply({
            content: interaction.drakeWS("economy/deposit:NOT_ENOUGHT", {
                emoji: "error"
            }),
            ephemeral: true
        });

        if((amount + data.member.banksold) > 10000) return interaction.reply({
            content: interaction.drakeWS("economy/deposit:MAX_AMOUNT", {
                emoji: "error",
                symbol: data.guild.symbol
            }),
            ephemeral: true
        });

        data.member.money -= amount;
        data.member.banksold += amount;

        await data.member.save(data.member);

        return interaction.reply({
            content: interaction.drakeWS("economy/deposit:SUCCES", {
                emoji: "succes",
                amount: amountStr,
                symbol: data.guild.symbol
            })
        });
    };
};

module.exports = Deposit;