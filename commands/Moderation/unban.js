const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Unban extends Command {

    constructor(client) {
        super(client, {
            name: "unban",
            aliases: ["pardon"],
            enabled: false,
            dirname: __dirname,
            botPerms: ["BAN_MEMBERS"],
            userPerms: ["BAN_MEMBERS"],
            restriction: [],

            slashCommandOptions: {
                description: "Unban an user",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "Wich user ?"
                    },
                    {
                        name: "reason",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: false,
                        description: "For which reason ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        let stop = false;

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "unban <user> (reason) (--message)",
            emoji: "error"
        });

        let user = message.mentions.users.first() || this.client.users.cache.get(args[0]);
        if(!user) return message.drake("moderation/unban:NOT_BAN", {
            user: user ? user.username : message.drakeWS("common:THIS_PEOPLE"),
            emoji: "error"
        });

        let reason = args.slice(1).join(" ").replace("--message", "");
        if(!reason || reason.trim() == "--message") reason = message.drakeWS("misc:NO_REASON");

        let sendMessage = message.content.includes("--message");
        let logReason = `${message.author.username} | ${reason}`;

        await message.guild.bans.fetch()
        .then(bans => {
            if(bans.size == 0) {
                stop = true;
                return message.drake("moderation/unban:NOT_BAN", {
                    user: user.username,
                    emoji: "error"
                });
            };
            let banUser = bans.find(b => b.user.id == user.id);
            if(!banUser) {
                stop = true;
                return message.drake("moderation/unban:NOT_BAN", {
                    user: user.username,
                    emoji: "error"
                });
            };
            message.guild.members.unban(banUser.user, logReason);
        });

        if(stop) return; // Très dégeulasse mais flemme

        if(sendMessage) user.send({
            content: message.drakeWS("moderation/unban:UNBAN_DM", {
                    reason, 
                    moderator: message.author.username,
                    user: user.username,
                    server: message.guild.name,
                    emoji: "unban"
                })
            }).catch(() => message.drake("moderation/unban:CANT_DM", {
                emoji: "error",
                user: user.username
        }));

        if(data.guild.plugins.logs.mod) {
            if(!this.client.channels.cache.get(data.guild.plugins.logs.mod)) {
                data.guild.plugins.logs.mod = false;
                await data.guild.save()
            };

            this.client.functions.sendModLog("unban", user, this.client.channels.cache.get(data.guild.plugins.logs.mod), message.author, data.guild.cases, reason);
        };
        
        return  this.client.functions.sendSanctionMessage(message, "unban", user, reason);
    };

    async runInteraction(interaction, data) {

        let stop = false;

        let user = interaction.options.getUser("user")

        let reason = interaction.options.getString("reason").replace("--message", "");
        if(!reason || reason.trim() == "--message") reason = interaction.drakeWS("misc:NO_REASON");

        let sendMessage = interaction.content.includes("--message");
        let logReason = `${interaction.user.username} | ${reason}`;

        await interaction.guild.bans.fetch()
        .then(bans => {
            if(bans.size == 0) {
                stop = true;
                return interaction.reply({
                    content: interaction.drakeWS("moderation/unban:NOT_BAN", {
                        user: user.username,
                        emoji: "error"
                    }),
                    ephemeral: true
                });
            };
            let banUser = bans.find(b => b.user.id == user.id);
            if(!banUser) {
                stop = true;
                return interaction.reply({
                    content: interaction.drakeWS("moderation/unban:NOT_BAN", {
                        user: user.username,
                        emoji: "error"
                    }),
                    ephemeral: true
                });
            };

            interaction.guild.members.unban(banUser.user, logReason);
        });

        if(stop) return; // Très dégeulasse mais flemme

        if(sendMessage) user.send({
            content: interaction.drakeWS("moderation/unban:UNBAN_DM", {
                    reason, 
                    moderator: interaction.user.username,
                    user: user.username,
                    server: interaction.guild.name,
                    emoji: "unban"
                })
            }).catch(() => interaction.reply({
                content: interaction.drakeWS("moderation/unban:CANT_DM", {
                    emoji: "error",
                    user: user.username
                }),
                ephemeral: true
        }));

        if(data.guild.plugins.logs.mod) {
            if(!this.client.channels.cache.get(data.guild.plugins.logs.mod)) {
                data.guild.plugins.logs.mod = false;
                await data.guild.save()
            };

            this.client.functions.sendModLog("unban", user, this.client.channels.cache.get(data.guild.plugins.logs.mod), interaction.user, data.guild.cases, reason);
        };
        
        return  this.client.functions.sendSanctionMessage(interaction, "unban", user, reason);
    };
};

module.exports = Unban;