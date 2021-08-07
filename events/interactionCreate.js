const { MessageEmbed } = require("discord.js");
const Time = require("../helpers/timeManager.js");
const cmdCooldown = {};

class InteractionCreate {

    constructor (client) {
        this.client = client;
    };

    async run (interaction) {

        const client = this.client;
        
        if (interaction.isCommand()) {
        
            if (!interaction.guildId) return;

            const data = {
                user: await this.client.db.findOrCreateUser(interaction.user),
                member: await this.client.db.findOrCreateMember(interaction.user, interaction.guild),
                guild: await this.client.db.findOrCreateGuild(interaction.guild),
    
                client: await this.client.db.findOrCreateClient(),
                cfg: this.client.cfg,
            };

            interaction.guild.data = data.guild;
            interaction.__proto__.time = new Time(interaction);

            // Gets the command
            const cmd = this.client.cmds.get(interaction.commandName);

            if (!cmd) return console.error(`Command ${interactioninteraction.commandName} not found!`);

            const guild = this.client.guilds.cache.get(interaction.guildId);
            const member = interaction.member || await guild.members.fetch(interaction.user.id);

            if(data.client.blacklist.users.includes(interaction.user.id)) return interaction.reply({
                content: interaction.drakeWS("errors:USER_BLACKLIST", {
                    emoji: "error"
                }),
                ephemeral: true
            });

            // Check si la guild est blacklist
            if(data.client.blacklist.guilds.includes(interaction.guild.id)) return interaction.reply({
                content: interaction.drakeWS("errors:GUILD_BLACKLIST", {
                    emoji: "error"
                }),
                ephemeral: true
            });

            // Check si la commande est activée
            if(cmd.settings.enabled === false) return interaction.reply({
                content: interaction.drakeWS("errors:DISABLED", {
                    emoji: "error"
                }),
                ephemeral: true
            });

            // Check si le bot est en maintenance
            if(!client.cfg.enabled && !client.cfg.staff.owner.includes(interaction.user.id)) return interaction.reply({
                content: client.emotes["error"] + " **Le bot est actuellement en maintenance !**",
                ephemeral: true
            });

            // Check les "bot Perms"
            if(cmd.settings.botPerms) {
                let neededPerms = [];

                if(!cmd.settings.botPerms.includes("EMBED_LINKS") && !interaction.channel.permissionsFor(interaction.guild.me).has("EMBED_LINKS")) neededPerms.push(interaction.drakeWS("discord_errors:EMBED_LINKS"));

                await cmd.settings.botPerms.forEach((perm) => {
                    if(!interaction.channel.permissionsFor(interaction.guild.me).has(perm)) neededPerms.push(interaction.drakeWS(`discord_errors:${perm.toUpperCase()}`));
                });

                if(neededPerms.length > 1) {
                    return interaction.reply({
                        content: interaction.drakeWS("errors:BOT_PERMISSIONS", {
                            perms: neededPerms.map((p) => `\`${p}\``).join(", "),
                            emoji: "error"
                        }),
                        ephemeral: true
                    });
                } else if(neededPerms.length == 1){
                    return interaction.reply({
                        content: interaction.drakeWS("errors:BOT_PERMISSION", {
                            perms: "```" + neededPerms[0] + "```",
                            emoji: "error"
                        }),
                        ephemeral: true
                    });
                };
            };

            // Check les "user Perms"
            if(cmd.settings.userPerms) {
                let neededPerms = [];

                await cmd.settings.userPerms.forEach((perm) => {
                    if(!interaction.channel.permissionsFor(interaction.member).has(perm) && !client.cfg.staff.owner.includes(interaction.user.id)) neededPerms.push(interaction.drakeWS(`discord_errors:${perm.toUpperCase()}`));
                });

                if(neededPerms.length > 1) {
                    return interaction.reply({
                        content: interaction.drakeWS("errors:PERMISSIONS", {
                            perms: neededPerms.map((p) => `\`${p}\``).join(", "),
                            emoji: "error"
                        }),
                        ephemeral: true
                    });
                } else if(neededPerms.length == 1){
                    return interaction.reply({
                        content: interaction.drakeWS("errors:PERMISSION", {
                            perms: "```" + neededPerms[0] + "```",
                            emoji: "error"
                        }),
                        ephemeral: true
                    });
                };
            };

            // Check les "restrictions"
            if(cmd.settings.restriction) {

                const rest = cmd.settings.restriction;

                if(rest.includes("OWNER") && !client.cfg.staff.owner.includes(interaction.user.id)) return interaction.reply({
                    content: interaction.drakeWS("errors:PERMISSION", {
                        emoji: "error",
                        perm: "`" + interaction.drakeWS("discord_errors:BOT_OWNER") + "`"
                    }),
                    ephemeral: true
                });

                if(rest.includes("MODERATOR") && (!client.cfg.staff.support.includes(interaction.user.id) && !client.cfg.staff.owner.includes(interaction.user.id))) return interaction.reply({
                    content: interaction.drakeWS("errors:PERMISSION", {
                        emoji: "error",
                        perm: "`" + interaction.drakeWS("discord_errors:BOT_MODERATOR") + "`"
                    }),
                    ephemeral: true
                });

                if(rest.includes("NFSW") && !interaction.channel.nfsw) return interaction.reply({
                    content: interaction.drakeWS("errors:NFSW", {
                        emoji: "error"
                    }),
                    ephemeral: true
                });
            };

            // Check le cooldown
            let uCooldown = cmdCooldown[interaction.user.id];
            if(!uCooldown){
                cmdCooldown[interaction.user.id] = {};
                uCooldown = cmdCooldown[interaction.user.id];
            };
            const time = uCooldown[cmd.help.name] || 0;
            if(time && (time > Date.now())){
                return interaction.reply({
                    content: interaction.drakeWS("errors:COOLDOWN", {
                        timeH: Math.ceil((time-Date.now())/1000) + "s",
                        emoji: "time"
                    }),
                    ephemeral: true
                });
            };

            try{

                // Cooldown
                if(!client.cfg.staff.owner.includes(interaction.user.id)) cmdCooldown[interaction.user.id][cmd.help.name] = Date.now() + (cmd.settings.cooldown ? (cmd.settings.cooldown * 1000) : 3000);

                // Enregistrer dans le nombre de commandes
                data.client.count++;
                client.commandsRun++;
                
                await data.client.save();
                
                // Run
                cmd.runInteraction(interaction, data)

                // Log
                client.logger.command(interaction.guild.name, interaction.user.username, `/${interaction.commandName}`, "slash");

                if(client.cfg.staff.support.includes(interaction.user.id) || client.cfg.staff.owner.includes(interaction.user.id)) {
                    const staffEmbed = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic:true}))
                    .setTimestamp()
                    .setFooter(interaction.user.id)
                    .setDescription(`**[SLASH CMD - ${client.cfg.staff.support.includes(interaction.user.id) ? "STAFF" : "OWNER"}]** Guild: \`${interaction.guild.name}\` (||${interaction.guild.id}||) => \`\`\`/${interaction.commandName}\`\`\``)
                    .setColor("RANDOM");

                    client.channels.cache.get("793587196887040030").send({
                        embeds: [staffEmbed]
                    });
                } else {
                    const embed = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic:true}))
                    .setDescription(`**[SLASH CMD]** Guild: \`${interaction.guild.name}\` (||${interaction.guild.id}||) => \`\`\`/${interaction.commandName}\`\`\``)
                    .setTimestamp()
                    .setFooter(interaction.user.id)
                    .setColor("RANDOM");
                    client.channels.cache.get('768125802423255051').send({
                        embeds: [embed]
                    });
                };
            } catch(err) {
                client.emit("error", err);
            };
        };

    };

};

module.exports = InteractionCreate;