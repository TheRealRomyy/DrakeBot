const Command = require("../../structure/Commands");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Eco extends Command {

    constructor(client) {
        super(client, {
            name: "eco",
            aliases: [ "economy" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 0,
            restriction: [],

            slashCommandOptions: {
                description: "Manage the economy on your server",
                options: [
                    {
                        name: "action",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "What do you want to do ?",
                        choices: [
                            {
                                name: "➕ Give",
                                value: "give"
                            },
                            {
                                name: "➖ Remove",
                                value: "remove"
                            },
                            {
                                name: "💥 Reset",
                                value: "reset"
                            }
                        ]
                    },
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "On wich user ?"
                    },
                    {
                        name: "amount",
                        type: ApplicationCommandOptionTypes.NUMBER,
                        required: false,
                        description: "If add or remove : how many money ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!args[0] || !args[1]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "eco <give/remove/reset> <user> (amount)"
        });

        const type = args[0];
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        let amount = null;

        if(!member) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "eco <give/remove/reset> <user> (amount)"
        });

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);

        switch(type) {
            case "give": 
                if(isNaN(args[2]) || parseInt(args[2]) < 0) return message.drake("economy/eco:AMOUNT_REQUIRE", {
                    emoji: "error"
                });
                amount = parseInt(args[2]);
                if(!amount) return message.drake("economy/eco:AMOUNT_REQUIRE", {
                    emoji: "error"
                });
                if(amount > 1000000) return message.drake("economy/eco:MAX_AMOUNT", {
                    emoji: "error",
                    amount: "1 000 000" + data.guild.symbol
                });
                memberData.money += amount;
                await memberData.save(memberData);
                return message.drake("economy/eco:GIVE_SUCCES", {
                    emoji: "succes",
                    username: member.user.username,
                    symbol: data.guild.symbol,
                    amount
                });
            case "remove":
                if(isNaN(args[2])) return message.drake("economy/eco:AMOUNT_REQUIRE", {
                    emoji: "error"
                });
                amount = parseInt(args[2]);
                if(!amount) return message.drake("economy/eco:AMOUNT_REQUIRE", {
                    emoji: "error"
                });
                if(amount > memberData.money) return message.drake("economy/eco:NOT_ENOUGHT", {
                    emoji: "error",
                    username: member.user.username
                });
                memberData.money -= amount;
                await memberData.save(memberData);
                return message.drake("economy/eco:REMOVE_SUCCES", {
                    emoji: "succes",
                    username: member.user.username,
                    symbol: data.guild.symbol,
                    amount
                });
            case "reset":
                memberData.money = 0;
                memberData.banksold = 0;
                await memberData.save(memberData);
                return message.drake("economy/eco:RESET_SUCCES", {
                    emoji: "succes",
                    username: member.user.username
                });
            default:
                return message.drake("errors:NOT_CORRECT", {
                    emoji: "error",
                    usage: data.guild.prefix + "eco <give/remove/reset> <user> (amount)"
            });
        };
    };

    async runInteraction(interaction, data) {

        const type = interaction.options.getString("action");
        const member = interaction.options.getUser("user") ? interaction.guild.members.cache.get(interaction.options.getUser("user").id) : null;
        let amount = null;

        if(!member) return interaction.reply({
            content: interaction.drakeWS("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "eco <give/remove/reset> <user> (amount)"
            }),
            ephemeral: true
        });

        const memberData = await this.client.db.findOrCreateMember(member.id, interaction.guild);

        switch(type) {
            case "give": 
                if(!interaction.options.getNumber("amount") || interaction.options.getNumber("amount") < 0) return interaction.reply({
                    content: interaction.drakeWS("economy/eco:AMOUNT_REQUIRE", {
                        emoji: "error"
                    }),
                    ephemeral: true
                });

                amount = interaction.options.getNumber("amount");

                if(amount > 1000000) return interaction.reply({
                    content: interaction.drakeWS("economy/eco:MAX_AMOUNT", {
                        emoji: "error",
                        amount: "1 000 000" + data.guild.symbol
                    }),
                    ephemeral: true
                });

                memberData.money += amount;
                await memberData.save(memberData);

                return interaction.reply({
                        content: interaction.drakeWS("economy/eco:GIVE_SUCCES", {
                        emoji: "succes",
                        username: member.user.username,
                        symbol: data.guild.symbol,
                        amount
                    })
                });
            case "remove":
                if(!interaction.options.getNumber("amount") || interaction.options.getNumber("amount") < 0) return interaction.reply({
                    content: interaction.drakeWS("economy/eco:AMOUNT_REQUIRE", {
                        emoji: "error"
                    }),
                    ephemeral: true
                });

                amount = interaction.options.getNumber("amount");

                if(amount > memberData.money) return interaction.reply({
                    content: interaction.drakeWS("economy/eco:NOT_ENOUGHT", {
                        emoji: "error",
                        username: member.user.username
                    }),
                    ephemeral: true
                });

                memberData.money -= amount;
                await memberData.save(memberData);

                return interaction.reply({
                    content: interaction.drakeWS("economy/eco:REMOVE_SUCCES", {
                        emoji: "succes",
                        username: member.user.username,
                        symbol: data.guild.symbol,
                        amount
                    })
                });
            case "reset":
                memberData.money = 0;
                memberData.banksold = 0;
                await memberData.save(memberData);

                return interaction.reply({
                    content: interaction.drakeWS("economy/eco:RESET_SUCCES", {
                        emoji: "succes",
                        username: member.user.username
                    })
                });
            default:
                return interaction.reply({
                    content: interaction.drakeWS("errors:NOT_CORRECT", {
                        emoji: "error",
                        usage: data.guild.prefix + "eco <give/remove/reset> <user> (amount)"
                    }),
                    ephemeral: true
                });
        };
    };
};

module.exports = Eco;