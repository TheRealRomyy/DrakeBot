const Command = require("../../structure/Commands.js");
const { MessageActionRow, MessageButton, Constants: { ApplicationCommandOptionTypes } } = require('discord.js');

class Warn extends Command {

    constructor(client) {
        super(client, {
            name: "warn",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: [ "MANAGE_MESSAGES"],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Warn a member",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "Who will be warned ?"
                    },
                    {
                        name: "reason",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "What did he did ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        let client = this.client;

        if(!args[0] && !message.mentions.users.first()) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "warn <user> (reason)",
            emoji: "error"
        });
        
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if(!member) return message.drake("misc:MEMBER_NOT_FOUND", {
            emoji: "error"
        });

        if(member.id === message.author.id) return message.drake("misc:YOURSELF", {
            emoji: "error"
        });

        if(member.user.bot) return message.drake("moderation/warn:WARN_BOT", {
            emoji: "error"
        });

        const memberPosition = member.roles.highest.position;
        const moderationPosition = message.member.roles.highest.position;
        if(moderationPosition < memberPosition) return message.drake("misc:SUPERIOR", {
            emoji: "error"
        });

        const memberData = await client.db.findOrCreateMember(member, message.guild);

        let reason = args.slice(message.mentions.users.first() ? (args[0].includes(user.id) ? 1 : 0) : 1).join(" ").trim();
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        let msg = await message.channel.send({
            content: message.drakeWS("moderation/warn:CONFIRM", {
                emoji: "question",
                user: member.user.tag,
                reason: reason
            })
        });

        let yesButton = new MessageButton()
        .setStyle('SUCCESS')
        .setLabel('Yes 👍')
        .setDisabled(false)
        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}YES-WARN`);

        let noButton = new MessageButton()
        .setStyle('DANGER')
        .setLabel('No 👎')
        .setDisabled(false)
        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NO-WARN`);

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
                client.functions.warn(member, message, message.author, data.guild, reason, memberData, client);
                client.functions.checkAutoSanctions(data.guild, member, memberData, message, client);
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
        
        const member = interaction.options.getUser("user") ? interaction.guild.members.cache.get(interaction.options.getUser("user").id) : null;

        if(!member) return interaction.reply({
            content: interaction.drakeWS("misc:MEMBER_NOT_FOUND", {
                emoji: "error"
            }),
            ephemeral: true
        });

        if(member.id === interaction.user.id) return interaction.reply({
            content: interaction.drakeWS("misc:YOURSELF", {
                emoji: "error"
            }),
            ephemeral: true
        });

        if(member.user.bot) return interaction.reply({
            content: interaction.drakeWS("moderation/warn:WARN_BOT", {
                emoji: "error"
            }),
            ephemeral: true
        });

        const memberPosition = member.roles.highest.position;
        const moderationPosition = interaction.guild.members.cache.get(interaction.user.id).roles.highest.position;
        if(moderationPosition < memberPosition) return interaction.reply({
            content: interaction.drakeWS("misc:SUPERIOR", {
                emoji: "error"
            }),
            ephemeral: true
        });

        const memberData = await client.db.findOrCreateMember(member, interaction.guild);

        let reason = interaction.options.getString("reason") ? interaction.options.getString("reason").replace("-f", "").trim() : null;
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        await interaction.reply({
            content: interaction.drakeWS("moderation/warn:CONFIRM", {
                emoji: "question",
                user: member.user.tag,
                reason: reason
            })
        });

        let yesButton = new MessageButton()
        .setStyle('SUCCESS')
        .setLabel('Yes 👍')
        .setDisabled(false)
        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}YES-WARN`);

        let noButton = new MessageButton()
        .setStyle('DANGER')
        .setLabel('No 👎')
        .setDisabled(false)
        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NO-WARN`);

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
                client.functions.warn(member, interaction, interaction.user, data.guild, reason, memberData, client);
                client.functions.checkAutoSanctions(data.guild, member, memberData, interaction, client);
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

module.exports = Warn;