const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Setlog extends Command {

    constructor(client) {
        super(client, {
            name: "setlog",
            aliases: [ "log", "logs", "setlogs" ],
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

        async function waitForMessage() {
            filter = (m) => m.author.id === message.author.id;
            const opt = { max: 1, time: 90000, errors: [ "time" ] };

            // Send the instruction
            let msg = await message.channel.send(message.drakeWS("administration/setlog:INSTRUCTION", {
                emoji: "write"
            }));

            // Get the response
            let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
            if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                emoji: "succes"
            });

            const confChannel = collected.first();
            if(confChannel.content === "cancel") return message.drake("common:CANCEL", {
                emoji: "succes"
            });

            let channel = confChannel.mentions.channels.first() || message.guild.channels.cache.get(confChannel.content) || message.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
            if(!channel || channel.type === "voice") return message.drake("misc:CHANNEL_NOT_FOUND", {
                emoji: "error"
            });

            collected.first().delete().catch(() => {});
            msg.delete().catch(() => {});

            filter = (reaction, user) => {
                return ['1️⃣', '2️⃣', '3️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            return channel.id;
        };

        async function displayMain(msg) {

            let isModLogEnabled = data.guild.plugins.logs.mod;
            let isMessagesLogsEnabled = data.guild.plugins.logs.messages;

            let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/setlog:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/setlog:DESC"))
            .addField(message.drakeWS("administration/setlog:ONE"), isModLogEnabled ? client.channels.cache.get(isModLogEnabled) : disabled)
            .addField(message.drakeWS("administration/setlog:TWO"), isMessagesLogsEnabled ? client.channels.cache.get(isMessagesLogsEnabled) : disabled)
    
            return msg.edit(embed);
        };

        async function updateEmbed(type) {

            let isModLogEnabled = data.guild.plugins.logs.mod;
            let isMessagesLogsEnabled = data.guild.plugins.logs.messages;

            let action = null;
            let channel = null;

            if(type === "mod") {
                isModLogEnabled ? action = disabled : action = enabled;
                !isModLogEnabled ? action = enabled : action = disabled;
                isModLogEnabled ? data.guild.plugins.logs.mod = false : channel = await waitForMessage();
            };

            if(type === "messages") {
                isMessagesLogsEnabled ? action = disabled : action = enabled;
                !isMessagesLogsEnabled ? action = enabled : action = disabled;
                isMessagesLogsEnabled ? data.guild.plugins.logs.messages = false : channel = await waitForMessage();
            };

            if(action === enabled) data.guild.plugins.logs[type] = channel;
            if(action === enabled) action = client.channels.cache.get(data.guild.plugins.logs[type]);

            let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/setlog:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/setlog:DESC"))
            .addField(message.drakeWS("administration/setlog:ONE"), type === "mod" ? action : ( isModLogEnabled ? client.channels.cache.get(isModLogEnabled) : disabled))
            .addField(message.drakeWS("administration/setlog:TWO"), type === "messages" ? action : ( isMessagesLogsEnabled ? client.channels.cache.get(isMessagesLogsEnabled) : disabled))

            await data.guild.save();
            return msg.edit(embed);
        };

        async function wait(first) {

            let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/setlog:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                emoji: "waiting"
            }));
    
            if(first) return message.channel.send(embed);
            return msg.edit(embed);
        };

        async function start(first) {
    
            if(first) msg = await wait(true);
            if(first == false) msg = await wait(false);
    
            await msg.react('1️⃣');
            await msg.react('2️⃣');
    
            msg = await displayMain(msg);
    
            const r = await WaitForReaction(msg);
            if(first) return r;
            await switchCTV(r);
    
        };
    
        async function after() {
            const r = await WaitForReaction(msg);
            await switchCTV(r);
        };
    
        async function switchCTV(ctv) {
            switch(ctv) {
                
                case '1️⃣':
                    await updateEmbed("mod");
                    await after();
                    break;
                case '2️⃣':
                    await updateEmbed("messages");
                    await after();
                    break;
                default:
                    return;
            };
        };
    
        async function cancel() {
            msg.delete();
            message.delete();
        };
    
        const ctv = await start(true);
        await switchCTV(ctv);
    };
};

module.exports = Setlog;