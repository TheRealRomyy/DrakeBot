const Command = require("../../structure/Commands");

const math = require("mathjs");
const { Constants: { ApplicationCommandOptionTypes }, MessageEmbed } = require("discord.js");

class Calculate extends Command {

    constructor(client) {
        super(client, {
            name: "calc",
            aliases: [ "calculate" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Solve a simple calculation",
                options: [
                {
                    type: ApplicationCommandOptionTypes.STRING,
                    name: "calculation",
                    description: "Calculation to solve",
                    required: true,
                }
            ]
            }
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "calc <calcul>",
            emoji: "error"
        });
    
        let result;
        try {
            result = math.evaluate(args.join(" ").replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/"));
        } catch (e) {
            return message.drake("errors:NOT_CORRECT", {
                usage: data.guild.prefix + "calc <calcul>",
                emoji: "error"
            });
        };
    
        const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .addField(message.drakeWS("general/calculate:CALCUL", {
            emoji: "calcul"
        }), `\`\`\`\n${args.join("")}\`\`\``)
        .addField(message.drakeWS("general/calculate:RESULT", {
            emoji: "result"
        }), `\`\`\`\n${result}\`\`\``)
            
        message.channel.send({
            embeds: [embed]
        });    
    };

    async runInteraction(interaction, data) {
        let result;
        try {
            result = math.evaluate(interaction.options.getString("calculation").replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/"));
        } catch (e) {
            return interaction.reply({
                content: interaction.drakeWS("errors:NOT_CORRECT", {
                    usage: data.guild.prefix + "calc <calcul>",
                    emoji: "error"
                }),
                ephemeral: true
            });
        };
    
        const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .addField(interaction.drakeWS("general/calculate:CALCUL", {
            emoji: "calcul"
        }), `\`\`\`\n${interaction.options.getString("calculation")}\`\`\``)
        .addField(interaction.drakeWS("general/calculate:RESULT", {
            emoji: "result"
        }), `\`\`\`\n${result}\`\`\``)
            
        interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Calculate;