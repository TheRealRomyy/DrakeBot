const Command = require("../../structure/Commands");

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
            restriction: []
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
    
            data.member.banksold -= amount;
            data.member.money += amount;
    
            await data.member.save();
    
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

        if(amount > data.member.bankSold) return message.drake("economy/withdraw:NOT_ENOUGHT", {
            emoji: "error"
        });

        data.member.bankSold -= amount;
        data.member.money += amount;

        await data.member.save();

        return message.drake("economy/withdraw:SUCCES", {
            emoji: "succes",
            amount: amountStr,
            symbol: data.guild.symbol
        });
    };
};

module.exports = Withdraw;