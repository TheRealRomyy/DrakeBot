const Command = require("../../structure/Commands.js");

const { MessageEmbed } = require("discord.js");
const NekosLife = require("nekos.life")
const neko = new NekosLife()

class Feed extends Command {

    constructor(client) {
        super(client, {
            name: "feed",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let user = this.client.user;

        if(args[0]) user = message.mentions.users.first() || this.client.users.cache.get(args[0]) || this.client.users.cache.find(x => x.name === args[0]);
        if(!user) user = this.client.user;

        let img = await neko.sfw.feed();

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setImage(img.url)
        .setColor("RANDOM")
        .setFooter(this.client.cfg.footer)
        .setDescription(message.drakeWS("social/feed:FEED", {
            feeded: "**" + user.username + "**",
            feeder: "**" + message.author.username + "**",
            emoji: "feed"
        }));

        return message.channel.send(embed);
    };
};

module.exports = Feed;