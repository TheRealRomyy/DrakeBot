const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class RemoverankLevel extends Command {

    constructor(client) {
        super(client, {
            name: "removerank-level",
            aliases: ["removeranks-level", "rr-level", "removeranks-xp", "remove-rank-xp"],
            dirname: __dirname,
            enabled: true,
            botPerms: ["EMBED_LINKS"],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Remove a role reward level",
                options: [
                    {
                        name: "level",
                        type: ApplicationCommandOptionTypes.INTEGER,
                        required: true,
                        description: "On wich level ?"
                    }
                ]
            }
        });  
    };

    async run(message, args, data) {

        if(!data.guild.plugins.levels.enabled) return message.drake("misc:LEVEL_DISABLED", {
            emoji: "errors"
        });

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "removerank-level <level>"
        });
    
        const level = args[0];
    
        if(!data.guild.plugins.levels.rankRewards.find((r) => r.level === level)) return message.drake("level/removerank-level:NO_RANK", {
            level: level,
            emoji: "error"
        });
    
        data.guild.plugins.levels.rankRewards = data.guild.plugins.levels.rankRewards.filter((r) => r.level !== level);
    
        await data.guild.save();
    
        message.drake("level/removerank-level:SUCCES", {
            emoji: "succes",
            level: level,
        });
    };

    async runInteraction(interaction, data) {

        if(!data.guild.plugins.levels.enabled) return interaction.reply({
            content: interaction.drakeWS("misc:LEVEL_DISABLED", {
                emoji: "errors"
            })
        });
    
        const level = interaction.options.getInteger("level");
    
        if(!data.guild.plugins.levels.rankRewards.find((r) => r.level === level)) return interaction.reply({
            content: interaction.drakeWS("level/removerank-level:NO_RANK", {
                level: level,
                emoji: "error"
            }),
            ephemeral: true
        });
    
        data.guild.plugins.levels.rankRewards = data.guild.plugins.levels.rankRewards.filter((r) => r.level !== level);
        await data.guild.save();
    
        interaction.reply({
            content: interaction.drakeWS("level/removerank-level:SUCCES", {
                emoji: "succes",
                level: level,
            })
        });
    };
};

module.exports = RemoverankLevel;