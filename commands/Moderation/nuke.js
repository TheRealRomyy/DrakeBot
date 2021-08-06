const Command = require("../../structure/Commands.js");
const { MessageActionRow, MessageButton } = require('discord.js');

class Nuke extends Command {

    constructor(client) {
        super(client, {
            name: "nuke",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_CHANNELS", "MANAGE_MESSAGES" ],
            userPerms: [ "MANAGE_CHANNELS", "MANAGE_MESSAGES" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "☢️ Nuke a channel (clear all of his messages)"
            }
        });
    };

    async run(message, args, data) {

        async function nuke() {
            const position = message.channel.position;
            const newChannel = await message.channel.clone();
            await message.channel.delete();
            newChannel.setPosition(position);

            return newChannel.send({
                content: message.drakeWS("moderation/nuke:SUCCES", {
                    emoji: "nuke",
                    author: message.author
                })
            });
        };

        let msg = await message.channel.send({
            content: message.drakeWS("moderation/nuke:CONFIRM", {
                emoji: "question"
            })
        });

        let yesButton = new MessageButton()
        .setStyle('SUCCESS')
        .setLabel('Yes 👍')
        .setDisabled(false)
        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}YES-NUKE`);

        let noButton = new MessageButton()
        .setStyle('DANGER')
        .setLabel('No 👎')
        .setDisabled(false)
        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NO-NUKE`);

        let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

        const filter = (button) => button.user.id === message.author.id && (
            button.customId === yesButton.customId ||
            button.customId === noButton.customId
        );

        await msg.edit({
            components: [group1]
        }).catch(() => {});

        const collector = msg.createMessageComponentCollector({ filter, max: 1, time: 60000, errors: ['time'] })
        
        collector.on("collect", async button => {
            if(!button) {
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            };
            if(button.customId === yesButton.customId) { 
                return nuke();
            } else {
                const cancelMessage = await message.channel.send({
                    content: message.drakeWS("common:CANCEL", { emoji: "succes"})
                });
                setTimeout(() => cancelMessage.delete().catch(() => {}), 3000);
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            };
        });
    };

    async runInteraction(interaction, data) {

        async function nuke() {
            const position = interaction.channel.position;
            const newChannel = await interaction.channel.clone();
            await interaction.channel.delete();
            newChannel.setPosition(position);

            return newChannel.send({
                content: interaction.drakeWS("moderation/nuke:SUCCES", {
                    emoji: "nuke",
                    author: interaction.user
                })
            });
        };

        await interaction.reply({
            content: interaction.drakeWS("moderation/nuke:CONFIRM", {
                emoji: "question"
            })
        });

        let yesButton = new MessageButton()
        .setStyle('SUCCESS')
        .setLabel('Yes 👍')
        .setDisabled(false)
        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}YES-NUKE`);

        let noButton = new MessageButton()
        .setStyle('DANGER')
        .setLabel('No 👎')
        .setDisabled(false)
        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NO-NUKE`);

        let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

        const filter = (button) => button.user.id === interaction.user.id && (
            button.customId === yesButton.customId ||
            button.customId === noButton.customId
        );

        await interaction.editReply({
            components: [group1]
        }).catch(() => {});

        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000, errors: ['time'] })
        
        collector.on("collect", async button => {
            if(!button) {
                await interaction.deleteReply();
            };
            if(button.customId === yesButton.customId) { 
                return nuke();
            } else {
                await interaction.editReply({
                    content: interaction.drakeWS("common:CANCEL", { emoji: "succes"}),
                    components: []
                });
                setTimeout(async () => {
                    await interaction.deleteReply();
                }, 3000);
            };
        });
    };
};

module.exports = Nuke;