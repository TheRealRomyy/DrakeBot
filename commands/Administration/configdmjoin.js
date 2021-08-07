const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class ConfigDm extends Command {

    constructor(client) {
        super(client, {
            name: "configdmjoin",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Manage join message in direct messages"
            }
        });
    };

    async run(message, args, data) {

       if(data.guild.plugins.welcomeDM !== null) {

            // Send message
            message.drake("administration/configdm:DISABLED", {
                emoji: "succes"
            });

            // Update the data
            data.guild.plugins.welcomeDM = null;
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
                content: message.drakeWS("administration/configdm:INSTRUCTION_1", {
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

            if(confMessage === data.guild.prefix + "configdm") return;
            collected.first().delete().catch(() => {});

            // Send succes message
            const successMessage = await message.channel.send({
                content: message.drakeWS("administration/configdm:SUCCES", {
                    emoji: "succes"
                })
            });

            setTimeout(() => successMessage.delete().catch(() => {}), 3000);

            let simulation = confMessage                    
                .replace("{user}", message.author)
                .replace("{guild.name}", message.guild.name)
                .replace("{guild.members}", message.guild.memberCount)

            // Create embed
            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/configdm:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .addField(message.drakeWS("common:MESSAGE"), confMessage)
            .addField(message.drakeWS("common:SIMULATION"), simulation)
            .setColor("RANDOM")
            .setFooter(this.client.cfg.footer);

            // Send embed and delete instructions
            msg.delete().catch(() => {});
            message.channel.send({
                embeds: [embed]
            });

            // Update the data
            data.guild.plugins.welcomeDM = confMessage;
            await data.guild.save();
        };
    };

    async runInteraction(interaction, data) {

        if(data.guild.plugins.welcomeDM !== null) {
 
            // Send message
            interaction.reply({
                content: interaction.drakeWS("administration/configdm:DISABLED", {
                    emoji: "succes"
                })
            });

            // Update the data
            data.guild.plugins.welcomeDM = null;
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
                content: interaction.drakeWS("administration/configdm:INSTRUCTION_1", {
                    emoji: "write"
                })
            });

            // Get first response
            let collected = await interaction.channel.awaitMessages(opt).catch(() => {});
            if(!collected || !collected.first()) return interaction.editReply({
                content: interaction.drakeWS("common:CANCEL", {
                    emoji: "succes"
                }),
                ephemeral: true
            });

            const confMessage = collected.first().content;
            if(confMessage === "cancel") return interaction.editReply({
                content: interaction.drakeWS("common:CANCEL", {
                    emoji: "succes"
                }),
                ephemeral: true
            });

            if(confMessage === data.guild.prefix + "configdm") return;
            collected.first().delete().catch(() => {});

            // Send succes message
            const successMessage = await interaction.channel.send({
                content: interaction.drakeWS("administration/configdm:SUCCES", {
                    emoji: "succes"
                })
            });

            setTimeout(() => successMessage.delete().catch(() => {}), 3000);

            let simulation = confMessage                    
                .replace("{user}", interaction.user)
                .replace("{guild.name}", interaction.guild.name)
                .replace("{guild.members}", interaction.guild.memberCount)

            // Create embed
            const embed = new MessageEmbed()
            .setTitle(interaction.drakeWS("administration/configdm:TITLE"))
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
            .addField(interaction.drakeWS("common:MESSAGE"), confMessage)
            .addField(interaction.drakeWS("common:SIMULATION"), simulation)
            .setColor("RANDOM")
            .setFooter(this.client.cfg.footer);

            // Send embed and delete instructions
            interaction.editReply({
                embeds: [embed],
                content: null
            });

            // Update the data
            data.guild.plugins.welcomeDM = confMessage;
            await data.guild.save();
        };
     };
};

module.exports = ConfigDm;