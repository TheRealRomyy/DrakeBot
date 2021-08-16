const Command = require("../../structure/Commands.js");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require('discord.js');

class Sanctions extends Command {

    constructor(client) {
        super(client, {
            name: "sanctions",
            aliases: [ "modlogs" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: [ "MANAGE_MESSAGES" ],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Check sanction history of an user",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "Wich user ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {
        
        const client = this.client;

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "sanctions <user>"
        });

        const user = message.mentions.users.first() || (client.users.cache.get(args[0]) ? client.users.cache.get(args[0]) : await client.users.fetch(args[0])) || client.users.cache.find(u => u.username === args[0]);

        if(!user) return message.drake("misc:USER_NOT_FOUND", {
            emoji: "error"
        });

        const memberData = await this.client.db.findOrCreateMember(user, message.guild);
        
        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("moderation/sanctions:TITLE", {
            username: user.tag
        }))
        .setAuthor(message.author.username, message.author.displayAvatarURL({dyanmic:true}))
        .setColor(this.client.cfg.color.orange)
        .setFooter(this.client.cfg.footer);

        if(memberData.sanctions.length < 1) return message.drake("moderation/sanctions:NO_SANCTIONS", {
            username: "`" + user.username + "`",
            emoji: "error"
        });
        else memberData.sanctions.forEach((s) => {
            embed.addField(this.client.functions.pretify(s.type) + " | #"+s.case, `${message.drakeWS("common:MODERATOR")}: <@${s.moderator}>\n${message.drakeWS("common:REASON")}: ${s.reason}`, true);
        });
        
        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        const user = interaction.options.getUser("user");

        const memberData = await this.client.db.findOrCreateMember(user, interaction.guild);
        
        const embed = new MessageEmbed()
        .setTitle(interaction.drakeWS("moderation/sanctions:TITLE", {
            username: user.tag
        }))
        .setAuthor(user.username, user.displayAvatarURL({dyanmic:true}))
        .setColor(this.client.cfg.color.orange)
        .setFooter(this.client.cfg.footer);

        if(memberData.sanctions.length < 1) { 
            return interaction.reply({
                content: interaction.drakeWS("moderation/sanctions:NO_SANCTIONS", {
                    username: "`" + user.username + "`",
                    emoji: "error"
                }),
                ephemeral: true
            });
        } else memberData.sanctions.forEach((s) => {
            embed.addField(this.client.functions.pretify(s.type) + " | #" + s.case, `${interaction.drakeWS("common:MODERATOR")}: <@${s.moderator}>\n${interaction.drakeWS("common:REASON")}: ${s.reason}`, true);
        });
        
        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Sanctions;