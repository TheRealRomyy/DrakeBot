const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class LeaderboardLevel extends Command {

    constructor(client) {
        super(client, {
            name: "leaderboard-level",
            aliases: [ "lb-level", "top-level" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let client = this.client;

        let countVar = 1;
        let expCount = [];
        let count = [];

        let members = await this.client.db.fetchGuildMembers(message.guild.id);

        members.forEach((m) => {
            expCount[m.id] = m.exptotal;
        });

        members = members.sort((a,b) => expCount[b.id] - expCount[a.id]);

        members.forEach((m) => {
            if(countVar > 10) return count[m.id] = "ghost"; 
            if(m.exptotal === 0) return count[m.id] = "ghost"; 
            count[m.id] = countVar++;
        });

        members = members.filter(mem => count[mem.id] !== "ghost");
        members = members.filter(mem => !isNaN(client.users.cache.get(mem.id)));

        const membersLeaderboard = members.map((m) => 
            "" + count[m.id] + ") **" + client.users.cache.get(m.id).username + "** ● " + message.drakeWS("common:LEVEL") + ": **" + m.level + "**" + " (**" + m.exptotal + " exp**)" + "\n"
        );

        if(membersLeaderboard == "") return message.drake("level/leaderboard-level:NO_MEMBERS", {
            emoji: "error"
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.yellow)
        .setDescription(membersLeaderboard)
        .setTitle(message.drakeWS("level/leaderboard-level:TITLE", {
            guildName: message.guild.name
        }));

        return message.channel.send(embed);
    };
};

module.exports = LeaderboardLevel;