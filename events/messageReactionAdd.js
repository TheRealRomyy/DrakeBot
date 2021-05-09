class MessageReactionAdd {

    constructor(client) {
        this.client;
    };

    async run(reaction, user) {
        
        let message = reaction.message;

        if(!message) return;
        if(!message.channel.id) return;

        const emoji = reaction._emoji.name;

        if(message.guild.id !== "756915711250792560" || message.channel.id !== "767115893691252736" || user.id !== "709481084286533773") return; // DrakeBot | #Suggestions | Rome
        if(emoji !== "✅" && emoji !== "❌" && emoji !== "➖") return;
        if(!message.embeds[0] || message.embeds[0] == "undefined") return;

        const colorByName = {
            "❌": "RED",
            "✅": "GREEN",
            "➖": "ORANGE"
        };

        message.edit(message.embeds[0].setColor(colorByName[emoji]));
    }
};

module.exports = MessageReactionAdd;