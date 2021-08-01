const Command = require("../../structure/Commands");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Say extends Command {

    constructor(client) {
        super(client, {
            name: "say",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Make a webhook to say a text",
                options: [
                    {
                        name: "text",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "The tewt you want to say"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        let toSay = args.join(" ");
        let Formater = this.client.formater;

        toSay = new Formater(toSay).say();

        if(!toSay) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "say <content>"
        });

        const webhooks = await message.channel.fetchWebhooks();
        let webhook = null;

        if(webhooks.first() !== undefined) webhook = webhooks.first();
        else webhook = await message.channel.createWebhook('DrakeBot', {
            avatar: this.client.user.displayAvatarURL({ dynamic:true }),
        });

        await message.delete();

        await webhook.send({
            content: toSay,
            username: message.author.username,
            avatarURL: message.author.displayAvatarURL({ dynamic:true }),
        });
    };

    async runInteraction(interaction, data) {

        let toSay = interaction.options.getString("text");
        let Formater = this.client.formater;

        toSay = new Formater(toSay).say();

        const webhooks = await interaction.channel.fetchWebhooks();
        let webhook = null;

        if(webhooks.first() !== undefined) webhook = webhooks.first();
        else webhook = await interaction.channel.createWebhook('DrakeBot', {
            avatar: this.client.user.displayAvatarURL({ dynamic:true }),
        });

        await webhook.send({
            content: toSay,
            username: interaction.user.username,
            avatarURL: interaction.user.displayAvatarURL({ dynamic:true }),
        });

        await interaction.defer();
        await interaction.deleteReply();
    };
};

module.exports = Say;