const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Record extends Command {

    constructor(client) {
        super(client, {
            name: "record",
            aliases: [],
            enabled: true,
            botPerms: [],
            dirname: __dirname,
            userPerms: [],
            restriction: []
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

        return message.channel.send(embed);
    };
};

module.exports = Record;