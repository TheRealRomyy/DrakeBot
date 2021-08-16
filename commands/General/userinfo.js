const Command = require("../../structure/Commands");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Userinfo extends Command {

    constructor(client) {
        super(client, {
            name: "userinfo",
            aliases: [ "ui", "whois", "user" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Get some info about an user",
                options: [
                    {
                        name: "user",
                        type: ApplicationCommandOptionTypes.USER,
                        required: false,
                        description: "The user you want to see (default is you)",
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        let client = this.client;

        const user = message.mentions.users.first() || (client.users.cache.get(args[0]) ? client.users.cache.get(args[0]) : await client.users.fetch(args[0])) || message.author;
        const member = await message.guild.members.fetch(user).catch(() => {});

        let badges = [];
        const animatedAvatar = user.avatarURL({ dynamic: true })
        let presence = null;
        
        // J'ai enlevé les descriptions parce que useless
        // let desc = userData.desc ? (userData.desc !== null ? userData.desc : message.drakeWS("general/userinfo:NO_DESC")) : message.drakeWS("general/userinfo:NO_DESC"); 
        // if(user.id === message.author.id) desc = desc === message.drakeWS("general/userinfo:NO_DESC") ? message.drakeWS("general/userinfo:NO_DESC_AUTHOR", { prefix: data.guild.prefix }) : desc;

        if(!user.bot) for (const [badge, value] of Object.entries(user.flags.serialize())) {
            if(value && client.emotes.badges[badge]) badges.push(client.emotes.badges[badge]);
        };

        if(animatedAvatar !== user.avatarURL()) badges.push(client.emotes.badges["NITRO"]);

        if(member) presence = member.presence;

        const st = presence ? presence.status : null;

        let clientStatus = presence ? presence.clientStatus : null;
        let plateformes = [];

        if(st && st !== "offline" && !user.bot) {
            if (clientStatus && clientStatus.mobile) plateformes.push("`📱`")
            if (clientStatus && clientStatus.desktop) plateformes.push("`💻`");
            if (clientStatus && clientStatus.web) plateformes.push("`🌐`");
        };

        if(plateformes.length === 0 && user.bot) plateformes.push("`🤖`")

        /* Show custom status : 
        user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS") != "" 
        ? "\n" + (user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].emoji !== null 
        ? user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].emoji.name + " " 
        : "") + user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].state 
        : "")*/

        const embed = new MessageEmbed()
        .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setDescription(`${message.drakeWS("common:BADGES")} ${badges.length === 0 ? "`" + message.drakeWS("common:ANY_BADGES") + "`" : (badges.length === 1 ? badges[0] : badges.join(", "))} \n${plateformes.length !== 0 ? message.drakeWS("common:SYSTEM") : ""} ${plateformes.length !== 0 ? (plateformes.length === 1 ? plateformes[0] : plateformes.join(" + ")) : ""}`)
        .setColor("RANDOM")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addField(message.drakeWS("general/userinfo:NAME", {
            emoji: "label"
        }), user.username + " (#" + user.discriminator + ")", true)
        .addField(message.drakeWS("general/userinfo:ID", {
            emoji: "id"
        }), "||" + user.id + "||", true)
        .addField(message.drakeWS("general/userinfo:CREATE", {
            emoji: "calendar"
        }), `${this.client.functions.printDateFrom(user.createdAt)}`, true)
        .addField(message.drakeWS("general/userinfo:BOT", {
            emoji: "bot"
        }), user.bot ? message.drakeWS("common:YES") : message.drakeWS("common:NO"), true)
        
        if(member) {
            embed.addField(message.drakeWS("general/userinfo:JOIN", {
                emoji: "calendar2"
            }), `${this.client.functions.printDateFrom(member.joinedAt)}`, true)
            .addField(this.client.emotes.status[(st ? st : "offline")] + message.drakeWS("general/userinfo:STATUT"), message.drakeWS("general/userinfo:STATUS_" + (st ? st.toUpperCase() : "OFFLINE")), true)
            // .addField(message.drakeWS("general/userinfo:GAME", {
            //     emoji: "play"
            // }), (user.presence.activity ? user.presence.activity.name : message.drakeWS("general/userinfo:NO_GAME")), true)
            .addField(message.drakeWS("general/userinfo:HR", {
                emoji: "up"
            }), `${member.roles.highest}`, true)
            .addField(message.drakeWS("general/userinfo:ROLES", {
                emoji: "roleList",
                roleList: member.roles.cache.filter(role => role.id !== message.guild.roles.everyone.id).size
            }), `${member.roles.cache.filter(role => role.id !== message.guild.roles.everyone.id).size !== 0 ? (member.roles.cache.size > 10 ? member.roles.cache.filter(role => role.id !== message.guild.roles.everyone.id).map((r) => r).slice(0, 9).join(", ")+" " + message.drakeWS("general/userinfo:MR") : member.roles.cache.filter(role => role.id !== message.guild.roles.everyone.id).map((r) => r).join(", ")) : message.drakeWS("common:ANY_ROLES")}`, false)
        };

        return message.channel.send({
            embeds: [embed]
        });
    };
    
    async runInteraction(interaction, data) {

        let client = this.client;

        const user = interaction.options.getUser("user") || interaction.user;
        const member = await interaction.guild.members.cache.get(user.id);

        let badges = [];
        const animatedAvatar = user.avatarURL({ dynamic: true })
        let presence = null;
        
        // J'ai enlevé les descriptions parce que useless
        // let desc = userData.desc ? (userData.desc !== null ? userData.desc : message.drakeWS("general/userinfo:NO_DESC")) : message.drakeWS("general/userinfo:NO_DESC"); 
        // if(user.id === message.author.id) desc = desc === message.drakeWS("general/userinfo:NO_DESC") ? message.drakeWS("general/userinfo:NO_DESC_AUTHOR", { prefix: data.guild.prefix }) : desc;

        if(!user.bot) for (const [badge, value] of Object.entries(user.flags.serialize())) {
            if(value && client.emotes.badges[badge]) badges.push(client.emotes.badges[badge]);
        };

        if(animatedAvatar !== user.avatarURL()) badges.push(client.emotes.badges["NITRO"]);

        if(member) presence = member.presence;

        const st = presence ? presence.status : null;

        let clientStatus = presence ? presence.clientStatus : null;
        let plateformes = [];

        if(st && st !== "offline" && !user.bot) {
            if (clientStatus && clientStatus.mobile) plateformes.push("`📱`")
            if (clientStatus && clientStatus.desktop) plateformes.push("`💻`");
            if (clientStatus && clientStatus.web) plateformes.push("`🌐`");
        };

        if(plateformes.length === 0 && user.bot) plateformes.push("`🤖`")

        /* Show custom status : 
        user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS") != "" 
        ? "\n" + (user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].emoji !== null 
        ? user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].emoji.name + " " 
        : "") + user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].state 
        : "")*/

        const embed = new MessageEmbed()
        .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setDescription(`${interaction.drakeWS("common:BADGES")} ${badges.length === 0 ? "`" + interaction.drakeWS("common:ANY_BADGES") + "`" : (badges.length === 1 ? badges[0] : badges.join(", "))} \n${plateformes.length !== 0 ? interaction.drakeWS("common:SYSTEM") : ""} ${plateformes.length !== 0 ? (plateformes.length === 1 ? plateformes[0] : plateformes.join(" + ")) : ""}`)
        .setColor("RANDOM")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addField(interaction.drakeWS("general/userinfo:NAME", {
            emoji: "label"
        }), user.username + " (#" + user.discriminator + ")", true)
        .addField(interaction.drakeWS("general/userinfo:ID", {
            emoji: "id"
        }), "||" + user.id + "||", true)
        .addField(interaction.drakeWS("general/userinfo:CREATE", {
            emoji: "calendar"
        }), `${this.client.functions.printDateFrom(user.createdAt)}`, true)
        .addField(interaction.drakeWS("general/userinfo:BOT", {
            emoji: "bot"
        }), user.bot ? interaction.drakeWS("common:YES") : interaction.drakeWS("common:NO"), true)
        
        if(member) {
            embed.addField(interaction.drakeWS("general/userinfo:JOIN", {
                emoji: "calendar2"
            }), `${this.client.functions.printDateFrom(member.joinedAt)}`, true)
            .addField(this.client.emotes.status[(st ? st : "offline")] + interaction.drakeWS("general/userinfo:STATUT"), interaction.drakeWS("general/userinfo:STATUS_" + (st ? st.toUpperCase() : "OFFLINE")), true)
            // .addField(interaction.drakeWS("general/userinfo:GAME", {
            //     emoji: "play"
            // }), (user.presence.activity ? user.presence.activity.name : interaction.drakeWS("general/userinfo:NO_GAME")), true)
            .addField(interaction.drakeWS("general/userinfo:HR", {
                emoji: "up"
            }), `${member.roles.highest}`, true)
            .addField(interaction.drakeWS("general/userinfo:ROLES", {
                emoji: "roleList",
                roleList: member.roles.cache.filter(role => role.id !== interaction.guild.roles.everyone.id).size
            }), `${member.roles.cache.filter(role => role.id !== interaction.guild.roles.everyone.id).size !== 0 ? (member.roles.cache.size > 10 ? member.roles.cache.filter(role => role.id !== interaction.guild.roles.everyone.id).map((r) => r).slice(0, 9).join(", ")+" " + interaction.drakeWS("general/userinfo:MR") : member.roles.cache.filter(role => role.id !== interaction.guild.roles.everyone.id).map((r) => r).join(", ")) : interaction.drakeWS("common:ANY_ROLES")}`, false)
        };

        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Userinfo;