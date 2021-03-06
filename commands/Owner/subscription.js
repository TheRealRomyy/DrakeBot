const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Subscription extends Command {

    constructor(client) {
        super(client,{
            name: "subscription",
            aliases: [ "sub" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [ "MODERATOR" ]
        });
    };

    async run(message, args, data) {

        let client = this.client;

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "subscription <id>"
        });

        let guild = client.guilds.cache.get(args[0]);
        if(!guild) return message.channel.send(client.emotes["error"] + " **Je ne trouve pas ce serveur !**");

        let guildData = await client.db.findOrCreateGuild(guild);

        const embed = new MessageEmbed()
        .setTitle("Status de __" + guild.name + "__")
        .setColor(guildData.premium.premium ? client.cfg.color.green : client.cfg.color.red)
        .setDescription(guildData.premium.premium ? client.emotes.status["online"] + " Ce serveur est premium. \n**Expire le:** __" + message.time.printDate(guildData.premium.expires) + "__" : client.emotes.status["dnd"] +  " Ce serveur n'est pas premium")
        .setFooter(client.cfg.footer);

        data.guild.premium.subs.forEach(subscription => {
            embed.addField(`${(((subscription.date + subscription.duration) < Date.now) || subscription.isEnabled == "no") ? "<:dnd:750782449168023612>" : "<:online:750782471423000647>"} __${subscription.label}__`, `User: **${client.users.cache.get(subscription.user).username}** \nDate: **${message.time.printDate(subscription.date)}** \nExpire: **${message.time.printDate(subscription.date + subscription.duration)}**`, true)
        });

        return message.channel.send(embed);
    };
};

module.exports = Subscription;