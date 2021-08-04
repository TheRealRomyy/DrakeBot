const Command = require("../../structure/Commands.js");
const { MessageAttachment, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");
const canvacord = require("canvacord");

class Rank extends Command {

	constructor (client) {
		super(client, {
            name: "rank",
            aliases: [ "xp", "level" ],
			dirname: __dirname,
			enabled: true,
			botPers: [],
			userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "View a member's rank",
                options: [
                    {
                        name: "member",
                        type: ApplicationCommandOptionTypes.USER,
                        required: false,
                        description: "What is the member you want to see ?"
                    }
                ]
            }
		});
	}

	async run (message, args, data) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const user = member.user;

        if(user.bot) return message.drake("level/rank:USER_IS_BOT", {
            emoji: "error"
        });

        let msg = await message.channel.send({
            content: this.client.emotes["waiting"]
        });

        const rank = new canvacord.Rank();

        let count = 1;
        let stop = false;
        let expCount = [];

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);
        const rankData = rank.data;

        data.guild.plugins.levels.rankRewards.forEach(rank => {
            if(rank.level <= memberData.level) member.roles.add(rank.rank).catch(() => {});
            if(rank.level >= memberData.level) member.roles.remove(rank.rank).catch(() => {});
        });

        let members = await this.client.db.fetchGuildMembers(message.guild.id);

        members.forEach((m) => {
            expCount[m.id] = m.exptotal;
        });

        members = members.sort((a,b) => expCount[b.id] - expCount[a.id]);

        await members.forEach(async (m) => {
            if(m.id === user.id) stop = true;
            if(!stop) count++;
        });

        // Informations sur l'user
        rankData.username.name = user.username;
        rankData.discriminator.discrim = user.discriminator;
        rankData.avatar.source = user.displayAvatarURL({ format: 'png' });

        // Informations sur son status 
        rankData.status = {
            width: 5,
            type: member.presence ? member.presence.status : "offline",
            color: member.presence ? await getColorWithStatus(member.presence.status) : "#747F8E",
            circle: true
        };

        // Informations sur son level
        rankData.currentXP.data = memberData.exp;
        rankData.requiredXP.data = 5 * (memberData.level ^ 2) + (50 * memberData.level) + 100

        // Couleurs
        rankData.progressBar.bar.color = "#00C1FF";
        rankData.overlay = { display: true, level: 0.8, color: '#000000' };

        // Affichage du level et du rank
        rankData.rank = {
            display: true,
            data: count,
            textColor: '#FFFFFF',
            color: '#F3F3F3',
            displayText: "Rank"
        };
        
        rankData.level = {
            display: true,
            data: memberData.level,
            textColor: '#FFFFFF',
            color: '#F3F3F3',
            displayText: "Level",
        };
            
        await rank.build().then(data => {
            const attachment = new MessageAttachment(data, "RankCard.png");
            msg.delete().catch(() => {});
            message.channel.send({
                files: [attachment]
            });
        });
    
        async function getColorWithStatus(status) {
            let color = "";
            switch(status) {
                case "dnd":
                    color = "#F04747";
                    break;
                case "online":
                    color = "#43B581";
                    break;
                case "idle":
                    color = "#FAA61A";
                    break;
                case "offline":
                    color = "#747F8E";
                    break;
                default:
                    color = "#FFFFFF";
                    break;
            };  
            return color;
        };
    };

    async runInteraction (interaction, data) {

        const member = interaction.options.getUser("member") ? interaction.guild.members.cache.get(interaction.options.getUser("member").id) : interaction.guild.members.cache.get(interaction.user.id);
        const user = member.user;

        if(user.bot) return interaction.reply({
            content: interaction.drakeWS("level/rank:USER_IS_BOT", {
                emoji: "error"
            }),
            ephemeral: true
        });

        const rank = new canvacord.Rank();

        let count = 1;
        let stop = false;
        let expCount = [];

        const memberData = await this.client.db.findOrCreateMember(member, interaction.guild);
        const rankData = rank.data;

        data.guild.plugins.levels.rankRewards.forEach(rank => {
            if(rank.level <= memberData.level) member.roles.add(rank.rank).catch(() => {});
            if(rank.level >= memberData.level) member.roles.remove(rank.rank).catch(() => {});
        });

        let members = await this.client.db.fetchGuildMembers(interaction.guild.id);

        members.forEach((m) => {
            expCount[m.id] = m.exptotal;
        });

        members = members.sort((a,b) => expCount[b.id] - expCount[a.id]);

        await members.forEach(async (m) => {
            if(m.id === user.id) stop = true;
            if(!stop) count++;
        });

        // Informations sur l'user
        rankData.username.name = user.username;
        rankData.discriminator.discrim = user.discriminator;
        rankData.avatar.source = user.displayAvatarURL({ format: 'png' });

        // Informations sur son status 
        rankData.status = {
            width: 5,
            type: member.presence ? member.presence.status : "offline",
            color: member.presence ? await getColorWithStatus(member.presence.status) : "#747F8E",
            circle: true
        };

        // Informations sur son level
        rankData.currentXP.data = memberData.exp;
        rankData.requiredXP.data = 5 * (memberData.level ^ 2) + (50 * memberData.level) + 100

        // Couleurs
        rankData.progressBar.bar.color = "#00C1FF";
        rankData.overlay = { display: true, level: 0.8, color: '#000000' };

        // Affichage du level et du rank
        rankData.rank = {
            display: true,
            data: count,
            textColor: '#FFFFFF',
            color: '#F3F3F3',
            displayText: "Rank"
        };
        
        rankData.level = {
            display: true,
            data: memberData.level,
            textColor: '#FFFFFF',
            color: '#F3F3F3',
            displayText: "Level",
        };
            
        await rank.build().then(data => {
            const attachment = new MessageAttachment(data, "RankCard.png");
            interaction.reply({
                files: [attachment]
            });
        });
    
        async function getColorWithStatus(status) {
            let color = "";
            switch(status) {
                case "dnd":
                    color = "#F04747";
                    break;
                case "online":
                    color = "#43B581";
                    break;
                case "idle":
                    color = "#FAA61A";
                    break;
                case "offline":
                    color = "#747F8E";
                    break;
                default:
                    color = "#FFFFFF";
                    break;
            };  
            return color;
        };
    };
};

module.exports = Rank;