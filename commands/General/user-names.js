const Command = require("../../structure/Commands");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Usernames extends Command {

    constructor(client) {
        super(client, {
            name: "user-names",
            aliases: [ "usernames", "un", "names" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Get all user's old name",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: false,
                        description: "Specify an user"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        const client = this.client;

        let user = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]) : message.author) || message.author;

        const userData = (message.author === user) ? data.user : await this.client.db.findOrCreateUser(user); 

        if(!userData.names) userData.names = [];
        let usernames = userData.names;
        let count = 0;

        if(usernames.length === 0) return message.drake("general/user-names:NO_NAMES", {
            emoji: "error",
            username: user.username
        });

        function cop() {
            count++;
            return count.toString();
        };

        let map = usernames.map((name) =>"**" + cop() + ")** `" + name.name + "` **>** " + this.client.functions.printDate(name.date)).join("\n ");

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setTitle(message.drakeWS("general/user-names:TITLE", {
            emoji: "label",
            username: user.username
        }))
        .setColor(this.client.cfg.color.purple)
        .setDescription(message.drakeWS("general/user-names:TOTAL_NAMES", { count }) + " \n \n" + map);
	
        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        let user = interaction.options.getUser("user") || interaction.user;

        const userData = (interaction.user === user) ? data.user : await this.client.db.findOrCreateUser(user); 

        if(!userData.names) userData.names = [];
        let usernames = userData.names;
        let count = 0;

        if(usernames.length === 0) return interaction.reply({
            content: interaction.drakeWS("general/user-names:NO_NAMES", {
                emoji: "error",
                username: user.username
            }),
            ephemeral: true
        });

        function cop() {
            count++;
            return count.toString();
        };

        let map = usernames.map((name) =>"**" + cop() + ")** `" + name.name + "` **>** " + this.client.functions.printDate(name.date)).join("\n ");

        const embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setTitle(interaction.drakeWS("general/user-names:TITLE", {
            emoji: "label",
            username: user.username
        }))
        .setColor(this.client.cfg.color.purple)
        .setDescription(interaction.drakeWS("general/user-names:TOTAL_NAMES", { count }) + " \n \n" + map);
	
        return interaction.reply({
            embeds: [embed]
        });
    };
}; 

module.exports = Usernames;