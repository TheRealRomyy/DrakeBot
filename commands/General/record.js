const Command = require("../../structure/Commands.js");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Record extends Command {

    constructor(client) {
        super(client, {
            name: "record",
            aliases: [],
            enabled: true,
            botPerms: [],
            dirname: __dirname,
            userPerms: [],
            restriction: [],

            slashCommandOptions: {
                description: "See your personal record",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: false,
                        description: "The user you want to check (default is you)"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        let user = message.mentions.users.first() || this.client.users.cache.get(args[0]) || message.author;
        let userData = user.id !== message.author.id ? await this.client.db.findOrCreateUser(user) : data.user;

        if(!Array.isArray(userData.record)) {
            userData.record = [];
            await data.user.save();
        };

        if(userData.record.length === 0) return message.drake("general/record:NO_RECORD", {
            emoji: "error"
        });

        const embed = new MessageEmbed()
        .setAuthor(user.username, user.displayAvatarURL({ dynamic:true }))
        .setDescription(userData.record.map(record => `${this.client.emotes[record.type]} • ${this.client.functions.pretify(record.type)} \nTemps: \`${message.time.convertMS(record.time)}\``))
        .setFooter(this.client.cfg.footer)
        .setColor("BLUE");

        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        let user = interaction.options.getUser("user") || interaction.user;
        let userData = user.id !== interaction.user.id ? await this.client.db.findOrCreateUser(user) : data.user;

        if(!Array.isArray(userData.record)) {
            userData.record = [];
            await data.user.save();
        };

        if(userData.record.length === 0) return interaction.reply({
            content: interaction.drakeWS("general/record:NO_RECORD", {
                emoji: "error"
            }),
            ephemeral: true
        });

        const embed = new MessageEmbed()
        .setAuthor(user.username, user.displayAvatarURL({ dynamic:true }))
        .setDescription(userData.record.map(record => `${this.client.emotes[record.type]} • ${this.client.functions.pretify(record.type)} \nTemps: \`${interaction.time.convertMS(record.time)}\``))
        .setFooter(this.client.cfg.footer)
        .setColor("BLUE");

        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Record;