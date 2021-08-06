const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class LeaderboardMoney extends Command {

    constructor(client) {
        super(client, {
            name: "leaderboard-money",
            aliases: [ "lb-money", "top-money" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "See the 10 first player with DrakeBot's money system"
            }
        });
    };

    async run(message, args, data) {

        let client = this.client;

        let countVar = 1;
        let moneyCount = [];
        let count = [];

        let members = await this.client.db.fetchGuildMembers(message.guild.id);

        members.forEach((m) => {
            moneyCount[m.id] = m.money + m.banksold;
        });

        members = members.sort((a,b) => moneyCount[b.id] - moneyCount[a.id]);

        members.forEach((m) => {
            if(countVar > 10) return count[m.id] = "ghost"; 
            if(m.money + m.banksold === 0) return count[m.id] = "ghost"; 
            count[m.id] = countVar++;
        });

        members = members.filter(mem => count[mem.id] !== "ghost");

        const membersLeaderboard = members.map((m) => 
            "" + count[m.id] + ") **" + client.users.cache.get(m.id).username + "** ● " + message.drakeWS("common:MONEY") + ": **" + (m.money + m.banksold) + data.guild.symbol + "**"
        ).join("\n \n");

        if(membersLeaderboard == "") return message.drake("economy/leaderboard-money:NO_MEMBERS", {
            emoji: "error"
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.yellow)
        .setThumbnail(message.guild.iconURL({ dynamic:true }))
        .setDescription(`${membersLeaderboard}`)
        .setTitle(message.guild.translate("economy/leaderboard-money:TITLE", {
            guildName: message.guild.name
        }));

        await message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        let client = this.client;

        let countVar = 1;
        let moneyCount = [];
        let count = [];

        let members = await this.client.db.fetchGuildMembers(interaction.guild.id);

        members.forEach((m) => {
            moneyCount[m.id] = m.money + m.banksold;
        });

        members = members.sort((a,b) => moneyCount[b.id] - moneyCount[a.id]);

        members.forEach((m) => {
            if(countVar > 10) return count[m.id] = "ghost"; 
            if(m.money + m.banksold === 0) return count[m.id] = "ghost"; 
            count[m.id] = countVar++;
        });

        members = members.filter(mem => count[mem.id] !== "ghost");

        const membersLeaderboard = members.map((m) => 
            "" + count[m.id] + ") **" + client.users.cache.get(m.id).username + "** ● " + interaction.drakeWS("common:MONEY") + ": **" + (m.money + m.banksold) + data.guild.symbol + "**"
        ).join("\n \n");

        if(membersLeaderboard == "") return interaction.reply({
            content: interaction.drakeWS("economy/leaderboard-money:NO_MEMBERS", {
                emoji: "error"
            }),
            ephemeral: true
        });

        const embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.yellow)
        .setThumbnail(interaction.guild.iconURL({ dynamic:true }))
        .setDescription(`${membersLeaderboard}`)
        .setTitle(interaction.guild.translate("economy/leaderboard-money:TITLE", {
            guildName: interaction.guild.name
        }));

        await interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = LeaderboardMoney;