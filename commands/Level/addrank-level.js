const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class AddrankLevel extends Command {

    constructor(client) {
        super(client, {
            name: "addrank-level",
            aliases: [ "addranklevel", "addrank-lvl", "add-lvl"],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_ROLES" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Add a role that will be given when users reach a specific level",
                options: [
                    {
                        name: "level",
                        type: ApplicationCommandOptionTypes.INTEGER,
                        required: true,
                        description: "At what level will the role be given ?"
                    },

                    {
                        name: "rank",
                        type: ApplicationCommandOptionTypes.ROLE,
                        required: true,
                        description: "What rank will be given ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!data.guild.plugins.levels.enabled) return message.drake("misc:LEVEL_DISABLED", {
            emoji: "errors"
        });

        if(!args[0] || !args[1] || isNaN(args[0])) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "addrank-level <level> <rank>"
        });
    
        const level = args[0];
        const rank = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(x => x.name === args[1]);

        if(!rank) return message.drake("level/addrank-level:ROLE_NOT_FOUND", {
            emoji: "error",
        });

        if(message.guild.members.cache.get(this.client.user.id).roles.highest.position <= rank.position) return message.drake("level/addrank-level:TOO_LOW", {
            emoji: "error"
        }); 
    
        data.guild.plugins.levels.rankRewards.push({
            level: level,
            rank: rank.id
        });
    
        await data.guild.save();
    
        message.drake("level/addrank-level:SUCCES", {
            emoji: "succes",
            rank: rank,
            level: level.toString(),
        });
    };

    async runInteraction(interaction, data) {

        if(!data.guild.plugins.levels.enabled) return interaction.reply({
            content: interaction.drakeWS("misc:LEVEL_DISABLED", {
                emoji: "errors"
            })
        });
    
        const level = interaction.options.getInteger("level");
        const rank = interaction.options.getRole("rank");

        if(interaction.guild.members.cache.get(this.client.user.id).roles.highest.position <= rank.position) return interaction.reply({
            content: interaction.drakeWS("level/addrank-level:TOO_LOW", {
                emoji: "error"
            }),
            ephemeral: true
        }); 
    
        data.guild.plugins.levels.rankRewards.push({
            level: level,
            rank: rank.id
        });
    
        await data.guild.save();
    
        interaction.reply({
            content: interaction.drakeWS("level/addrank-level:SUCCES", {
                emoji: "succes",
                rank: rank,
                level: level.toString(),
            })
        });
    };
};

module.exports = AddrankLevel;