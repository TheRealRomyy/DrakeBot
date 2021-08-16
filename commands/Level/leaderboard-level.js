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
            restriction: [],

            slashCommandOptions: {
                description: "See the 10 first user with DrakeBot exp system"
            }
        });
    };

    async run(message, args, data) {

        let client = this.client;
        const full = Boolean(args[0] === "full");
        let string = "";

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

        members.forEach(async m => {
            const user = client.users.cache.get(m.id) ? client.users.cache.get(m.id) : await client.users.fetch(m.id);
            string += (isNaN(isCountInPodium(count[m.id])) ? isCountInPodium(count[m.id]) : count[m.id] + ")") + " **" + user.username + "** ● " + message.drakeWS("common:LEVEL") + ": **" + m.level + "**" + ( full ? ` (**${expCount[m.id]} exp**)` : "") + "\n \n"
        })

        if(string == "") return message.drake("level/leaderboard-level:NO_MEMBERS", {
            emoji: "error"
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setThumbnail(message.guild.iconURL({ dynamic:true }))
        .setColor(this.client.cfg.color.yellow)
        .setDescription(`${string}`)
        .setTitle(message.drakeWS("level/leaderboard-level:TITLE", {
            guildName: message.guild.name
        }));

        return message.channel.send({
            embeds: [embed]
        });

        function isCountInPodium(count) {
            let result = count;
            if(count === 1) result = "🏆";
            if(count === 2) result = "🥈";
            if(count === 3) result = "🥉";
            return result;
        };
    };

    async runInteraction(interaction, data) {

        let client = this.client;
        const full = false;
        let string = "";

        let countVar = 1;
        let expCount = [];
        let count = [];

        let members = await this.client.db.fetchGuildMembers(interaction.guild.id);

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

        members.forEach(async m => {
            const user = client.users.cache.get(m.id) ? client.users.cache.get(m.id) : await client.users.fetch(m.id);
            (isNaN(isCountInPodium(count[m.id])) ? isCountInPodium(count[m.id]) : count[m.id] + ")") + " **" + user.username + "** ● " + interaction.drakeWS("common:LEVEL") + ": **" + m.level + "**" + ( full ? ` (**${expCount[m.id]} exp**)` : "") + "\n \n"
        });

        if(string == "") return interaction.reply({
            content: interaction.drakeWS("level/leaderboard-level:NO_MEMBERS", {
                emoji: "error"
            }),
            ephemeral: true
        });

        const embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setThumbnail(interaction.guild.iconURL({ dynamic:true }))
        .setColor(this.client.cfg.color.yellow)
        .setDescription(`${string}`)
        .setTitle(interaction.drakeWS("level/leaderboard-level:TITLE", {
            guildName: interaction.guild.name
        }));

        return interaction.reply({
            embeds: [embed]
        });

        function isCountInPodium(count) {
            let result = count;
            if(count === 1) result = "🏆";
            if(count === 2) result = "🥈";
            if(count === 3) result = "🥉";
            return result;
        };
    };
};

module.exports = LeaderboardLevel;