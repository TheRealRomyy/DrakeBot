const Command = require("../../structure/Commands.js");

class DrakeCoin extends Command {

    constructor(client) {
        super(client, {
            name: "drakecoin",
            aliases: [],
            enabled: true,
            dirname: __dirname,
            botPerms: [],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        switch(args[0]) {
            case "invest":
                let quantity = parseInt(args[1]);

                if(!quantity  || isNaN(quantity)) return message.drake("errors:NOT_CORRECT", {
                    emoji: "error",
                    usage: data.guild.prefix + "drakecoin (invest/sell) (amount)"
                });

                if(quantity <= data.member.money) {
                    data.member.money -= quantity;
                    data.client.drakecoin += quantity;
                    data.user.drakecoin += quantity;

                    message.drake("economy/drakecoin:SUCCES_INVEST", {
                        quantity,
                        emoji: "succes"
                    });

                    await data.member.save();
                    await data.user.save();
                    await data.client.save();
                } else {
                    message.drake("economy/drakecoin:NOT_ENOUGHT_MONEY", {
                        emoji: "error"
                    });
                };
                break;
            case "sell":
                let quantityToSell = parseInt(args[1]);

                if(!quantityToSell  || isNaN(quantityToSell)) return message.drake("errors:NOT_CORRECT", {
                    emoji: "error",
                    usage: data.guild.prefix + "drakecoin (invest/sell) (amount)"
                });

                if(quantityToSell <= data.user.drakecoin) {
                    data.member.money += (quantityToSell * data.client.cours);
                    data.client.drakecoin -= quantityToSell;
                    data.user.drakecoin -= quantityToSell;

                    message.drake("economy/drakecoin:SUCCES_SELL", {
                        quantity: quantityToSell,
                        emoji: "succes"
                    });

                    await data.member.save();
                    await data.user.save();
                    await data.client.save();
                } else {
                    message.drake("economy/drakecoin:NOT_ENOUGHT_INVESISTEMENT", {
                        emoji: "error"
                    });
                };
                break;
            default:
                message.channel.send(message.drakeWS("economy/drakecoin:ACTUAL", {
                    cours: data.client.drakecoin + "$"
                }), {
                    code: "none"
                });
                break;
        };
    };
};

module.exports = DrakeCoin;