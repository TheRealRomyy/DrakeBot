const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');

class Joke extends Command {

    constructor(client) {
        super(client, {
            name: "joke",
            aliases: ["blague"],
            enabled: true,
            botPerms: [],
            userPerms: [],
            dirname: __dirname,
            restriction: []
        });
    };

    async run(message, args, data) {

        let joke = null;
        let answer = null;
        let type = null;
        let url = null;

        if((args[0] && (args[0] !== "dev" && args[0] !== "global" && args[0] !== "dark" && args[0] !== "limit" && args[0] !== "beauf" && args[0] !== "blondes")) || !args[0]) url = "https://www.blagues-api.fr/api/random";
        else url = `https://www.blagues-api.fr/api/type/${args[0]}/random`;

        await fetch(url, {
            headers: { 'Authorization': `Bearer ${this.client.cfg.api.joke}` } 
        })
        .then(response => response.json())
        .then(data => {
            joke = data.joke;
            answer = data.answer;
            type = data.type;
        });
    
        const embed = new MessageEmbed()
        .setDescription("||" + answer + "||")
        .setTitle(joke)
        .setColor(this.client.cfg.color.blue)
        .setFooter(message.drakeWS("fun/joke:POWERED", {
            api: "Blagues API"
        }) + `・(${message.drakeWS("fun/joke:" + type.toUpperCase())})`)
    
        return message.channel.send(embed);
    };
};

module.exports = Joke;