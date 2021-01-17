const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Usernames extends Command {

    constructor(client) {
        super(client, {
            name: "user-names",
            aliases: [ "usernames", "un" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let user = message.mentions.users.first() || this.client.users.cache.get(args[0]) || message.author;

        const userData = (message.author === user) ? data.user : await this.client.findOrCreateUser({ id: user.id }); 

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

        let map = usernames.map((name) =>"**" + cop() + ")** " + name.name + " **>** " + this.client.functions.printDate(name.date)).join("\n ");

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setTitle(message.drakeWS("general/user-names:TITLE", {
            emoji: "label",
            username: user.username
        }))
        .setColor(this.client.cfg.color.purple)
        .setDescription(message.drakeWS("general/user-names:TOTAL_NAMES", { count }) + " \n \n" + map);
	
        return message.channel.send(embed);
    };
}; 

module.exports = Usernames;