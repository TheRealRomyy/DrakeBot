const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require('discord.js');

class Clear extends Command {

    constructor(client) {
        super(client, {
            name: "clear",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_MESSAGES", "MANAGE_CHANNELS" ],
            userPerms: [ "MANAGE_MESSAGES" ],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "🗑️ Purge the channel",
                options: [
                    {
                        name: "amount",
                        type: ApplicationCommandOptionTypes.INTEGER,
                        required: true,
                        description: "How many messages do you want to delete ?"
                    },
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: false,
                        description: "If you want to clear only message from a specific user"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(args[0] == "all") return message.drake("moderation/clear:NUKE_EXIST", { 
            prefix: data.guild.prefix, 
            emoji: "info" 
        });

        let amount = args[0];
        if(!amount || isNaN(amount) || parseInt(amount) < 1) return message.drake("errors:NOT_CORRECT", {
            emoji:	"error",
            usage: data.guild.prefix + "clear <amount> (user)"
        });

        await message.delete().catch(() => {});

        const user = message.mentions.users.first() || this.client.users.cache.get(args[1]) || this.client.users.cache.find(u => u.username === args[1]);

        let messages = await message.channel.messages.fetch({ 
            limit: 100 
        });

        messages = Array.from(messages.values());

        if(user) messages = messages.filter((m) => m.author.id === user.id);
        if(messages.length > amount) messages.length = parseInt(amount, 10);

        messages = messages.filter((m) => !m.pinned);
        amount++;

        message.channel.bulkDelete(messages, true);

        if(user) {
            const clearMessage = await message.channel.send({
                content: message.drakeWS("moderation/clear:CLEARED_MEMBER", {
                    amount: --amount,
                    username: user.tag,
                    emoji: "clear"
                })
            });

            setTimeout(() => clearMessage.delete().catch(() => {}), 3000);

        } else {
            const clearUserMessage = await message.channel.send({
                content: message.drakeWS("moderation/clear:CLEARED", {
                    amount: --amount,
                    emoji: "clear"
                })  
            });

            setTimeout(() => clearUserMessage.delete().catch(() => {}), 3000);
        };
    };

    async runInteraction(interaction, data) {

        let amount = interaction.options.getInteger("amount");
        if(!amount || isNaN(amount) || parseInt(amount) < 1) return interaction.reply({
            content: interaction.drakeWS("errors:NOT_CORRECT", {
                emoji:	"error",
                usage: data.guild.prefix + "clear <amount> (user)"
            }),
            ephemeral: true
        });

        const user = interaction.options.getUser("user");

        let messages = await interaction.channel.messages.fetch({ 
            limit: 100 
        });

        messages = Array.from(messages.values());

        if(user) messages = messages.filter((m) => m.author.id === user.id);
        if(messages.length > amount) messages.length = parseInt(amount, 10);

        messages = messages.filter((m) => !m.pinned);
        amount++;

        interaction.channel.bulkDelete(messages, true);

        if(user) await interaction.reply({
            content: interaction.drakeWS("moderation/clear:CLEARED_MEMBER", {
                amount: --amount,
                username: user.tag,
                emoji: "clear"
            }),
            ephemeral: true
        });
        else await interaction.reply({
            content: interaction.drakeWS("moderation/clear:CLEARED", {
                amount: --amount,
                emoji: "clear"
            }),
            ephemeral: true
        });
    };
};

module.exports = Clear;