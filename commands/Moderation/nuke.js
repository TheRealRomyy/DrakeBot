const Command = require("../../structure/Commands.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

class Nuke extends Command {

    constructor(client) {
        super(client, {
            name: "nuke",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_CHANNELS", "MANAGE_MESSAGES" ],
            userPerms: [ "MANAGE_CHANNELS", "MANAGE_MESSAGES" ],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {
                
        const filter = (button) => button.clicker.user.id === message.author.id;

        async function nuke() {
            const position = message.channel.position;
            const newChannel = await message.channel.clone();
            await message.channel.delete();
            newChannel.setPosition(position);

            return newChannel.send(message.drakeWS("moderation/nuke:SUCCES", {
                emoji: "nuke",
                author: message.author
            }));
        };

        let msg = await message.channel.send(message.drakeWS("moderation/nuke:CONFIRM", {
            emoji: "question"
        }));

        let yesButton = new MessageButton()
        .setStyle('green')
        .setLabel('Yes 👍')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}YES-NUKE`);

        let noButton = new MessageButton()
        .setStyle('red')
        .setLabel('No 👎')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}NO-NUKE`);

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
                return nuke();
            } else {
                return cancel();
            }
        });

        async function cancel() {
            message.drake("common:CANCEL", { emoji: "succes"});
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
        };
    };
};

module.exports = Nuke;