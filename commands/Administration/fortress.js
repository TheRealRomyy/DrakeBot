const Command = require("../../structure/Commands.js");
const { MessageButton, MessageActionRow } = require("discord.js");

class Fortress extends Command {

    constructor(client) {
        super(client, {
            name: "fortress",
            aliases: ["forteresse"],
            enabled: true,
            dirname: __dirname,
            botPerms: [ "ADMINISTRATOR" ],
            userPerms: [ "ADMINISTRATOR" ],
            restriction: [],

            slashCommandOptions: {
                description: "🏰 Toogle fortress mode (user can't join)"
            }
        });
    };

    async run(message, args, data) {

        let filter = null;
        let confirmationMsg = null;

        async function WaitForButtons(msg) {

            let button = null;
    
            await msg.awaitMessageComponent({ filter, max: 1, time: 60000, errors: ['time'] }).then(async collected => {
                button = collected;
                await button.deferUpdate();
            }).catch(collected => {
                return cancel();
            });
    
            if(button == null) return;
            return button.customId;
        };

        async function cancel() {
            confirmationMsg.delete().catch(() => {});
            message.delete().catch(() => {});
        };

        if(data.guild.fortress) {

            data.guild.fortress = false;
            await data.guild.save();

            return message.drake("administration/fortress:SUCCES_DISABLED", {
                emoji: "succes"
            });

        } else {
            let yesButton = new MessageButton()
                .setStyle("SUCCESS")
                .setLabel('Yes 👍')
                .setDisabled(false)
                .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}YES`);

            let noButton = new MessageButton()
                .setStyle("DANGER")
                .setLabel('No 👎')
                .setDisabled(false)
                .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NO`);

            let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

            filter = (button) => button.user.id === message.author.id && (
                button.customId === yesButton.customId ||
                button.customId === noButton.customId
            );

            confirmationMsg = await message.channel.send({
                content: message.drakeWS("administration/fortress:CONFIRMATION", {
                    emoji: "question"
                }),
                components: [group1]
            });

            let button = await WaitForButtons(confirmationMsg);

            if(button === yesButton.customId) {

                confirmationMsg.delete().catch(() => {});

                data.guild.fortress = true;
                await data.guild.save()

                return message.drake("administration/fortress:SUCCES", {
                    emoji: "succes"
                });

            } else if(button === noButton.customId) {
                confirmationMsg.delete().catch(() => {});

                return message.drake("common:CANCEL", {
                    emoji: "succes"
                });
            } else {
                return cancel()
            };
        };
    };

    async runInteraction(interaction, data) {

        await interaction.reply({
            content: "** **"
        });

        let filter = null;
        let confirmationMsg = null;

        async function WaitForButtons(msg) {

            let button = null;
    
            await msg.awaitMessageComponent({ filter, max: 1, time: 60000, errors: ['time'] }).then(async collected => {
                button = collected;
                await button.deferUpdate();
            }).catch(collected => {
                return cancel();
            });
    
            if(button == null) return;
            return button.customId;
        };

        async function cancel() {
            confirmationMsg.delete().catch(() => {});
        };

        if(data.guild.fortress) {

            data.guild.fortress = false;
            await data.guild.save();

            return interaction.editReply({
                content: interaction.drakeWS("administration/fortress:SUCCES_DISABLED", {
                    emoji: "succes"
                })
            });

        } else {
            let yesButton = new MessageButton()
                .setStyle("SUCCESS")
                .setLabel('Yes 👍')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}YES`);

            let noButton = new MessageButton()
                .setStyle("DANGER")
                .setLabel('No 👎')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NO`);

            let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

            filter = (button) => button.user.id === interaction.user.id && (
                button.customId === yesButton.customId ||
                button.customId === noButton.customId
            );

            confirmationMsg = await interaction.channel.send({
                content: interaction.drakeWS("administration/fortress:CONFIRMATION", {
                    emoji: "question"
                }),
                components: [group1]
            });

            let button = await WaitForButtons(confirmationMsg);

            if(button === yesButton.customId) {

                confirmationMsg.delete().catch(() => {});

                data.guild.fortress = true;
                await data.guild.save()

                return interaction.editReply({
                    content: interaction.drakeWS("administration/fortress:SUCCES", {
                        emoji: "succes"
                    })
                });

            } else if(button === noButton.customId) {
                confirmationMsg.delete().catch(() => {});

                return interaction.editReply({
                    content: interaction.drakeWS("common:CANCEL", {
                        emoji: "succes"
                    }),
                    ephemeral: true
                });
            } else {
                return cancel()
            };
        };
    };
};

module.exports = Fortress;