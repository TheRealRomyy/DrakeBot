const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Say extends Command {

    constructor(client) {
        super(client, {
            name: "say",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],
        });
    };

    async run(message, args, data) {

        let toSay = args.join(" ");
        let Formater = this.client.formater;

        toSay = new Formater(toSay).say();

        if(!toSay) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "say <content>"
        });

        const webhooks = await message.channel.fetchWebhooks();
        let webhook = null;

        if(webhooks.first() !== undefined) webhook = webhooks.first();
        else webhook = await message.channel.createWebhook('DrakeBot', {
            avatar: this.client.user.displayAvatarURL({ dynamic:true }),
        });

        await message.delete();

        await webhook.send(toSay, {
            username: message.author.username,
            avatarURL: message.author.displayAvatarURL({ dynamic:true }),
        });
    };
};

module.exports = Say;