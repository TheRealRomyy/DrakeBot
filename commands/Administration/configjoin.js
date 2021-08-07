const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class ConfigJoin extends Command {

    constructor(client) {
        super(client, {
            name: "configjoin",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Configure the join message"
            }
        });
    };

    async run(message, args, data) {

       if(data.guild.plugins.welcome.enabled) {

            // Send message
            message.drake("administration/configjoin:DISABLED", {
                emoji: "succes"
            });

            // Update the data
            data.guild.plugins.welcome.enabled = false;
            await data.guild.save();

       } else {

            // Create filter
            const opt = { 
                filter: (m) => m.author.id === message.author.id,
                max: 1, 
                time: 90000, 
                errors: [ "time" ]
            };
            
            // Send the first instruction
            let msg = await message.channel.send({
                content: message.drakeWS("administration/configjoin:INSTRUCTION_1", {
                    emoji: "write"
                })
            });

            // Get first response
            let collected = await message.channel.awaitMessages(opt).catch(() => {});
            if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                emoji: "succes"
            });

            const confMessage = collected.first().content;
            if(confMessage === "cancel") return message.drake("common:CANCEL", {
                emoji: "succes"
            });

            if(confMessage === data.guild.prefix + "configjoin") return;
            collected.first().delete().catch(() => {});

            // Send the second instruction
            msg.edit({
                content: message.drakeWS("administration/configjoin:INSTRUCTION_2", {
                    emoji: "write"
                })
            });

            // Get second response
            collected = await message.channel.awaitMessages(opt).catch(() => {});
            if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                emoji: "succes"
            });

            const confChannel = collected.first();
            if(confChannel.content === "cancel") return message.drake("common:CANCEL", {
                emoji: "succes"
            });

            let channel = confChannel.mentions.channels.first() || message.guild.channels.cache.get(confChannel.content) || message.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
            if(confChannel.content.toLowerCase() === "current") channel = "current";
            if(!channel || channel.type === "voice") return message.drake("administration/configjoin:CHANNEL_NOT_FOUND", {
                channel: confChannel.content,
                emoji: "error"
            });

            collected.first().delete().catch(() => {});

            // Send succes message
            const successMessage = await message.channel.send({
                content: message.drakeWS("administration/configjoin:SUCCES", {
                    emoji: "succes"
                })
            });

            setTimeout(() => successMessage.delete().catch(() => {}), 3000);

            let simulation = confMessage                    
                .replace("{user}", message.author)
                .replace("{user.nickname}", message.guild.members.cache.get(message.author.id).nickname !== null ? message.guild.members.cache.get(message.author.id).nickname : message.author.username)
                .replace("{inviter}", this.client.user)
                .replace("{guild.name}", message.guild.name)
                .replace("{guild.members}", message.guild.memberCount)

            // Create embed
            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/configjoin:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .addField(message.drakeWS("common:MESSAGE"), confMessage)
            .addField(message.drakeWS("common:SIMULATION"), simulation)
            .addField(message.drakeWS("common:CHANNEL"), channel !== "current" ? "<#" + channel.id + ">" : "Current")
            .setColor("RANDOM")
            .setFooter(this.client.cfg.footer);

            // Send embed and delete instructions
            msg.delete().catch(() => {});
            message.channel.send({
                embeds: [embed]
            });

            // Update the data
            data.guild.plugins.welcome.enabled = true;
            data.guild.plugins.welcome.message = confMessage;
            data.guild.plugins.welcome.channel = channel.id;
            await data.guild.save();
        };
    };

    async runInteraction(interaction, data) {

        if(data.guild.plugins.welcome.enabled) {
 
            // Send message
            interaction.reply({
                content: interaction.drakeWS("administration/configjoin:DISABLED", {
                    emoji: "succes"
                })
            });

            // Update the data
            data.guild.plugins.welcome.enabled = false;
            await data.guild.save();
 
        } else {
 
            // Create filter
            const opt = { 
                filter: (m) => m.author.id === interaction.user.id,
                max: 1, 
                time: 90000, 
                errors: [ "time" ]
            };
            
            // Send the first instruction
            await interaction.reply({
                content: interaction.drakeWS("administration/configjoin:INSTRUCTION_1", {
                    emoji: "write"
                })
            });

            // Get first response
            let collected = await interaction.channel.awaitMessages(opt).catch(() => {});
            if(!collected || !collected.first()) return interaction.reply({
                content: interaction.drakeWS("common:CANCEL", {
                    emoji: "succes"
                }),
                ephemeral: true
            });

            const confMessage = collected.first().content;
            if(confMessage === "cancel") return interaction.reply({
                content: interaction.drakeWS("common:CANCEL", {
                    emoji: "succes"
                }),
                ephemeral: true
            });

            if(confMessage === data.guild.prefix + "configjoin") return;
            collected.first().delete().catch(() => {});

            // Send the second instruction
            interaction.editReply({
                content: interaction.drakeWS("administration/configjoin:INSTRUCTION_2", {
                    emoji: "write"
                })
            });

            // Get second response
            collected = await interaction.channel.awaitMessages(opt).catch(() => {});
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
            if(confChannel.content.toLowerCase() === "current") channel = "current";
            if(!channel || channel.type === "voice") return interaction.reply({
                content: interaction.drakeWS("administration/configjoin:CHANNEL_NOT_FOUND", {
                    channel: confChannel.content,
                    emoji: "error"
                }),
                ephemeral: true
            });

            collected.first().delete().catch(() => {});

            // Send succes message
            const successMessage = await interaction.channel.send({
                content: interaction.drakeWS("administration/configjoin:SUCCES", {
                    emoji: "succes"
                })
            });

            setTimeout(() => successMessage.delete().catch(() => {}), 3000);

            let simulation = confMessage                    
                .replace("{user}", interaction.user)
                .replace("{user.nickname}", interaction.guild.members.cache.get(interaction.user.id).nickname !== null ? interaction.guild.members.cache.get(interaction.user.id).nickname : interaction.user.username)
                .replace("{inviter}", this.client.user)
                .replace("{guild.name}", interaction.guild.name)
                .replace("{guild.members}", interaction.guild.memberCount)

            // Create embed
            const embed = new MessageEmbed()
            .setTitle(interaction.drakeWS("administration/configjoin:TITLE"))
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
            .addField(interaction.drakeWS("common:MESSAGE"), confMessage)
            .addField(interaction.drakeWS("common:SIMULATION"), simulation)
            .addField(interaction.drakeWS("common:CHANNEL"), channel !== "current" ? "<#" + channel.id + ">" : "Current")
            .setColor("RANDOM")
            .setFooter(this.client.cfg.footer);

            // Send embed and delete instructions
            interaction.editReply({
                embeds: [embed],
                content: null
            });

            // Update the data
            data.guild.plugins.welcome.enabled = true;
            data.guild.plugins.welcome.message = confMessage;
            data.guild.plugins.welcome.channel = channel.id;
            await data.guild.save();
        };
     };
};

module.exports = ConfigJoin;