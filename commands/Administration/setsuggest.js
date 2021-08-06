const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Setsuggest extends Command {

    constructor(client) {
        super(client, {
            name: "setsuggest",
            aliases: [ "set-suggest" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_CHANNELS" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Define the channel where the suggestions go",
                options: [
                    {
                        name: "channel",
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        required: false,
                        description: "What's the new channel ? (default is disabled suggestion channel)"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(data.guild.plugins.suggestions != null) {

            data.guild.plugins.suggestions = null;
            await data.guild.save();

            return message.drake("administration/setsuggest:DISABLED", {
                emoji: "succes"
            });
        };

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "setsuggest <channel>"
        });

        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(ch => ch.name === args[0]);

        if(!channel) return message.drake("administration/setsuggest:CHANNEL_NOT_FOUND", {
            emoji: "error"
        });

        if(channel.type == "voice") return message.drake("administration/setsuggest:VOICE", {
            emoji: "error"
        });

        data.guild.plugins.suggestions = channel.id;
        await data.guild.save();

        return message.drake("administration/setsuggest:SUCCES", {
            emoji: "succes",
            channel: "<#" + channel.id + ">"
        });
    };

    async runInteraction(interaction, data) {

        if(!interaction.options.getChannel("channel")) {

            if(data.guild.plugins.suggestions != null) {
                data.guild.plugins.suggestions = null;
                await data.guild.save();

                return interaction.reply({
                    content: interaction.drakeWS("administration/setsuggest:DISABLED", {
                        emoji: "succes"
                    })
                });
            } else {
                return interaction.reply({
                    content: interaction.drakeWS("administration/setsuggest:ALREADY_DISABLED", {
                        emoji: "error"
                    }),
                    ephemeral: true
                });
            };
        } else {
            let channel = interaction.options.getChannel("channel");
    
            if(channel.type !== "GUILD_TEXT") return interaction.reply({
                content: interaction.drakeWS("administration/setsuggest:NOT_TEXT", {
                    emoji: "error"
                }),
                ephemeral: true
            });
    
            data.guild.plugins.suggestions = channel.id;
            await data.guild.save();
    
            return interaction.reply({
                content: interaction.drakeWS("administration/setsuggest:SUCCES", {
                    emoji: "succes",
                    channel: "<#" + channel.id + ">"
                })
            });
        };
    };
};

module.exports = Setsuggest;