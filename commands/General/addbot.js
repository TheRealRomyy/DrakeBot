const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Addbot extends Command {

    constructor(client) {
        super(client, {
            name: "addbot",
            aliases: [ "add", "invite", "support" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],
        });
    };

    async run(message, args, data) {

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/addbot:TITLE", {
            name: this.client.user.username
        }))
        .setColor("RANDOM")
        .setDescription('\n ❯ [Support](https://discord.gg/mYDdTbx) \n \n ❯ [Invite](https://discord.com/oauth2/authorize?client_id=762965943529766912&permissions=8&scope=bot)')
        .setFooter(this.client.cfg.footer)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))

        return message.channel.send(embed);
    };
};

module.exports = Addbot;