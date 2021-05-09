const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Suggest extends Command {

    constructor(client) {
        super(client, {
            name: "suggest",
            aliases: [ "sugg", "suggestion" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_CHANNELS" ],
            userPerms: [],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        let suggestion = args.join(" ");
        let channel = message.guild.channels.cache.get(data.guild.plugins.suggestions);

        if(channel == undefined) return message.drake("general/suggest:DISABLED", {
            emoji: "error",
            toRun: data.guild.prefix + "setsuggest <channel>"
        });

        if(!suggestion) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "suggest <suggestion>"
        });

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/suggest:TITLE"))
        .setColor("ORANGE")
        .setThumbnail("https://cdn.discordapp.com/attachments/759728705730773022/767132300290031676/light.png")
        .setDescription(suggestion)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setFooter(this.client.cfg.footer);

        let msg = await channel.send(embed);

        message.drake("general/suggest:SUCCES", {
            emoji: "succes"
        });

        await msg.react('✅');
        await msg.react('➖');
        await msg.react('❌');
    };
};

module.exports = Suggest;