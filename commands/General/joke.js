const Command = require("../../structure/Commands.js");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");
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
            restriction: [],

            slashCommandOptions: {
                description: "Get a joke by type",
                options: [
                    {
                        name: "type",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: false,
                        description: "The type of joke",
                        choices: [
                            {
                                name: "Developer Jokes 💻",
                                value: "dev"
                            },
                            {
                                name: "Global Jokes 🌍",
                                value: "global"
                            },
                            {
                                name: "Dark Jokes 👤",
                                value: "dark"
                            },
                            {
                                name: "Limit Jokes 🔞",
                                value: "limit"
                            },
                            {
                                name: "Beauf Jokes 🍺",
                                value: "beauf"
                            },
                            {
                                name: "Blondes Jokes 👱‍♀️",
                                value: "blondes"
                            }
                        ]
                    }
                ]
            }
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
    
        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        const args = [interaction.options.getString("type")];

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
        .setFooter(interaction.drakeWS("fun/joke:POWERED", {
            api: "Blagues API"
        }) + `・(${interaction.drakeWS("fun/joke:" + type.toUpperCase())})`)
    
        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Joke;