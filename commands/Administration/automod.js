const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const ms = require("ms");

class Automod extends Command {

    constructor(client) {
        super(client, {
            name: "automod",
            aliases: [ "automod" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_MESSAGES" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Manage automod on your server"
            }
        });
    };

    async run(message, args, data) {

        let client = this.client;

        if(typeof(data.guild.plugins.automod.antiPub) != "object") data.guild.plugins.automod = {
            antiPub: {
                enabled: false,
                discord: true,
                links: true,
                ignoredChannels: [],
                ignoredRoles: []
            },
            antiBadwords: {
                enabled: false,
                ignoredChannels: [],
                ignoredRoles: []
            },
            antiMajs: {
                enabled: false,
                ignoredChannels: [],
                ignoredRoles: [],
            },
        };

        const enabled = message.drakeWS("administration/automod:ENABLED");
        const disabled = message.drakeWS("administration/automod:DISABLED");

        let isAntipubEnabled = data.guild.plugins.automod.antiPub.enabled;
        let isAntiBadwordsEnabled = data.guild.plugins.automod.antiBadwords.enabled;
        let isAntifullMajsEnabled = data.guild.plugins.automod.antiMajs.enabled;

        let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/automod:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/automod:DESC"))
            .addField(message.drakeWS("administration/automod:ONE"), isAntipubEnabled ? enabled : disabled)
            .addField(message.drakeWS("administration/automod:TWO"), isAntiBadwordsEnabled ? enabled : disabled)
            .addField(message.drakeWS("administration/automod:THREE"), isAntifullMajsEnabled ? enabled : disabled);
        
        let antipubButton = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel('Antipub 🔗')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}ANTIPUB`);

        let antiBadwordButton = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel('Anti badwords 🤬')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}ANTIBADWORD`);

        let antiFullmajButtin = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel('Anti full maj 🔠')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}ANTIFULLMAJ`);

        let group = new MessageActionRow().addComponents([ antipubButton, antiBadwordButton, antiFullmajButtin ]);

        message.reply({
            embeds: [embed],
            components: [group]
        }).then(async m => {

            const filter = (button) => button.user.id === message.author.id && (
                button.customId === antipubButton.customId ||
                button.customId === antiBadwordButton.customId ||
                button.customId === antiFullmajButtin.customId
            );

            const collector = m.channel.createMessageComponentCollector({
                filter,
                time: ms("10m")
            });

            collector.on("collect", async b => {

                await b.deferUpdate();

                switch(b.customId) {
                    case antipubButton.customId:

                        isAntipubEnabled = data.guild.plugins.automod.antiPub.enabled;

                        if(isAntipubEnabled) data.guild.plugins.automod.antiPub.enabled = false;
                        else data.guild.plugins.automod.antiPub.enabled = true;

                        await updateEmbed(m);
                        await data.guild.save();
                        break;
                    case antiBadwordButton.customId:

                        isAntiBadwordsEnabled = data.guild.plugins.automod.antiBadwords.enabled;

                        if(isAntiBadwordsEnabled) data.guild.plugins.automod.antiBadwords.enabled = false;
                        else data.guild.plugins.automod.antiBadwords.enabled = true;

                        await updateEmbed(m);
                        await data.guild.save();
                        break;
                    case antiFullmajButtin.customId:

                        isAntifullMajsEnabled = data.guild.plugins.automod.antiMajs.enabled;

                        if(isAntifullMajsEnabled) data.guild.plugins.automod.antiMajs.enabled = false;
                        else data.guild.plugins.automod.antiMajs.enabled = true;

                        await updateEmbed(m);
                        await data.guild.save();
                        break;
                    default:
                        client.emit("error", "Default case in switch (automod.js)")
                        return;
                };
            });

            collector.on("end", async () => {
                toggleButton(m, "disabled");
            });
        });

        async function toggleButton(m, mode) {
            antipubButton.setDisabled(mode === "disabled" ? true : false);
            antiBadwordButton.setDisabled(mode === "disabled" ? true : false);
            antiFullmajButtin.setDisabled(mode === "disabled" ? true : false);

            let group2 = new MessageActionRow().addComponents([ antipubButton, antiBadwordButton, antiFullmajButtin ]);

            m.edit({
                components: [group2]
            });
        };

        async function updateEmbed(msg) {

            isAntipubEnabled = data.guild.plugins.automod.antiPub.enabled;
            isAntiBadwordsEnabled = data.guild.plugins.automod.antiBadwords.enabled;
            isAntifullMajsEnabled = data.guild.plugins.automod.antiMajs.enabled;

            let embed1 = new MessageEmbed()
                .setTitle(message.drakeWS("administration/automod:TITLE"))
                .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
                .setFooter(client.cfg.footer)
                .setColor(client.cfg.color.purple)
                .setDescription(message.drakeWS("administration/automod:DESC"))
                .addField(message.drakeWS("administration/automod:ONE"), isAntipubEnabled ? enabled : disabled)
                .addField(message.drakeWS("administration/automod:TWO"), isAntiBadwordsEnabled ? enabled : disabled)
                .addField(message.drakeWS("administration/automod:THREE"), isAntifullMajsEnabled ? enabled : disabled);            

            msg.edit({
                components: msg.components,
                embeds: [embed1]
            });
        };
    };

    async runInteraction(interaction, data) {

        let client = this.client;

        if(typeof(data.guild.plugins.automod.antiPub) != "object") data.guild.plugins.automod = {
            antiPub: {
                enabled: false,
                discord: true,
                links: true,
                ignoredChannels: [],
                ignoredRoles: []
            },
            antiBadwords: {
                enabled: false,
                ignoredChannels: [],
                ignoredRoles: []
            },
            antiMajs: {
                enabled: false,
                ignoredChannels: [],
                ignoredRoles: [],
            },
        };

        const enabled = interaction.drakeWS("administration/automod:ENABLED");
        const disabled = interaction.drakeWS("administration/automod:DISABLED");

        let isAntipubEnabled = data.guild.plugins.automod.antiPub.enabled;
        let isAntiBadwordsEnabled = data.guild.plugins.automod.antiBadwords.enabled;
        let isAntifullMajsEnabled = data.guild.plugins.automod.antiMajs.enabled;

        let embed = new MessageEmbed()
            .setTitle(interaction.drakeWS("administration/automod:TITLE"))
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(interaction.drakeWS("administration/automod:DESC"))
            .addField(interaction.drakeWS("administration/automod:ONE"), isAntipubEnabled ? enabled : disabled)
            .addField(interaction.drakeWS("administration/automod:TWO"), isAntiBadwordsEnabled ? enabled : disabled)
            .addField(interaction.drakeWS("administration/automod:THREE"), isAntifullMajsEnabled ? enabled : disabled);
        
        let antipubButton = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel('Antipub 🔗')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}ANTIPUB`);

        let antiBadwordButton = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel('Anti badwords 🤬')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}ANTIBADWORD`);

        let antiFullmajButtin = new MessageButton()
            .setStyle("PRIMARY")
            .setLabel('Anti full maj 🔠')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}ANTIFULLMAJ`);

        let group = new MessageActionRow().addComponents([ antipubButton, antiBadwordButton, antiFullmajButtin ]);

        interaction.reply({
            embeds: [embed],
            components: [group]
        }).then(async m => {

            const filter = (button) => button.user.id === interaction.user.id && (
                button.customId === antipubButton.customId ||
                button.customId === antiBadwordButton.customId ||
                button.customId === antiFullmajButtin.customId
            );

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: ms("10m")
            });

            collector.on("collect", async b => {

                await b.deferUpdate();

                switch(b.customId) {
                    case antipubButton.customId:

                        isAntipubEnabled = data.guild.plugins.automod.antiPub.enabled;

                        if(isAntipubEnabled) data.guild.plugins.automod.antiPub.enabled = false;
                        else data.guild.plugins.automod.antiPub.enabled = true;

                        await updateEmbed(m);
                        await data.guild.save();
                        break;
                    case antiBadwordButton.customId:

                        isAntiBadwordsEnabled = data.guild.plugins.automod.antiBadwords.enabled;

                        if(isAntiBadwordsEnabled) data.guild.plugins.automod.antiBadwords.enabled = false;
                        else data.guild.plugins.automod.antiBadwords.enabled = true;

                        await updateEmbed(m);
                        await data.guild.save();
                        break;
                    case antiFullmajButtin.customId:

                        isAntifullMajsEnabled = data.guild.plugins.automod.antiMajs.enabled;

                        if(isAntifullMajsEnabled) data.guild.plugins.automod.antiMajs.enabled = false;
                        else data.guild.plugins.automod.antiMajs.enabled = true;

                        await updateEmbed(m);
                        await data.guild.save();
                        break;
                    default:
                        client.emit("error", "Default case in switch (automod.js)")
                        return;
                };
            });

            collector.on("end", async () => {
                toggleButton(m, "disabled");
            });
        });

        async function toggleButton(m, mode) {
            antipubButton.setDisabled(mode === "disabled" ? true : false);
            antiBadwordButton.setDisabled(mode === "disabled" ? true : false);
            antiFullmajButtin.setDisabled(mode === "disabled" ? true : false);

            let group2 = new MessageActionRow().addComponents([ antipubButton, antiBadwordButton, antiFullmajButtin ]);

            interaction.editReply({
                components: [group2]
            });
        };

        async function updateEmbed() {

            isAntipubEnabled = data.guild.plugins.automod.antiPub.enabled;
            isAntiBadwordsEnabled = data.guild.plugins.automod.antiBadwords.enabled;
            isAntifullMajsEnabled = data.guild.plugins.automod.antiMajs.enabled;

            let embed1 = new MessageEmbed()
                .setTitle(interaction.drakeWS("administration/automod:TITLE"))
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic:true}))
                .setFooter(client.cfg.footer)
                .setColor(client.cfg.color.purple)
                .setDescription(interaction.drakeWS("administration/automod:DESC"))
                .addField(interaction.drakeWS("administration/automod:ONE"), isAntipubEnabled ? enabled : disabled)
                .addField(interaction.drakeWS("administration/automod:TWO"), isAntiBadwordsEnabled ? enabled : disabled)
                .addField(interaction.drakeWS("administration/automod:THREE"), isAntifullMajsEnabled ? enabled : disabled);            

            await interaction.editReply({
                embeds: [embed1]
            });
        };
    };
};

module.exports = Automod;