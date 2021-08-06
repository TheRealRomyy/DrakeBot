const Command = require("../../structure/Commands.js");
const { MessageActionRow, MessageButton, Constants: { ApplicationCommandOptionTypes } } = require('discord.js');

class Ban extends Command {

    constructor(client) {
        super(client, {
            name: "ban",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "BAN_MEMBERS" ],
            userPerms: [ "BAN_MEMBERS"],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Ban an user",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "Who will be banned ?"
                    },
                    {
                        name: "reason",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: false,
                        description: "What did he did ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        let client = this.client;

        if(!args[0] && !message.mentions.users.first()) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "ban <user> (reason)",
            emoji: "error"
        });
        
        const user = message.mentions.users.first() || client.users.cache.get(args[0]);

        if(!user) return message.drake("misc:USER_NOT_FOUND", {
            emoji: "error"
        });

        if(user.id === message.author.id) return message.drake("misc:YOURSELF", {
            emoji: "error"
        });

        let reason = args.slice(message.mentions.users.first() ? (args[0].includes(user.id) ? 1 : 0) : 1).join(" ").replace("-f", "").trim();
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        const member = message.guild.members.cache.get(user.id);
        if(!member && !message.content.includes("-f")) return message.drake("moderation/ban:NOT_HERE", {
            emoji: "error",
            prefix: data.guild.prefix,
            user: user.id,
            reason: reason !== message.drakeWS("misc:NO_REASON") ? reason : "Spam"
        });

        if(member) {
            const memberPosition = member.roles.highest.position;
            const moderationPosition = message.member.roles.highest.position;
            if(moderationPosition < memberPosition) return message.drake("misc:SUPERIOR", {
                emoji: "error"
            });

            if(!member.kickable) return message.drake("moderation/ban:NOT_BANABLE", {
                emoji: "error"
            });
        };

        const memberData = member ? await client.db.findOrCreateMember(member, message.guild) : null;
        
        let msg = await message.channel.send({
            content: message.drakeWS("moderation/ban:CONFIRM", {
                emoji: "question",
                user: user.tag,
                reason: reason
            })
        });

        let yesButton = new MessageButton()
        .setStyle('SUCCESS')
        .setLabel('Yes 👍')
        .setDisabled(false)
        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}YES-BAN`);

        let noButton = new MessageButton()
        .setStyle('DANGER')
        .setLabel('No 👎')
        .setDisabled(false)
        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NO-BAN`);

        const filter = (button) => button.user.id === message.author.id && (
            button.customId === yesButton.customId ||
            button.customId === noButton.customId
        );

        let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

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
                client.functions.ban(user, message, message.author, data.guild, reason, memberData, client);
                message.delete().catch(() => {});
                return msg.delete().catch(() => {});
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

        let client = this.client;

        const filter = (button) => button.user.id === interaction.user.id;
        
        const user = interaction.options.getUser("user");

        if(user.id === interaction.user.id) return interaction.reply({
            content: interaction.drakeWS("misc:YOURSELF", {
                emoji: "error"
            }),
            ephemeral: true
        });

        let reason = interaction.options.getString("reason") ? interaction.options.getString("reason").replace("-f", "").trim() : null;
        if(!reason) reason = interaction.drakeWS("misc:NO_REASON");

        const member = interaction.guild.members.cache.get(user.id);

        if(member) {
            const memberPosition = member.roles.highest.position;
            const moderationPosition = interaction.guild.members.cache.get(interaction.user.id).roles.highest.position;
            if(moderationPosition < memberPosition) return interaction.reply({
                content: interaction.drakeWS("misc:SUPERIOR", {
                    emoji: "error"
                }),
                ephemeral: true
            });

            if(!member.kickable) return interaction.reply({
                content: interaction.drakeWS("moderation/ban:NOT_BANABLE", {
                    emoji: "error"
                }),
                ephemeral: true
            });
        };

        const memberData = member ? await client.db.findOrCreateMember(member, interaction.guild) : null;
        
        await interaction.reply({
            content: interaction.drakeWS("moderation/ban:CONFIRM", {
                emoji: "question",
                user: user.tag,
                reason: reason
            })
        });

        let yesButton = new MessageButton()
        .setStyle('SUCCESS')
        .setLabel('Yes 👍')
        .setDisabled(false)
        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}YES-BAN`);

        let noButton = new MessageButton()
        .setStyle('DANGER')
        .setLabel('No 👎')
        .setDisabled(false)
        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NO-BAN`);

        let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

        await interaction.editReply({
            components: [group1]
        }).catch(() => {});
        
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000, errors: ['time'] })
        
        collector.on("collect", async button => {
            if(!button) {
                await interaction.deleteReply();
            };
            if(button.customId === yesButton.customId) { 
                client.functions.ban(user, interaction, interaction.user, data.guild, reason, memberData, client);
                return await interaction.deleteReply();
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

module.exports = Ban;