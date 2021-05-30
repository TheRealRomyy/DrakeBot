const Command = require("../../structure/Commands.js");
const { MessageButton } = require("discord-buttons");

class UnNickall extends Command {

    constructor(client) {
        super(client, {
            name: "un-nickall",
            aliases: [ "reset-nick-all", "reset-nickall" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_NICKNAMES", "CHANGE_NICKNAME" ],
            userPerms: [ "MANAGE_NICKNAMES" ],
            cooldown: 10,
            restriction: []
        });
    };

    async run(message, args, data) {

        const filter = (button) => button.clicker.user.id === message.author.id;

        async function unNick() {
            await message.guild.members.cache.forEach((member) => {
                member.setNickname(null).catch(() => {});
            });

            return msg.delete().catch(() => {});
        };

        let msg = await message.channel.send(message.drakeWS("moderation/un-nickall:CONFIRM", {
            emoji: "question"
        }));

        let yesButton = new MessageButton()
        .setStyle('green')
        .setLabel('Yes 👍')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}YES-UNNICKALL`);

        let noButton = new MessageButton()
        .setStyle('red')
        .setLabel('No 👎')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}NO-UNNICKALL`);

        await msg.edit({
            buttons: [yesButton, noButton],
        }).catch(() => {});
        
        await msg.awaitButtons(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let button = collected.first();
            if(!button) {
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            };
            if(button.id === yesButton.custom_id) { 
                unNick();
                return message.drake("moderation/un-nickall:SUCCES", {
                    emoji: "succes"
                });
            } else {
                message.drake("common:CANCEL", { emoji: "succes"});
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            }
        });
    };
};

module.exports = UnNickall;