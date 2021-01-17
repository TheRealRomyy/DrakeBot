const Command = require("../../structure/Commands.js");

const { MessageEmbed } = require("discord.js");
const minecraft = require('minecraft-api');
const mojang = require('mojang-api');
const { lookupUUID } = require("namemc");

class Minecraft extends Command {

    constructor(client) {
        super(client, {
            name: "minecraft",
            aliases: [ "mc", "mc-profil", "mc-profile" ],
            enabled: true,
            dirname: __dirname,
            botPerms: [ "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        // const filter = (reaction, user) => {
        //     return ['⬅️', '❌', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
        // };

        let arrayProfils = [];
        // let arrayProfilsCount = [];

        let count = 1;
        // let fcount = 1;
        let anticount = 0;
        // let page = 1;

        // async function WaitForReaction(msg) {

        //     let reaction = null;

        //     await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
        //         reaction = collected.first();
        //         reaction.users.remove(message.author.id).catch(() => {});
        //     }).catch(collected => {
        //         msg.reactions.removeAll().catch(() => {});
        //     });

        //     if(reaction == null) return msg.reactions.removeAll().catch(() => {});
        //     return reaction.emoji.name;
        // };

        // async function loop(msg, res, count) {

        //     await msg.react('⬅️');
        //     await msg.react('❌');
        //     await msg.react('➡️');

        //     let reaction = await WaitForReaction(msg);

        //     await res.forEach((pseudo) => {
        //         if((page * 5) > 5) {
        //             arrayProfils[pseudo.name] = "ghost"
        //             arrayProfilsCount[pseudo.name] = fcount;
        //             fcount++;
        //             return anticount++
        //         } else {
        //             arrayProfils[pseudo.name] = count
        //             count++
        //         };
        //     });

        //     switch(reaction) {
        //         case "❌":
        //             return msg.reactions.removeAll().catch(() => {});
        //         case "⬅️":
        //             if(page == 1) return msg.reactions.removeAll().catch(() => {});
        //             else await loop(msg, res, count);
        //         case "➡️":
        //             if(canGoRight(page, anticount)) {
        //                 page++;
        //                 embed.setDescription(res.map(pseudo => (arrayProfils[pseudo.name] === "ghost" && arrayProfilsCount[pseudo.name] !== "fghost") ? "**" + (arrayProfilsCount[pseudo.name] + count) + ")** " + pseudo.name.replace("_", "\\_") + " **>** " + (arrayProfils[pseudo.name] !== 1 ? message.time.printDate(pseudo.changedToAt) : "**Premier pseudo**") + "\n" : "").join(" ") + (anticount > 0 ? "[Et " + anticount + " autres pseudos](https://fr.namemc.com/profile/" + mcProfil + ")" : ""))
        //                 msg.edit(embed);
        //                 await loop(msg, res, count);
        //             } else return msg.reactions.removeAll().catch(() => {});
        //         default:
        //             return msg.reactions.removeAll().catch(() => {});
        //     };
        // };

        // function canGoRight(page, anticount) {
        //     let neededPage = 1;
        //     neededPage = Math.round(anticount / 5);

        //     if(page < neededPage) return true
        //     else return false;
        // };

        let mcProfil = args[0];

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setColor(this.client.cfg.color.blue)
        .setFooter(this.client.cfg.footer)

        if(!mcProfil) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "minecraft <pseudo>"
        });

        let uuid = await minecraft.uuidForName(args[0]);

        if(uuid === undefined) return message.channel.send(this.client.emotes["error"] + " Je ne trouve pas le compte **" + mcProfil + "** !")

        const namemcLookup = await lookupUUID(uuid);

        embed.setImage(namemcLookup.imageUrls.body)
        .setThumbnail(namemcLookup.imageUrls.face);

        await mojang.nameHistory(uuid, async function(err, res) {
            if(err) console.log(err);
            await res.forEach((pseudo) => {
                if(count > 5) {
                    arrayProfils[pseudo.name] = "ghost"
                    // arrayProfilsCount[pseudo.name] = fcount;
                    // fcount++;
                    return anticount++
                } else {
                    arrayProfils[pseudo.name] = count
                    count++
                };
            });

            embed.setDescription(res.map(pseudo => arrayProfils[pseudo.name] !== "ghost" ? "**" + arrayProfils[pseudo.name] + ")** " + pseudo.name.replace("_", "\\_") + " **>** " + (arrayProfils[pseudo.name] !== 1 ? message.time.printDate(pseudo.changedToAt) : "**Premier pseudo**") + "\n" : "").join(" ") + (anticount > 0 ? "[Et " + anticount + " autres pseudos](https://fr.namemc.com/profile/" + mcProfil + ")" : ""));
            
            return message.channel.send(embed);
            // let msg = await message.channel.send(embed);
            
            // if(!canGoRight(page, anticount)) return;

            // await loop(msg, res, count);
        });
    };
};

module.exports = Minecraft;