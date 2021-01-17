const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Automod extends Command {

    constructor(client) {
        super(client, {
            name: "automod",
            aliases: [ "automod" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "ADMINISTRATOR" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let client = this.client;
        let msg = null;

        const enabled = message.drakeWS("administration/automod:ENABLED");
        const disabled = message.drakeWS("administration/automod:DISABLED");

        if(!data.guild.plugins.automod) data.guild.plugins.automod = {
            antiPub: false,
            antiBadwords: false,
			antiMajs: false	
        };
        
        const opt = { max: 1, time: 50000, errors: [ "time" ] };
        let filter = (reaction, user) => {
            return ['1️⃣', '2️⃣', '3️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        async function WaitForReaction(msg) {

            let reaction = null;
    
            await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
                reaction = collected.first();
                reaction.users.remove(message.author.id);
            }).catch(collected => {
                return cancel();
            });
    
            if(reaction == null) return;
            return reaction.emoji.name;
        };

        async function displayMain(msg) {

            let isAntipubEnabled = data.guild.plugins.automod.antiPub;
            let isAntiBadwordsEnabled = data.guild.plugins.automod.antiBadwords;
            let isAntifullMajsEnabled = data.guild.plugins.automod.antiMajs;

            let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/automod:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/automod:DESC"))
            .addField(message.drakeWS("administration/automod:ONE"), isAntipubEnabled ? enabled : disabled)
            .addField(message.drakeWS("administration/automod:TWO"), isAntiBadwordsEnabled ? enabled : disabled)
            .addField(message.drakeWS("administration/automod:THREE"),isAntifullMajsEnabled ? enabled : disabled)
    
            return msg.edit(embed);
        }

        async function updateEmbed(type) {

            let isAntipubEnabled = data.guild.plugins.automod.antiPub;
            let isAntiBadwordsEnabled = data.guild.plugins.automod.antiBadwords;
            let isAntifullMajsEnabled = data.guild.plugins.automod.antiMajs;

            let action = null;

            if(type === "pub") {
                isAntipubEnabled ? action = disabled : action = enabled;
                !isAntipubEnabled ? action = enabled : action = disabled;
                isAntipubEnabled ? data.guild.plugins.automod.antiPub = false : data.guild.plugins.automod.antiPub = true;
            };

            if(type === "badwords") {
                isAntiBadwordsEnabled ? action = disabled : action = enabled;
                !isAntiBadwordsEnabled ? action = enabled : action = disabled;
                isAntiBadwordsEnabled ? data.guild.plugins.automod.antiBadwords = false : data.guild.plugins.automod.antiBadwords = true;
            };

            if(type === "majs") {
                isAntifullMajsEnabled ? action = disabled : action = enabled;
                !isAntifullMajsEnabled ? action = enabled : action = disabled;
                isAntifullMajsEnabled ? data.guild.plugins.automod.antiMajs = false : data.guild.plugins.automod.antiMajs = true;
            };

            let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/automod:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/automod:DESC"))
            .addField(message.drakeWS("administration/automod:ONE"), type === "pub" ? action : ( isAntipubEnabled ? enabled : disabled))
            .addField(message.drakeWS("administration/automod:TWO"), type === "badwords" ? action : ( isAntiBadwordsEnabled ? enabled : disabled))
            .addField(message.drakeWS("administration/automod:THREE"), type === "majs" ? action : ( isAntifullMajsEnabled ? enabled : disabled));

            await data.guild.save();
            return msg.edit(embed);
        };

        async function wait(first) {

            let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/automod:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                emoji: "waiting"
            }));
    
            if(first) return message.channel.send(embed);
            return msg.edit(embed);
        }

        async function start(first) {
    
            if(first) msg = await wait(true);
            if(first == false) msg = await wait(false);
    
            await msg.react('1️⃣');
            await msg.react('2️⃣');
            await msg.react('3️⃣');
    
            msg = await displayMain(msg);
    
            const r = await WaitForReaction(msg);
            if(first) return r;
            await switchCTV(r);
    
        }
    
        async function after() {
            const r = await WaitForReaction(msg);
            await switchCTV(r);
        }
    
        async function switchCTV(ctv) {
            switch(ctv) {
                
                case '1️⃣':
                    await updateEmbed("pub");
                    await after();
                    break;
                case '2️⃣':
                    await updateEmbed("badwords");
                    await after();
                    break;
                case '3️⃣':
                    await updateEmbed("majs");
                    await after();
                    break;
                default:
                    return;
            }
        }
    
        async function cancel() {
            msg.delete();
            message.delete();
        }
    
        const ctv = await start(true);
        await switchCTV(ctv);
    };
};

module.exports = Automod;