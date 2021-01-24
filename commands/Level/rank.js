const Command = require("../../structure/Commands.js");
const { MessageAttachment } = require("discord.js");
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
            restriction: []
		});
	}

	async run (message, args, data) {

        const member = message.mentions.members.first() || message.guild.member(args[0]) || message.member;
        const user = member.user;

        if(user.bot) return message.drake("level/rank:USER_IS_BOT", {
            emoji: "error"
        });

        let msg = await message.channel.send(this.client.emotes["waiting"]);

        const rank = new canvacord.Rank();

        let count = 1;
        let toRemove = 0;
        let stop = false;
        let expCount = [];

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);
        const rankData = rank.data;

        let members = await this.client.db.fetchGuildMembers(message.guild.id);

        members.forEach((m) => {
            expCount[m.id] = m.exp;
        });

        members = members.sort((a,b) => expCount[b.id] - expCount[a.id]);

        await members.forEach(async (m) => {
            if(m.id === user.id) stop = true;
            if(!stop) count++;
        });

        for(let lvl = 0; lvl < memberData.level; lvl++) {
            toRemove += ( 7 * (lvl * lvl) + 80 * lvl + 100);
        };

        // Informations sur l'user
        rankData.username.name = user.username;
        rankData.discriminator.discrim = user.discriminator;
        rankData.avatar.source = user.displayAvatarURL({ format: 'png' });

        // Informations sur son status 
        rankData.status = {
            width: 5,
            type: user.presence.status,
            color: await getColorWithStatus(user.presence.status),
            circle: true
        };

        // Informations sur son level
        rankData.currentXP.data = memberData.exp - toRemove;
        rankData.requiredXP.data = 7 * (memberData.level * memberData.level) + 80 * memberData.level + 100;

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
            msg.delete();
            message.channel.send(attachment);
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