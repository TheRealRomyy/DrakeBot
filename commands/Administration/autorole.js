const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Autorole extends Command {

    constructor(client) {
        super(client, {
            name: "autorole",
            aliases: [ "ar" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "ADMINISTRATOR" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Manage autorole (role that member receive on join)",
                options: [
                    {
                        name: "role",
                        type: ApplicationCommandOptionTypes.ROLE,
                        required: false,
                        description: "What's the role ? (default is disabled)"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!data.guild.plugins.autorole) data.guild.plugins.autorole = {
            enabled: false,
            role: null,
        };

        if(data.guild.plugins.autorole.enabled) {
            
            data.guild.plugins.autorole = {
                enabled: false,
                role: null
            };
			await data.guild.save();
	
			return message.drake("administration/autorole:DISABLED", {
                emoji: "succes"
            });
	
		} else {
            
            if(!args[0]) return message.drake("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "autorole <role>"
            });

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(x => x.name === args[0]);

            if(!role) return message.drake("administration/autorole:ROLE_NOT_FOUND", {
                emoji: "error",
                role: args[0]
            });

            data.guild.plugins.autorole = {
                enabled: true,
                role: role.id
            };
            
			await data.guild.save();
            
            return message.channel.send({
                content: message.drakeWS("administration/autorole:ENABLED", {
                    emoji: "succes",
                    role: role.id
                }),
                allowedMentions: { "users" : []}
            });
        };
    };

    async runInteraction(interaction, data) {

        if(!data.guild.plugins.autorole) data.guild.plugins.autorole = {
            enabled: false,
            role: null,
        };

        if(!interaction.options.getRole("role")) {

            if(data.guild.plugins.autorole.enabled) {
                data.guild.plugins.autorole = {
                    enabled: false,
                    role: null
                };
    
                await data.guild.save();
        
                return interaction.reply({
                    content: interaction.drakeWS("administration/autorole:DISABLED", {
                        emoji: "succes"
                    })
                });
            } else {
                return interaction.reply({
                    content: interaction.drakeWS("administration/autorole:ALREADY_DISABLED", {
                        emoji: "error"
                    }),
                    ephemeral: true
                });
            }
	
		} else {

            const role = interaction.options.getRole("role");

            data.guild.plugins.autorole = {
                enabled: true,
                role: role.id
            };
            
			await data.guild.save();
            
            return interaction.reply({
                content: interaction.drakeWS("administration/autorole:ENABLED", {
                    emoji: "succes",
                    role: role.id
                }),
                allowedMentions: { "users" : []}
            });
        };
    };
};

module.exports = Autorole;