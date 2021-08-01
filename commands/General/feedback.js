const Command = require("../../structure/Commands");
const { MessageEmbed, WebhookClient, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Feedback extends Command {

    constructor(client) {
        super(client, {
            name: "feedback",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Make a feedback about the bot",
                options: [
                    {
                        name: "feedback",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "Whats your reviews about DrakeBot ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "feedback <comments>"
        })
    
        const embed = new MessageEmbed()
        .setTitle("<:feedback:766792063013617705> **FeedBack**")
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.yellow)
        .setDescription(args.join(" "))
        .setTimestamp()
    
        this.client.channels.cache.get('766782480882860064').send({
            embeds: [embed]
        });
    
        return message.drake("general/feedback:SUCCES", {
            emoji: "succes"
        });
    };

    async runInteraction(interaction, data) {
    
        const embed = new MessageEmbed()
        .setTitle("<:feedback:766792063013617705> **FeedBack**")
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.yellow)
        .setDescription(interaction.options.getString("feedback"))
        .setTimestamp()
    
        this.client.channels.cache.get('766782480882860064').send({
            embeds: [embed]
        });
    
        interaction.reply({
            content: interaction.drakeWS("general/feedback:SUCCES", {
                emoji: "succes"
            })
        });
    };
};

module.exports = Feedback;