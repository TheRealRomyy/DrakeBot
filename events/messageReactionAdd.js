class MessageReactionAdd {

    constructor(client) {
        this.client = client;
    };

    async run (reaction, user) {

        const client = this.client;

        if(!reaction || !user) return;
        
        if(user.bot) return;
        let message = reaction.message

        let emoji = reaction._emoji
        if(!emoji) return;
        let emojiName = emoji.name;

        if(user.partial) await user.fetch()
        if(message.partial) await message.fetch()
        if(!message) return;

        let channel = message.channel
        if(!channel) return;

        let member  = message.guild.members.cache.get(user.id)
        if(member.partial) await member.fetch()
        if(!member) return;

        let guildData = await client.db.findOrCreateGuild(message.guild);

        if(guildData.reactionroles !== null) {
            let reactionRoleData = guildData.reactionroles.find(r => r.message === message.id && r.reaction === emoji.id || r.message === message.id && r.reaction === emoji.name);

            if(reactionRoleData) {
                if(emojiName !== reactionRoleData.reaction && emoji.id !== reactionRoleData.reaction) return;

                if(reactionRoleData.message === message.id && reactionRoleData.reaction === emoji.id || reactionRoleData.message === message.id && reactionRoleData.reaction === emoji.name) {
                    let role = message.guild.roles.cache.get(reactionRoleData.role);
                    if(role) member.roles.add(role);
                };
            };
        };

        if(message.guild.id === "756915711250792560" && message.channel.id === "767115893691252736" && user.id === "709481084286533773") { // DrakeBot | #Suggestions | Rome
            if(emojiName !== "✅" && emojiName !== "❌" && emojiName !== "➖") return;
            if(!message.embeds[0] || message.embeds[0] == "undefined") return;

            const colorByName = {
                "❌": "RED",
                "✅": "GREEN",
                "➖": "ORANGE"
            };

            message.edit({
                embeds: [message.embeds[0].setColor(colorByName[emoji])]
            });  
        };
    };
};

module.exports = MessageReactionAdd;