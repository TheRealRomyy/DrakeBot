const Command = require("../../structure/Commands");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Withdraw extends Command {

    constructor(client) {
        super(client, {
            name: "withdraw",
            aliases: [ "wd" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Withdraw your money from the bank",
                options: [
                    {
                        name: "amount",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "How many money ? (type \"all\" to withdraw all money)"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "withdraw <all/amount>"
        });

        if(args[0] === "all") {
            let amount = data.member.banksold;
            let amountStr = amount.toString();
    
            if(amount === 0) return message.drake("economy/withdraw:NOT_ENOUGHT", {
                emoji: "error"
            });
    
            data.member.banksold -= parseInt(amount);
            data.member.money += parseInt(amount);
    
            await data.member.save(data.member);
    
            return message.drake("economy/withdraw:SUCCES", {
                emoji: "succes",
                amount: amountStr,
                symbol: data.guild.symbol
            });
        };

        if(isNaN(args[0])) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "withdraw <all/amount>"
        }); 

        let amount = parseInt(args[0]);
        let amountStr = amount.toString();

        if(amount > data.member.banksold) return message.drake("economy/withdraw:NOT_ENOUGHT", {
            emoji: "error"
        });

        data.member.banksold -= parseInt(amount);
        data.member.money += parseInt(amount);

        await data.member.save(data.member);

        return message.drake("economy/withdraw:SUCCES", {
            emoji: "succes",
            amount: amountStr,
            symbol: data.guild.symbol
        });
    };

    async runInteraction(interaction, data) {

        if(interaction.options.getString("amount") === "all") {
            let amount = data.member.banksold;
            let amountStr = amount.toString();
    
            if(amount === 0) return interaction.reply({
                content: interaction.drakeWS("economy/withdraw:NOT_ENOUGHT", {
                    emoji: "error"
                }),
                ephemeral: true
            });
    
            data.member.banksold -= parseInt(amount);
            data.member.money += parseInt(amount);
    
            await data.member.save(data.member);
    
            return interaction.reply({
                content: interaction.drakeWS("economy/withdraw:SUCCES", {
                    emoji: "succes",
                    amount: amountStr,
                    symbol: data.guild.symbol
                })
            });
        };

        if(isNaN(interaction.options.getString("amount"))) return interaction.reply({
            content: interaction.drakeWS("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "withdraw <all/amount>"
            }),
            ephemeral: true
        }); 

        let amount = parseInt(interaction.options.getString("amount"));
        let amountStr = amount.toString();

        if(amount > data.member.banksold) return interaction.reply({
            content: interaction.drakeWS("economy/withdraw:NOT_ENOUGHT", {
                emoji: "error"
            }),
            ephemeral: true
        });

        data.member.banksold -= parseInt(amount);
        data.member.money += parseInt(amount);

        await data.member.save(data.member);

        return interaction.reply({
            content: interaction.drakeWS("economy/withdraw:SUCCES", {
                emoji: "succes",
                amount: amountStr,
                symbol: data.guild.symbol
            })
        });
    };
};

module.exports = Withdraw;