const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");

class Premium extends Command {

    constructor(client) {
        super(client,{
            name: "premium",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [ "OWNER" ]
        });
    };

    async run(message, args, data) {

        let client = this.client;

        if(!args[0] || !args[1]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "premium <add/remove> <id>"
        });

        let guild = client.guilds.cache.get(args[1]);
        if(!guild) return message.channel.send(client.emotes["error"] + " **Je ne trouve pas ce serveur !**");
        let guildData = await client.db.findOrCreateGuild(guild);

        switch(args[0]) {
            case "add":
                if(!args[2] || (args[4] && isNaN(ms(args[4])))) return message.drake("errors:NOT_CORRECT", {
                    emoji: "error",
                    usage: data.guild.prefix + "premium add <id> <user> <label> (duration)"
                });

                let user = message.mentions.users.first() || client.users.cache.get(args[2]);
                let label = args[3];
                let duration = args[4] ? ms(args[4]) : ms("1y");

                let caseInfo = {
                    user: user.id,
                    moderator: message.author.id,
                    date: Date.now(),
                    label, 
                    duration
                };

                guildData.premium = {
                    premium: true,
                    since: Date.now(),
                    expires: duration + Date.now(),
                    subs: guildData.premium.subs
                };

                guildData.premium.subs.push(caseInfo);

                await guildData.save();

                console.log(guildData)

                message.channel.send(client.emotes["succes"] + " **" + guild.name + "** est maintenant premium pour: `" + message.time.convertMS(duration) + "` !");
                break;
            case "remove":
                if(!guildData.premium.premium) return message.channel.send(client.emotes["error"] + " **Ce serveur n'est pas premium !**");

                guildData.premium.premium = false;
                guildData.premium.since = null;
                guildData.premium.expires = null;

                guildData.premium.subs.forEach(subscription => {
                    subscription.isEnabled = "no";
                });

                await guildData.save();

                message.channel.send(client.emotes["succes"] + " **" + guild.name + "** n'est plus premium !");
                break;
            default:
                message.channel.send(client.emotes["error"] + " **Veuillez spécifier `add ou remove` !**");
                break;
        };
    };
};

module.exports = Premium;