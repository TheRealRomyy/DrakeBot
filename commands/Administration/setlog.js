const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

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
        const localButtonsID = {};

        let msg = null;

        const enabled = message.drakeWS("administration/automod:ENABLED");
        const disabled = message.drakeWS("administration/automod:DISABLED");
        
        let filter = (button) => button.clicker.user.id === message.author.id;

        async function waitForButton() {

            let button = null;
    
            await msg.awaitButtons(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                button = collected.first();
                if(!button) return cancel();
                button.reply.defer();
            });

            await changeButtonStatus("non-dispo");
    
            if(button == null) return;
            return button;
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

            filter = (button) => button.clicker.user.id === message.author.id;

            return channel.id;
        };

        async function displayMain(msg, returnEmbed) {

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
            
            if(returnEmbed) return embed;
            else return msg.edit({
                embed: embed
            });
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
            return msg.edit({
                embed: embed
            });
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
            return msg.edit({
                embed: embed
            });
        };

        async function changeButtonStatus(status) {

            let makeButtonAvailable = Boolean(status === "dispo");

            let modButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'green' : 'gray')
            .setLabel('Mod 🚨')
            .setID(localButtonsID["modButton"]);

            let messageButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Message 📑')
            .setID(localButtonsID["messageButton"]);

            if(!makeButtonAvailable) {
                modButton.setDisabled(true);
                messageButton.setDisabled(true);
            };

            let group1 = new MessageActionRow().addComponents([ modButton, messageButton ]);

            await msg.edit({
                components: [group1],
                embed: msg.embeds[0]
            }).catch(() => {});
        };

        async function start(first) {
    
            if(first) msg = await wait(true);
            if(first == false) msg = await wait(false);
    
            let modButton = new MessageButton()
            .setStyle('green')
            .setLabel('Mod 🚨')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}MOD`);

            let messageButton = new MessageButton()
            .setStyle('blurple')
            .setLabel('Message 📑')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}MESSAGE`);

            localButtonsID["modButton"] = modButton.custom_id;
            localButtonsID["messageButton"] = messageButton.custom_id;

            const embed = await displayMain(msg, true);

            let group1 = new MessageActionRow().addComponents([ modButton, messageButton ]);

            await msg.edit({
                components: [group1],
                embed: embed
            }).catch(() => {});
    
            const r = await waitForButton(msg);
            if(first) return r;
            await switchCTV(r);
    
        };
    
        async function after() {
            await changeButtonStatus("dispo");

            const r = await waitForButton();
            await switchCTV(r);
        };
    
        async function switchCTV(ctv) {
            switch(ctv.id) {
                
                case localButtonsID["modButton"]:
                    await updateEmbed("mod");
                    await after();
                    break;
                case localButtonsID["messageButton"]:
                    await updateEmbed("messages");
                    await after();
                    break;
                default:
                    return;
            };
        };
    
        async function cancel() {
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
        };
    
        const ctv = await start(true);
        await switchCTV(ctv);
    };
};

module.exports = Setlog;