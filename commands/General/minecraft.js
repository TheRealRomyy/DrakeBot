const Command = require("../../structure/Commands.js");
const MojangAPI = require('mojang-api');
const { MessageEmbed } = require("discord.js");

class Minecraft extends Command {

    constructor(client) {
        super(client, {
            name: "minecraft",
            aliases: ["mc", "mc-account"],
            enabled: false,
            dirname: __dirname,
            botPerms: [],
            userPerms: [],
            restriction: []
        });
    };

    async run(message, args, data) {

        const client = this.client;

        let pseudo = args[0];

        if(!pseudo) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "minecraft <pseudo>"
        });

        let uuid = null;

        MojangAPI.nameToUuid(pseudo, function(err, res) {
            if (err) return message.drake("general/minecraft:NO_UUID_FOUND", {
                emoji: "error"
            });
            uuid = res[0].id;
        });

        const embeds = [];
        let count = 0;
        let totalCount = 0;
        let embedCount = 0;

        if(uuid === null) return message.drake("general/minecraft:NO_UUID_FOUND", {
            emoji: "error"
        });

        MojangAPI.nameHistory(uuid, function(err, res) {
            if (err) console.log(error);
            else {
                let i = 0;
                var date;

                if(res.length == 1) {
                    date = message.drakeWS("general/minecraft:ACCOUNT_CREATED");

                    let embed = new MessageEmbed()
                    .setTitle("Minecraft Profile - " + pseudo)
                    .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                    .setColor(client.cfg.color.blue)
                    .setFooter(client.cfg.footer)
                    .setImage(`https://crafatar.com/renders/body/${uuid}?overlay=true`)
                    .setThumbnail(`https://mc-heads.net/avatar/${uuid}`)
                    .setDescription(`**${i+1}** • **${res[0].name.replace("_", "\\_")}** \`${date}\`.`)
                    .setTimestamp();

                    return message.channel.send(embed);
                } else {

                    for(i = 0; i <= (res.length - 1); i++) {
                        count++;
                        totalCount++;
                        if(count === 5) {
                            embedCount++;
                            count = 0;
                        };
            
                        if(!embeds[embedCount]) embeds[embedCount] = new MessageEmbed();
                        let oldDesc = embeds[embedCount].description;

                        if(i == 0) date = message.drakeWS("general/minecraft:ACCOUNT_CREATED");
                        else date = message.time.printDate(res[i].changedToAt);
            
                        embeds[embedCount].setDescription((oldDesc !== null ? oldDesc : "") + `**${i + 1}** • **${res[i].name.replace("_", "\\_")}** \`${date}\` \n \n`);
                    };

                    const pagination = new Pagination.Embeds()
                    .setArray(embeds)
                    .setAuthorizedUsers([message.author.id])
                    .setChannel(message.channel)
                    .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                    .setPageIndicator(true)
                    .setTimestamp()
                    .setPage(1)
                    .setColor(client.cfg.color.blue)
                    .setClientAssets({
                        prompt: message.drakeWS("general/minecraft:DUMP", {
                            user: "<@" + message.author.id + ">"
                        })
                    })
                    .setFooter(client.cfg.footer)
                    .setImage(`https://crafatar.com/renders/body/${uuid}?overlay=true`)
                    .setThumbnail(`https://mc-heads.net/avatar/${uuid}`)
                    .setTitle("Minecraft Profile - " + pseudo);
            
                    pagination.build();
                };
            };
        });
    };
};

module.exports = Minecraft;