const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class ConfigLevel extends Command {

    constructor(client) {
        super(client, {
            name: "config-level",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Setup level up message or disable exp plugin"
            }
        });
    };

    async run(message, args, data) {

       if(data.guild.plugins.levels.enabled) {

            // Send message
            message.drake("level/config-level:DISABLED", {
                emoji: "succes"
            });

            // Update the data
            data.guild.plugins.levels.enabled = false;
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
                content: message.drakeWS("level/config-level:INSTRUCTION_1", {
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
            if(confMessage === data.guild.prefix + "config-level") return;
            collected.first().delete().catch(() => {});

            // Send the second instruction
            msg.edit({
                content: message.drakeWS("level/config-level:INSTRUCTION_2", {
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
            if(!channel || channel.type === "voice") return message.drake("level/config-level:CHANNEL_NOT_FOUND", {
                channel: confChannel.content,
                emoji: "error"
            });
            collected.first().delete().catch(() => {});

            // Send succes message
            const lastMsg = await message.channel.send({
                content: message.drakeWS("level/config-level:SUCCES", {
                    emoji: "succes"
                })
            });

            setTimeout(() => lastMsg.delete().catch(() => {}), 3000);

            let simulation = confMessage                    
                .replace(/{user}/g, message.author)
                .replace(/{user.nickname}/g, message.guild.members.cache.get(message.author.id).nickname !== null ? message.guild.members.cache.get(message.author.id).nickname : message.author.username)
                .replace(/{level}/g, data.member.level)
                .replace(/{xp}/g, data.member.exp);

            // Create embed
            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("level/config-level:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .addField(message.drakeWS("common:MESSAGE"), `${confMessage}`)
            .addField(message.drakeWS("common:SIMULATION"), `${simulation}`)
            .addField(message.drakeWS("common:CHANNEL"), `${channel !== "current" ? "<#" + channel.id + ">" : "Current"}`)
            .setColor("RANDOM")
            .setFooter(this.client.cfg.footer);

            // Send embed and delete instructions
            msg.delete().catch(() => {});
            message.channel.send({
                embeds: [embed]
            });

            // Update the data
            data.guild.plugins.levels.enabled = true;
            data.guild.plugins.levels.message = confMessage;
            data.guild.plugins.levels.channel = channel.id;
            await data.guild.save();
        };
    };

    async runInteraction(interaction, data) {

        if(data.guild.plugins.levels.enabled) {
 
            // Send message
            interaction.reply({
                content: interaction.drakeWS("level/config-level:DISABLED", {
                    emoji: "succes"
                }),
                ephemeral: true
            });
 
            // Update the data
            data.guild.plugins.levels.enabled = false;
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
            let msg = await interaction.reply({
                content: interaction.drakeWS("level/config-level:INSTRUCTION_1", {
                    emoji: "write"
                })
            });

            // Get first response
            let collected = await interaction.channel.awaitMessages(opt).catch(() => {});
            if(!collected || !collected.first()) return interaction.drake("common:CANCEL", {
                emoji: "succes"
            });
            const confMessage = collected.first().content;
            if(confMessage === "cancel") return interaction.drake("common:CANCEL", {
                emoji: "succes"
            });
            if(confMessage === data.guild.prefix + "config-level") return;
            collected.first().delete().catch(() => {});

            // Send the second instruction
            interaction.editReply({
                content: interaction.drakeWS("level/config-level:INSTRUCTION_2", {
                    emoji: "write"
                })  
            });

            // Get second response
            collected = await interaction.channel.awaitMessages(opt).catch(() => {});
            if(!collected || !collected.first()) return interaction.drake("common:CANCEL", {
                emoji: "succes"
            });
            const confChannel = collected.first();
            if(confChannel.content === "cancel") return interaction.drake("common:CANCEL", {
                emoji: "succes"
            });
            let channel = confChannel.mentions.channels.first() || interaction.guild.channels.cache.get(confChannel.content) || interaction.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
            if(confChannel.content.toLowerCase() === "current") channel = "current";
            if(!channel || channel.type === "voice") return interaction.drake("level/config-level:CHANNEL_NOT_FOUND", {
                channel: confChannel.content,
                emoji: "error"
            });
            collected.first().delete().catch(() => {});

            // Send succes message
            const lastMsg = await interaction.channel.send({
                content: interaction.drakeWS("level/config-level:SUCCES", {
                    emoji: "succes"
                })
            });

            setTimeout(() => lastMsg.delete().catch(() => {}), 3000);

            let simulation = confMessage                    
                .replace(/{user}/g, interaction.user)
                .replace(/{user.nickname}/g, interaction.guild.members.cache.get(interaction.user.id).nickname !== null ? interaction.guild.members.cache.get(interaction.user.id).nickname : interaction.user.username)
                .replace(/{level}/g, data.member.level)
                .replace(/{xp}/g, data.member.exp);

            // Create embed
            const embed = new MessageEmbed()
            .setTitle(interaction.drakeWS("level/config-level:TITLE"))
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
            .addField(interaction.drakeWS("common:MESSAGE"), `${confMessage}`)
            .addField(interaction.drakeWS("common:SIMULATION"), `${simulation}`)
            .addField(interaction.drakeWS("common:CHANNEL"), `${channel !== "current" ? "<#" + channel.id + ">" : "Current"}`)
            .setColor("RANDOM")
            .setFooter(this.client.cfg.footer);

            // Send embed and delete instructions
            interaction.editReply({
                embeds: [embed],
                content: null
            });

            // Update the data
            data.guild.plugins.levels.enabled = true;
            data.guild.plugins.levels.message = confMessage;
            data.guild.plugins.levels.channel = channel.id;
            await data.guild.save();
        };
     };
};

module.exports = ConfigLevel;