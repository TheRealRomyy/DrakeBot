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
            restriction: []
        })
    };

    async run(message, args, data) {

        let badUsers = [];

        let embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.orange)
        .addField(message.drakeWS("moderation/check-users:VERIFICATION_1"), this.client.emotes["waiting"]);

        let msg = await message.channel.send(embed);

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

        embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.orange)
        .addField(message.drakeWS("moderation/check-users:VERIFICATION_1"), this.client.emotes["succes"])
        .addField(message.drakeWS("moderation/check-users:VERIFICATION_2"), this.client.emotes["waiting"]);

        await msg.edit(embed);

        await message.guild.members.cache.forEach((member) => {
            if(data.client.blacklist.users.includes(member.user.id)) {
                let object = {
                    user: member.user.id,
                    crime: "BLACKLIST"
                };
                badUsers.push(object);
            };
        });

        embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.orange)
        .addField(message.drakeWS("moderation/check-users:VERIFICATION_1"), this.client.emotes["succes"])
        .addField(message.drakeWS("moderation/check-users:VERIFICATION_2"), this.client.emotes["succes"]);

        await msg.edit(embed);

        embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.orange)
        .setDescription(badUsers.length !== 0 ? badUsers.map(u => "**" + this.client.users.cache.get(u.user).tag + "** : " + message.drakeWS("moderation/check-users:" + u.crime)) : "Il n'y a aucun membres incorrectes");

        await msg.edit(embed);
    };
};

module.exports = CheckUsers;