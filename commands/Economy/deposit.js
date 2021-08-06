const Command = require("../../structure/Commands");

class Deposit extends Command {

    constructor(client) {
        super(client, {
            name: "deposit",
            aliases: [ "bank", "dep", "deep" ],
            dirname: __dirname,
            enabled: false,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 3,
            restriction: []
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
};

module.exports = Deposit;