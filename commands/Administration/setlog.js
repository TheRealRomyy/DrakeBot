const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const ms = require("ms");

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
            restriction: [],

            slashCommandOptions: {
                description: "Manage logs channels"
            }
        });
    };

    async run(message, args, data) {

        const client = this.client;

        const disabled = message.drakeWS("administration/automod:DISABLED");

        let isModLogEnabled = data.guild.plugins.logs.mod;
        let isMessagesLogsEnabled = data.guild.plugins.logs.messages;

        let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/setlog:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/setlog:DESC"))
            .addField(message.drakeWS("administration/setlog:ONE"), `${isModLogEnabled ? client.channels.cache.get(isModLogEnabled) : disabled}`)
            .addField(message.drakeWS("administration/setlog:TWO"), `${isMessagesLogsEnabled ? client.channels.cache.get(isMessagesLogsEnabled) : disabled}`);

        let modButton = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel('Mod 🚨')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}MOD-LOG`);

        let messageButton = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel('Message 📑')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}MESSAGE-LOG`);

        let group1 = new MessageActionRow().addComponents([ modButton, messageButton ]);

        message.reply({
            embeds: [embed],
            components: [group1]
        }).then(async m => {

            let filter = (button) => button.user.id === message.author.id && (
                button.customId === modButton.customId ||
                button.customId === messageButton.customId
            );

            const collector = m.channel.createMessageComponentCollector({
                filter,
                time: ms("10m")
            });

            collector.on("collect", async b => {

                await b.deferUpdate();

                switch(b.customId) {
                    case modButton.customId:
                        toggleButton(m, "disabled");

                        let modChannel = null;
                        isModLogEnabled = data.guild.plugins.logs.mod;

                        if(isModLogEnabled) data.guild.plugins.logs.mod = false
                        else {
                            modChannel = await waitForMessage();
                            data.guild.plugins.logs.mod = modChannel;
                        };

                        toggleButton(m, "enabled");
                        await updateEmbed(m);
                        break;
                    case messageButton.customId:
                        toggleButton(m, "disabled");

                        let messageChannel = null;
                        isMessagesLogsEnabled = data.guild.plugins.logs.messages;

                        if(isMessagesLogsEnabled) data.guild.plugins.logs.messages = false
                        else {
                            messageChannel = await waitForMessage();
                            data.guild.plugins.logs.messages = messageChannel;
                        };

                        toggleButton(m, "enabled");
                        await updateEmbed(m);
                        break;
                    default:
                        console.error("Default case in setlog.js");
                        break;
                };

            });

            collector.on("end", async () => {
                toggleButton(m, "disabled");
            });

        });

        async function waitForMessage() {
            const opt = { 
                filter: (m) => m.author.id === message.author.id,
                max: 1, 
                time: 90000, 
                errors: [ "time" ] 
            };

            // Send the instruction
            let msg = await message.channel.send({
                content: message.drakeWS("administration/setlog:INSTRUCTION", {
                    emoji: "write"
                 })
            });

            // Get the response
            let collected = await message.channel.awaitMessages(opt).catch(() => {});
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

            return channel.id;
        };
    
        async function toggleButton(m, mode) {
            modButton.setDisabled(mode === "disabled" ? true : false)
            messageButton.setDisabled(mode === "disabled" ? true : false)

            let group2 = new MessageActionRow().addComponents([ modButton, messageButton ]);

            m.edit({
                components: [group2],
            });
        };

        async function updateEmbed(msg) {

            isModLogEnabled = data.guild.plugins.logs.mod;
            isMessagesLogsEnabled = data.guild.plugins.logs.messages;

            let embed = new MessageEmbed()
                .setTitle(message.drakeWS("administration/setlog:TITLE"))
                .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
                .setFooter(client.cfg.footer)
                .setColor(client.cfg.color.purple)
                .setDescription(message.drakeWS("administration/setlog:DESC"))
                .addField(message.drakeWS("administration/setlog:ONE"), `${isModLogEnabled ? client.channels.cache.get(isModLogEnabled) : disabled}`)
                .addField(message.drakeWS("administration/setlog:TWO"), `${isMessagesLogsEnabled ? client.channels.cache.get(isMessagesLogsEnabled) : disabled}`);

            msg.edit({
                components: msg.components,
                embeds: [embed]
            });
        };
    };

    async runInteraction(interaction, data) {

        const client = this.client;

        const disabled = interaction.drakeWS("administration/automod:DISABLED");

        let isModLogEnabled = data.guild.plugins.logs.mod;
        let isMessagesLogsEnabled = data.guild.plugins.logs.messages;

        let embed = new MessageEmbed()
            .setTitle(interaction.drakeWS("administration/setlog:TITLE"))
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(interaction.drakeWS("administration/setlog:DESC"))
            .addField(interaction.drakeWS("administration/setlog:ONE"), `${isModLogEnabled ? client.channels.cache.get(isModLogEnabled) : disabled}`)
            .addField(interaction.drakeWS("administration/setlog:TWO"), `${isMessagesLogsEnabled ? client.channels.cache.get(isMessagesLogsEnabled) : disabled}`);

        let modButton = new MessageButton()
            .setStyle("SUCCESS")
            .setLabel('Mod 🚨')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}MOD-LOG`);

        let messageButton = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel('Message 📑')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}MESSAGE-LOG`);

        let group1 = new MessageActionRow().addComponents([ modButton, messageButton ]);

        interaction.reply({
            embeds: [embed],
            components: [group1]
        }).then(async m => {

            let filter = (button) => button.user.id === interaction.user.id && (
                button.customId === modButton.customId ||
                button.customId === messageButton.customId
            );

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: ms("10m")
            });

            collector.on("collect", async b => {

                await b.deferUpdate();

                switch(b.customId) {
                    case modButton.customId:
                        toggleButton(m, "disabled");

                        let modChannel = null;
                        isModLogEnabled = data.guild.plugins.logs.mod;

                        if(isModLogEnabled) data.guild.plugins.logs.mod = false
                        else {
                            modChannel = await waitForMessage();
                            data.guild.plugins.logs.mod = modChannel;
                        };

                        toggleButton(m, "enabled");
                        await updateEmbed(m);
                        await data.guild.save();
                        break;
                    case messageButton.customId:
                        toggleButton(m, "disabled");

                        let messageChannel = null;
                        isMessagesLogsEnabled = data.guild.plugins.logs.messages;

                        if(isMessagesLogsEnabled) data.guild.plugins.logs.messages = false
                        else {
                            messageChannel = await waitForMessage();
                            data.guild.plugins.logs.messages = messageChannel;
                        };

                        toggleButton(m, "enabled");
                        await updateEmbed(m);
                        await data.guild.save();
                        break;
                    default:
                        console.error("Default case in setlog.js");
                        break;
                };

            });

            collector.on("end", async () => {
                toggleButton(m, "disabled");
            });
        });

        async function waitForMessage() {
            const opt = { 
                filter: (m) => m.author.id === interaction.user.id,
                max: 1, 
                time: 90000, 
                errors: [ "time" ] 
            };

            // Send the instruction
            let msg = await interaction.channel.send({
                content: interaction.drakeWS("administration/setlog:INSTRUCTION", {
                    emoji: "write"
                 })
            });

            // Get the response
            let collected = await interaction.channel.awaitMessages(opt).catch(() => {});
            if(!collected || !collected.first()) return interaction.reply({
                content: interaction.drakeWS("common:CANCEL", {
                    emoji: "succes"
                }),
                ephemeral: true
            });

            const confChannel = collected.first();
            if(confChannel.content === "cancel") return interaction.reply({
                content: interaction.drakeWS("common:CANCEL", {
                    emoji: "succes"
                }),
                ephemeral: true
            });


            let channel = confChannel.mentions.channels.first() || interaction.guild.channels.cache.get(confChannel.content) || interaction.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
            if(!channel || channel.type === "voice") return interaction.reply({
                content: interaction.drakeWS("misc:CHANNEL_NOT_FOUND", {
                    emoji: "error"
                }),
                ephemeral: true
            });

            collected.first().delete().catch(() => {});
            msg.delete().catch(() => {});

            return channel.id;
        };
    
        async function toggleButton(m, mode) {
            modButton.setDisabled(mode === "disabled" ? true : false)
            messageButton.setDisabled(mode === "disabled" ? true : false)

            let group2 = new MessageActionRow().addComponents([ modButton, messageButton ]);

            interaction.editReply({
                components: [group2],
            });
        };

        async function updateEmbed() {

            isModLogEnabled = data.guild.plugins.logs.mod;
            isMessagesLogsEnabled = data.guild.plugins.logs.messages;

            let embed = new MessageEmbed()
                .setTitle(interaction.drakeWS("administration/setlog:TITLE"))
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic:true}))
                .setFooter(client.cfg.footer)
                .setColor(client.cfg.color.purple)
                .setDescription(interaction.drakeWS("administration/setlog:DESC"))
                .addField(interaction.drakeWS("administration/setlog:ONE"), `${isModLogEnabled ? client.channels.cache.get(isModLogEnabled) : disabled}`)
                .addField(interaction.drakeWS("administration/setlog:TWO"), `${isMessagesLogsEnabled ? client.channels.cache.get(isMessagesLogsEnabled) : disabled}`);

            interaction.editReply({
                embeds: [embed]
            });
        };
    };
};

module.exports = Setlog;