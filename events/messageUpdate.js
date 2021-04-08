const { MessageEmbed } = require("discord.js");

class MessageUpdate {

    constructor(client) {
        this.client = client;
    };

    async run(oldMessage, newMessage) {

        if(oldMessage.content === newMessage.content) return; // Pas un edit

        let guildData = await  this.client.db.findOrCreateGuild(newMessage.guild);

        if(!guildData.plugins.logs) {
            guildData.plugins.logs = {
                mod: false,
                messages: false
            };
            await guildData.save();
        };

        if(!guildData.plugins.logs.messages) return;
        if(guildData.plugins.logs.messages && !this.client.channels.cache.get(guildData.plugins.logs.messages)) {
            guildData.plugins.logs.mod = false;
            await guildData.save()
        };

        let channel = this.client.channels.cache.get(guildData.plugins.logs.messages);

        const embed = new MessageEmbed()
        .setTitle(`${this.client.emotes.log["edit"]} ・ ${newMessage.drakeWS("misc:LOG_MSG_TITLE_EDIT")}`)
		.setColor(this.client.cfg.color.blue)
		.setFooter(newMessage.drakeWS("misc:MESSAGE_OF", {
            user: oldMessage.author.tag
        }))
        .setDescription(newMessage.drakeWS("misc:OLD_MSG") + "```" + oldMessage.content + "```\n" + newMessage.drakeWS("misc:NEW_MSG") + "```" + newMessage.content + "```")

		return channel.send(embed);
    }
};

module.exports = MessageUpdate;