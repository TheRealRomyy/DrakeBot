const Command = require("../../structure/Commands.js");

class ClearSanctions extends Command {

    constructor(client) {
        super(client, {
            name: "clear-sanctions",
            aliases: [],
            dirname: __dirname,
            enabled: false,
            botPerms: [],
            userPerms: [ "KICK_MEMBERS" ],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(m => m.user.username === args[0]);

        if(!member) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "clear-sanctions <user>"
        });

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);
        
		memberData.sanctions = [];
        await memberData.save();
        
		return message.drake("moderation/clear-sanctions:SUCCES", {
            emoji: "succes",
			username: member.user.tag
		});
    };
};

module.exports = ClearSanctions;