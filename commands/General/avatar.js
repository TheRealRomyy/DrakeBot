const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Avatar extends Command {

    constructor(client) {
        super(client, {
            name: "avatar",
            aliases: [ "pp" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        const client = this.client;

        const user = (message.mentions.users.first() || message.author);

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/avatar:TITLE", {
            user: user.tag
        }))
        .setFooter(client.cfg.footer)
        .setColor(client.cfg.color.purple)
        .setDescription("[" + message.drakeWS("general/avatar:HERE") + "](" + user.avatarURL({ dynamic: true }) + ")")
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setImage(user.displayAvatarURL({ format: 'png', size: 1024, dynamic: true }))

        message.channel.send(embed);
    };
};

module.exports = Avatar;