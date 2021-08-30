const Command = require("../../structure/Commands.js");

const { MessageEmbed } = require("discord.js");
const NekosLife = require("nekos.life")
const neko = new NekosLife()

class Slap extends Command {

    constructor(client) {
        super(client, {
            name: "slap",
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

        if(args[0]) user = message.mentions.users.first() || (args[0] && args[0] !== "random" ? await this.client.users.fetch(args[0]) : null);
        if(!user) user = this.client.user;

        if(args[0] === "random") user = message.guild.members.cache.random(5).filter(member => member.user.id !== message.author.id)[0].user;

        let img = await neko.sfw.slap();

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setImage(img.url)
        .setColor("RANDOM")
        .setFooter(this.client.cfg.footer)
        .setDescription(message.drakeWS("social/slap:SLAP", {
            slaped: user.username,
            slaper: message.author.username,
            emoji: "slap"
        }));

        return message.channel.send({
            embeds: [embed]
        });
    };
};

module.exports = Slap;