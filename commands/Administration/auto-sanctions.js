const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const ms = require("ms");

class AutoSanctions extends Command {

    constructor(client) {
        super(client, {
            name: "auto-sanctions",
            aliases: ["autosanctions", "set-warns", "setwarns"],
            enabled: true,
            dirname: __dirname,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            restriction: [],

            slashCommandOptions: {
                description: "Manage auto sanctions on your server"
            }
        });
    };

    async run(message, args, data) {

        if(!data.guild.plugins.autosanctions || !Array.isArray(data.guild.plugins.autosanctions)) data.guild.plugins.autosanctions = [];
        if(!data.guild.sanctioncase) data.guild.sanctioncase = 0;

        const client = this.client;

        const embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/auto-sanctions:TITLE"))
            .setDescription(`${data.guild.plugins.autosanctions.length !== 0 ?
                data.guild.plugins.autosanctions.map(sanction => `**#${sanction.id}** \`🚩 ${sanction.warns} ⏱️ ${message.time.convertMS(sanction.time)}\`: **${sanction.sanction}** ${getEmoji(sanction.sanction)} ${sanction.timeOfSanction !== null 
                    ? "(" + message.time.convertMS(sanction.timeOfSanction) + ")" 
                    : ""}`).join("\n")
                : message.drakeWS("administration/auto-sanctions:ANY_SANCTIONS")}`)
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.blue);

        const addButton = new MessageButton()
            .setLabel("➕ Add sanction")
            .setStyle("SUCCESS")
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.channel.id}${message.author.id}${Date.now()}1`);

        const removeButton = new MessageButton()
            .setLabel("➖ Remove sanction")
            .setStyle("DANGER")
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.channel.id}${message.author.id}${Date.now()}2`);

        const clearButton = new MessageButton()
            .setLabel("💥 Clear sanctions")
            .setStyle("PRIMARY")
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.channel.id}${message.author.id}${Date.now()}3`);

        const group = new MessageActionRow().addComponents([ addButton, removeButton, clearButton ]);

        message.reply({
            embeds: [embed],
            components: [group]
        }).then(async m => {

            const filter = (button) => button.user.id === message.author.id;

            const opt = { 
                filter: (m) => m.author.id === message.author.id,
                max: 1, 
                time: 90000, 
                errors: ["time"] 
            };

            const collector = m.createMessageComponentCollector({
                filter,
                time: ms('10m')
            });

            collector.on('collect', async b => {
                
                await b.deferUpdate();

                switch (b.customId) {
                    case addButton.customId:

                        // Type ?

                        let msg = await message.channel.send({
                            content: message.drakeWS("administration/auto-sanctions:QUESTION1", {
                                emoji: "question"
                            })
                        });

                        let collected = await message.channel.awaitMessages(opt);
                        if (!collected || !collected.first()) return badInput(msg, message.drakeWS("administration/auto-sanctions:NOT_VALID"));

                        if (collected.first().content === "cancel") return badInput(msg, message.drakeWS("administration/auto-sanctions:CANCEL", {
                            emoji: "error"
                        }));
                        let confID = collected.first()

                        collected.first().delete().catch(() => {});

                        const sanctionType = confID.content;

                        if (isNaN(sanctionType) || sanctionType < 1 || sanctionType > 4) return badInput(msg, message.drakeWS("administration/auto-sanctions:BTW14"));

                        // Number of warns ?

                        await msg.edit({
                            content: message.drakeWS("administration/auto-sanctions:QUESTION2", {
                                emoji: "question"
                            })
                        });

                        collected = await message.channel.awaitMessages(opt);

                        if (!collected || !collected.first()) return badInput(msg, message.drakeWS("administration/auto-sanctions:NOT_VALID"));
                        if (collected.first().content === "cancel") return badInput(msg, message.drakeWS("administration/auto-sanctions:CANCEL", {
                            emoji: "error"
                        }));

                        let confNumber = collected.first();

                        collected.first().delete().catch(() => {});

                        const warnNumbers = confNumber.content;

                        if(isNaN(warnNumbers)) return badInput(msg, message.drakeWS("administration/auto-sanctions:NOT_VALID"));

                        // Warns in ?

                        await msg.edit({
                            content: message.drakeWS("administration/auto-sanctions:QUESTION3", {
                                warns: warnNumbers,
                                emoji: "question"
                            })
                        });

                        collected = await message.channel.awaitMessages(opt);

                        if (!collected || !collected.first()) return badInput(msg, message.drakeWS("administration/auto-sanctions:NOT_VALID"));
                        if (collected.first().content === "cancel") return badInput(msg, message.drakeWS("administration/auto-sanctions:CANCEL", {
                            emoji: "error"
                        }))

                        let confWarnsIn = collected.first();

                        collected.first().delete().catch(() => {});

                        const warnNumbersIn = confWarnsIn.content;

                        if (isNaN(ms(warnNumbersIn))) return badInput(msg, message.drakeWS("administration/auto-sanctions:INVALID_DATE"));

                        // Duration if mute

                        let duration = null;

                        if (sanctionType == "1") {
                            await msg.edit({
                                content: message.drakeWS("administration/auto-sanctions:QUESTION4", {
                                    emoji: "question"
                                })
                            });

                            collected = await message.channel.awaitMessages(opt);

                            if (!collected || !collected.first()) return badInput(msg, message.drakeWS("administration/auto-sanctions:NOT_VALID"));
                            if (collected.first().content === "cancel") return badInput(msg, message.drakeWS("administration/auto-sanctions:CANCEL", {
                                emoji: "error"
                            }));

                            let confDuration = collected.first();

                            collected.first().delete().catch(() => {});

                            duration = confDuration.content;

                            if(isNaN(ms(warnNumbersIn))) return badInput(msg, message.drakeWS("administration/auto-sanctions:INVALID_DATE"));
                        };

                        msg.delete().catch(() => {});

                        data.guild.sanctioncase++;

                        const sanctionCase = {
                            id: data.guild.sanctioncase,
                            sanction: sanctionType,
                            warns: warnNumbers,
                            time: ms(warnNumbersIn),
                            timeOfSanction: sanctionType === "1" ? ms(duration) : null,
                        };

                        data.guild.plugins.autosanctions.push(sanctionCase);
                        await data.guild.save();

                        updateEmbed(m, embed);
                        break;
                    case removeButton.customId:

                        const msg1 = await message.channel.send({
                            content: message.drakeWS("administration/auto-sanctions:QUESTION_DELETE")
                        });

                        const collected1 = await message.channel.awaitMessages(opt);

                        if (!collected1 || !collected1.first()) return badInput(msg1, message.drakeWS("administration/auto-sanctions:NOT_VALID"));
                        if (collected1.first().content === "cancel") return badInput(msg1, message.drakeWS("administration/auto-sanctions:CANCEL", {
                            emoji: "error"
                        }));

                        const confID1 = collected1.first();

                        collected1.first().delete().catch(() => {});
                        msg1.delete().catch(() => {});

                        let content1 = confID1.content;

                        if (isNaN(content1)) return badInput(msg1, message.drakeWS("administration/auto-sanctions:NOT_VALID"));
                        else {

                            const sanction = data.guild.plugins.autosanctions.filter(sanction => sanction.id === content1);

                            if (!sanction) return badInput(msg1, message.drakeWS("administration/auto-sanctions:INVALID_ID"));

                            data.guild.plugins.autosanctions = data.guild.plugins.autosanctions.filter(sanction => sanction.id !== parseInt(content1));
                            await data.guild.save();

                            updateEmbed(m, embed)
                        };
                        break;
                    case clearButton.customId:

                        data.guild.plugins.autosanctions = [];
                        await data.guild.save();

                        updateEmbed(m, embed);
                        break;
                    default:
                        console.error("Houston we got a problem"); // Oui chui un marrant moi
                        return;
                };
            });

            collector.on("end", async () => {
                const addButton1 = new MessageButton()
                    .setLabel("➕ Add sanction")
                    .setStyle("SUCCESS")
                    .setDisabled(true)
                    .setCustomId(`${message.guild.id}${message.channel.id}${message.author.id}${Date.now()}1`);
        
                const removeButton1 = new MessageButton()
                    .setLabel("➖ Remove sanction")
                    .setStyle("DANGER")
                    .setDisabled(true)
                    .setCustomId(`${message.guild.id}${message.channel.id}${message.author.id}${Date.now()}2`);
        
                const clearButton1 = new MessageButton()
                    .setLabel("💥 Clear sanctions")
                    .setStyle("PRIMARY")
                    .setDisabled(true)
                    .setCustomId(`${message.guild.id}${message.channel.id}${message.author.id}${Date.now()}3`);

                const group1 = new MessageActionRow().addComponents([ addButton1, removeButton1, clearButton1 ]);

                await m.edit({
                    components: [group1],
                    embeds: [embed],
                    content: null
                });
            });
        });

        async function updateEmbed(msg, embed) {
            embed.setDescription(`${data.guild.plugins.autosanctions.length !== 0 ?
                data.guild.plugins.autosanctions.map(sanction => `**#${sanction.id}** \`🚩 ${sanction.warns} ⏱️ ${message.time.convertMS(sanction.time)}\`: **${getName(sanction.sanction)}** ${getEmoji(sanction.sanction)} ${sanction.timeOfSanction !== null 
                    ? "(" + message.time.convertMS(sanction.timeOfSanction) + ")" 
                    : ""}`).join("\n")
                : message.drakeWS("administration/auto-sanctions:ANY_SANCTIONS")}`);

            await msg.edit({
                embeds: [embed]
            });
        };

        function getEmoji(sanction) {
            switch (sanction) {
                case "3":
                    return "🍌";
                case "4":
                    return "🔨";
                case "1":
                    return "🔇";
                case "2":
                    return "🚪";
            };
        };

        function getName(sanction) {
            switch (sanction) {
                case "3":
                    return "Softban";
                case "4":
                    return "Ban";
                case "1":
                    return "Mute";
                case "2":
                    return "Kick";
            };
        };

        async function badInput(question, reason) {
            const errorEmbed = new MessageEmbed()
                .setColor("#D54052")
                .setDescription(`${reason}`);

            let errorMessage = await message.channel.send({
                embeds: [errorEmbed]
            });

            setTimeout(() => errorMessage.delete().catch(() => {}), 5000);
            return question.delete().catch(() => {});
        };
    };

    async runInteraction(interaction, data) {

        if(!data.guild.plugins.autosanctions || !Array.isArray(data.guild.plugins.autosanctions)) data.guild.plugins.autosanctions = [];
        if(!data.guild.sanctioncase) data.guild.sanctioncase = 0;

        const client = this.client;

        const embed = new MessageEmbed()
            .setTitle(interaction.drakeWS("administration/auto-sanctions:TITLE"))
            .setDescription(`${data.guild.plugins.autosanctions.length !== 0 ?
                data.guild.plugins.autosanctions.map(sanction => `**#${sanction.id}** \`🚩 ${sanction.warns} ⏱️ ${interaction.time.convertMS(sanction.time)}\`: **${sanction.sanction}** ${getEmoji(sanction.sanction)} ${sanction.timeOfSanction !== null 
                    ? "(" + interaction.time.convertMS(sanction.timeOfSanction) + ")" 
                    : ""}`).join("\n")
                : interaction.drakeWS("administration/auto-sanctions:ANY_SANCTIONS")}`)
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.blue);

        const addButton = new MessageButton()
            .setLabel("➕ Add sanction")
            .setStyle("SUCCESS")
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.channel.id}${interaction.user.id}${Date.now()}1`);

        const removeButton = new MessageButton()
            .setLabel("➖ Remove sanction")
            .setStyle("DANGER")
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.channel.id}${interaction.user.id}${Date.now()}2`);

        const clearButton = new MessageButton()
            .setLabel("💥 Clear sanctions")
            .setStyle("PRIMARY")
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.channel.id}${interaction.user.id}${Date.now()}3`);

        const group = new MessageActionRow().addComponents([ addButton, removeButton, clearButton ]);

        interaction.reply({
            embeds: [embed],
            components: [group]
        }).then(async m => {

            const filter = (button) => button.user.id === interaction.user.id;

            const opt = { 
                filter: (m) => m.author.id === interaction.user.id,
                max: 1, 
                time: 90000, 
                errors: ["time"] 
            };

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: ms('10m')
            });

            collector.on('collect', async b => {
                
                await b.deferUpdate();

                switch (b.customId) {
                    case addButton.customId:

                        // Type ?

                        let msg = await interaction.channel.send({
                            content: interaction.drakeWS("administration/auto-sanctions:QUESTION1", {
                                emoji: "question"
                            })
                        });

                        let collected = await interaction.channel.awaitMessages(opt);
                        if (!collected || !collected.first()) return badInput(msg, interaction.drakeWS("administration/auto-sanctions:NOT_VALID"));

                        if (collected.first().content === "cancel") return badInput(msg, interaction.drakeWS("administration/auto-sanctions:CANCEL", {
                            emoji: "error"
                        }));
                        let confID = collected.first()

                        collected.first().delete().catch(() => {});

                        const sanctionType = confID.content;

                        if (isNaN(sanctionType) || sanctionType < 1 || sanctionType > 4) return badInput(msg, interaction.drakeWS("administration/auto-sanctions:BTW14"));

                        // Number of warns ?

                        await msg.edit({
                            content: interaction.drakeWS("administration/auto-sanctions:QUESTION2", {
                                emoji: "question"
                            })
                        });

                        collected = await interaction.channel.awaitMessages(opt);

                        if (!collected || !collected.first()) return badInput(msg, interaction.drakeWS("administration/auto-sanctions:NOT_VALID"));
                        if (collected.first().content === "cancel") return badInput(msg, interaction.drakeWS("administration/auto-sanctions:CANCEL", {
                            emoji: "error"
                        }));

                        let confNumber = collected.first();

                        collected.first().delete().catch(() => {});

                        const warnNumbers = confNumber.content;

                        if(isNaN(warnNumbers)) return badInput(msg, interaction.drakeWS("administration/auto-sanctions:NOT_VALID"));

                        // Warns in ?

                        await msg.edit({
                            content: interaction.drakeWS("administration/auto-sanctions:QUESTION3", {
                                warns: warnNumbers,
                                emoji: "question"
                            })
                        });

                        collected = await interaction.channel.awaitMessages(opt);

                        if (!collected || !collected.first()) return badInput(msg, interaction.drakeWS("administration/auto-sanctions:NOT_VALID"));
                        if (collected.first().content === "cancel") return badInput(msg, interaction.drakeWS("administration/auto-sanctions:CANCEL", {
                            emoji: "error"
                        }))

                        let confWarnsIn = collected.first();

                        collected.first().delete().catch(() => {});

                        const warnNumbersIn = confWarnsIn.content;

                        if (isNaN(ms(warnNumbersIn))) return badInput(msg, interaction.drakeWS("administration/auto-sanctions:INVALID_DATE"));

                        // Duration if mute

                        let duration = null;

                        if (sanctionType == "1") {
                            await msg.edit({
                                content: interaction.drakeWS("administration/auto-sanctions:QUESTION4", {
                                    emoji: "question"
                                })
                            });

                            collected = await interaction.channel.awaitMessages(opt);

                            if (!collected || !collected.first()) return badInput(msg, interaction.drakeWS("administration/auto-sanctions:NOT_VALID"));
                            if (collected.first().content === "cancel") return badInput(msg, interaction.drakeWS("administration/auto-sanctions:CANCEL", {
                                emoji: "error"
                            }));

                            let confDuration = collected.first();

                            collected.first().delete().catch(() => {});

                            duration = confDuration.content;

                            if(isNaN(ms(warnNumbersIn))) return badInput(msg, interaction.drakeWS("administration/auto-sanctions:INVALID_DATE"));
                        };

                        msg.delete().catch(() => {});

                        data.guild.sanctioncase++;

                        const sanctionCase = {
                            id: data.guild.sanctioncase,
                            sanction: sanctionType,
                            warns: warnNumbers,
                            time: ms(warnNumbersIn),
                            timeOfSanction: sanctionType === "1" ? ms(duration) : null,
                        };

                        data.guild.plugins.autosanctions.push(sanctionCase);
                        await data.guild.save();

                        updateEmbed(m, embed);
                        break;
                    case removeButton.customId:

                        const msg1 = await interaction.channel.send({
                            content: interaction.drakeWS("administration/auto-sanctions:QUESTION_DELETE")
                        });

                        const collected1 = await interaction.channel.awaitMessages(opt);

                        if (!collected1 || !collected1.first()) return badInput(msg1, interaction.drakeWS("administration/auto-sanctions:NOT_VALID"));
                        if (collected1.first().content === "cancel") return badInput(msg1, interaction.drakeWS("administration/auto-sanctions:CANCEL", {
                            emoji: "error"
                        }));

                        const confID1 = collected1.first();

                        collected1.first().delete().catch(() => {});
                        msg1.delete().catch(() => {});

                        let content1 = confID1.content;

                        if (isNaN(content1)) return badInput(msg1, interaction.drakeWS("administration/auto-sanctions:NOT_VALID"));
                        else {

                            const sanction = data.guild.plugins.autosanctions.filter(sanction => sanction.id === content1);

                            if (!sanction) return badInput(msg1, interaction.drakeWS("administration/auto-sanctions:INVALID_ID"));

                            data.guild.plugins.autosanctions = data.guild.plugins.autosanctions.filter(sanction => sanction.id !== parseInt(content1));
                            await data.guild.save();

                            updateEmbed(m, embed)
                        };
                        break;
                    case clearButton.customId:

                        data.guild.plugins.autosanctions = [];
                        await data.guild.save();

                        updateEmbed(m, embed);
                        break;
                    default:
                        console.error("Houston we got a problem"); // Oui chui un marrant moi
                        return;
                };
            });

            collector.on("end", async () => {
                const addButton1 = new MessageButton()
                    .setLabel("➕ Add sanction")
                    .setStyle("SUCCESS")
                    .setDisabled(true)
                    .setCustomId(`${interaction.guild.id}${interaction.channel.id}${interaction.user.id}${Date.now()}1`);
        
                const removeButton1 = new MessageButton()
                    .setLabel("➖ Remove sanction")
                    .setStyle("DANGER")
                    .setDisabled(true)
                    .setCustomId(`${interaction.guild.id}${interaction.channel.id}${interaction.user.id}${Date.now()}2`);
        
                const clearButton1 = new MessageButton()
                    .setLabel("💥 Clear sanctions")
                    .setStyle("PRIMARY")
                    .setDisabled(true)
                    .setCustomId(`${interaction.guild.id}${interaction.channel.id}${interaction.user.id}${Date.now()}3`);

                const group1 = new MessageActionRow().addComponents([ addButton1, removeButton1, clearButton1 ]);

                await interaction.editReply({
                    components: [group1],
                    embeds: [embed],
                    content: null
                });
            });
        });

        async function updateEmbed(msg, embed) {
            embed.setDescription(`${data.guild.plugins.autosanctions.length !== 0 ?
                data.guild.plugins.autosanctions.map(sanction => `**#${sanction.id}** \`🚩 ${sanction.warns} ⏱️ ${interaction.time.convertMS(sanction.time)}\`: **${getName(sanction.sanction)}** ${getEmoji(sanction.sanction)} ${sanction.timeOfSanction !== null 
                    ? "(" + interaction.time.convertMS(sanction.timeOfSanction) + ")" 
                    : ""}`).join("\n")
                : interaction.drakeWS("administration/auto-sanctions:ANY_SANCTIONS")}`);

            await interaction.editReply({
                embeds: [embed]
            });
        };

        function getEmoji(sanction) {
            switch (sanction) {
                case "3":
                    return "🍌";
                case "4":
                    return "🔨";
                case "1":
                    return "🔇";
                case "2":
                    return "🚪";
            };
        };

        function getName(sanction) {
            switch (sanction) {
                case "3":
                    return "Softban";
                case "4":
                    return "Ban";
                case "1":
                    return "Mute";
                case "2":
                    return "Kick";
            };
        };

        async function badInput(question, reason) {
            const errorEmbed = new MessageEmbed()
                .setColor("#D54052")
                .setDescription(`${reason}`);

            let errorMessage = await interaction.channel.send({
                embeds: [errorEmbed]
            });

            setTimeout(() => errorMessage.delete().catch(() => {}), 5000);
            return question.delete().catch(() => {});
        };
    };
};

module.exports = AutoSanctions;