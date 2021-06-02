const Command = require("../../structure/Commands.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

class Nickall extends Command {

    constructor(client) {
        super(client, {
            name: "nickall",
            aliases: [ "nick-all" ],
            dirname: __dirname,
            enabled: false,
            botPerms: [ "MANAGE_NICKNAMES", "CHANGE_NICKNAME" ],
            userPerms: [ "MANAGE_NICKNAMES" ],
            cooldown: 10,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "nickall <nickname>"
        });

        const filter = (button) => button.clicker.user.id === message.author.id;

        let nick = args.join(" ");

        async function nickAll() {
            await message.guild.members.cache.forEach((member) => {
                member.setNickname(nick).catch(() => {});
            });

            return msg.delete().catch(() => {});
        };

        let msg = await message.channel.send(message.drakeWS("moderation/nickall:CONFIRM", {
            emoji: "question"
        }));

        let yesButton = new MessageButton()
        .setStyle('green')
        .setLabel('Yes 👍')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}YES-NICKALL`);

        let noButton = new MessageButton()
        .setStyle('red')
        .setLabel('No 👎')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}NO-NICKALL`);

        let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

        await msg.edit({
            components: [group1]
        }).catch(() => {});
        
        await msg.awaitButtons(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let button = collected.first();
            if(!button) {
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            };
            if(button.id === yesButton.custom_id) { 
                nickAll();
                return message.drake("moderation/nickall:SUCCES", {
                    emoji: "succes"
                });
            } else {
                message.drake("common:CANCEL", { emoji: "succes"});
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            };
        });
    };
};

module.exports = Nickall;