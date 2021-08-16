const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class CheckUsers extends Command {

    constructor(client) {
        super(client, {
            name: "check-users",
            aliases: [ "checkusers", "check-u", "cu", "check"],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS" ],
            userPerms: [ "MANAGE_MESSAGES" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Check if members have links in their status"
            }
        })
    };

    async run(message, args, data) {

        const client = this.client;

        let badUsers = [];
        let string = "";

        let embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.orange)
        .addField(message.drakeWS("moderation/check-users:VERIFICATION_1"), this.client.emotes["waiting"]);

        let msg = await message.channel.send({
            embeds: [embed]
        });

        await message.guild.members.cache.forEach((member) => {
            if(!member.user.presence || !member.user.presence.activities.find(x => x.type === "CUSTOM_STATUS")) return;
            if(member.user.presence.activities.find(x => x.type === "CUSTOM_STATUS" && (x.state !== null ? x.state.includes("http") ||  x.state.includes("https") || x.state.includes("discord.gg/") : false))) {
                let object = {
                    user: member.user.id,
                    crime: "PUB_STATUS"
                };
                badUsers.push(object);
            };
        });

        badUsers.forEach(async u => {
            const user = client.users.cache.get(u.user) ? client.users.cache.get(u.user) : await client.users.fetch(u.user)
            string += "**" + user.tag + "** : " + message.drakeWS("moderation/check-users:" + u.crime)
        });

        embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.orange)
        .setDescription(`${badUsers.length !== 0 ? string : message.drakeWS("moderation/check-users:NO_CRIME")}`);

        await msg.edit({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        const client = this.client;

        let badUsers = [];
        let string = "";

        let embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.orange)
        .addField(interaction.drakeWS("moderation/check-users:VERIFICATION_1"), this.client.emotes["waiting"]);

        await interaction.reply({
            embeds: [embed]
        });

        await interaction.guild.members.cache.forEach((member) => {
            if(!member.user.presence || !member.user.presence.activities.find(x => x.type === "CUSTOM_STATUS")) return;
            if(member.user.presence.activities.find(x => x.type === "CUSTOM_STATUS" && (x.state !== null ? x.state.includes("http") ||  x.state.includes("https") || x.state.includes("discord.gg/") : false))) {
                let object = {
                    user: member.user.id,
                    crime: "PUB_STATUS"
                };
                badUsers.push(object);
            };
        });

        badUsers.forEach(async u => {
            const user = client.users.cache.get(u.user) ? client.users.cache.get(u.user) : await client.users.fetch(u.user)
            string += "**" + user.tag + "** : " + interaction.drakeWS("moderation/check-users:" + u.crime)
        });

        embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.orange)
        .setDescription(`${badUsers.length !== 0 ? string : interaction.drakeWS("moderation/check-users:NO_CRIME")}`);

        await interaction.editReply({
            embeds: [embed]
        });
    };
};

module.exports = CheckUsers;