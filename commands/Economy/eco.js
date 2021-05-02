const Command = require("../../structure/Commands");

class Eco extends Command {

    constructor(client) {
        super(client, {
            name: "eco",
            aliases: [ "economy" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 0,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(!args[0] || !args[1]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "eco <give/remove/reset> <user> (amount)"
        });

        const type = args[0];
        const member = message.mentions.members.first() || message.guild.member(args[0]);
        let amount = null;

        if(!member) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "eco <give/remove/reset> <user> (amount)"
        });

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);

        switch(type) {
            case "give": 
                if(isNaN(args[2])) return message.drake("economy/eco:AMOUNT_REQUIRE", {
                    emoji: "error"
                });
                amount = parseInt(args[2]);
                if(!amount) return message.drake("economy/eco:AMOUNT_REQUIRE", {
                    emoji: "error"
                });
                if(amount > 1000000) return message.drake("economy/eco:MAX_AMOUNT", {
                    emoji: "error",
                    amount: "1 000 000" + data.guild.symbol
                });
                memberData.money += amount;
                await memberData.save();
                return message.drake("economy/eco:GIVE_SUCCES", {
                    emoji: "succes",
                    username: member.user.username,
                    symbol: data.guild.symbol,
                    amount
                });
            case "remove":
                if(isNaN(args[2])) return message.drake("economy/eco:AMOUNT_REQUIRE", {
                    emoji: "error"
                });
                amount = parseInt(args[2]);
                if(!amount) return message.drake("economy/eco:AMOUNT_REQUIRE", {
                    emoji: "error"
                });
                if(amount > memberData.money) return message.drake("economy/eco:NOT_ENOUGHT", {
                    emoji: "error",
                    username: member.user.username
                });
                memberData.money -= amount;
                await memberData.save();
                return message.drake("economy/eco:REMOVE_SUCCES", {
                    emoji: "succes",
                    username: member.user.username,
                    symbol: data.guild.symbol,
                    amount
                });
            case "reset":
                memberData.money = 0;
                memberData.banksold = 0;
                await memberData.save();
                return message.drake("economy/eco:RESET_SUCCES", {
                    emoji: "succes",
                    username: member.user.username
                });
            default:
                return message.drake("errors:NOT_CORRECT", {
                    emoji: "error",
                    usage: data.guild.prefix + "eco <give/remove/reset> <user> (amount)"
            });
        };
    };
};

module.exports = Eco;