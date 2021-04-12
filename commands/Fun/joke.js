const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Joke extends Command {

    constructor(client) {
        super(client, {
            name: "joke",
            aliases: ["blague"],
            enabled: false,
            botPerms: [],
            userPerms: [],
            dirname: __dirname,
            restriction: []
        });
    };

    async run(message, args, data) {

        const joke = await this.client.joker.randomJoke(data.guild.language.substr(0, 2));
    
        const embed = new MessageEmbed()
        .setDescription(joke.toDiscordSpoils())
        .setColor(this.cfg.color.blue)
        .setFooter(this.client.cfg.footer + " | " + message.drakeWS("fun/joke:POWERED", {
            api: "blagues.xyz"
        }))
    
        return message.channel.send(embed);
    };

};

module.exports = Joke;