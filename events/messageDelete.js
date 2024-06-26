const { MessageEmbed } = require("discord.js");

class MessageDelete {

    constructor(client) {
        this.client = client;
    };

    async run(message) {

        if(!message.author) return;

        this.client.snipe[message.channel.id] = {
            author: message.author.id,
            text: message.content,
            date: Date.now()
        };

        if(!message || !message.guild || !message.drakeWS ||!message.guild.data) return;

        let guildData = await this.client.db.findOrCreateGuild(message.guild);

        if(!guildData.plugins.logs) {
            guildData.plugins.logs = {
                mod: false,
                messages: false
            };
            await guildData.save();
        };

        if(!guildData.plugins.logs.messages) return;
        if(guildData.plugins.logs.messages && !( await this.client.channels.cache.get(guildData.plugins.logs.messages))) {
            guildData.plugins.logs.mod = false;
            await guildData.save()
        };

        let channel = this.client.channels.cache.get(guildData.plugins.logs.messages);
        if(!channel) return;

        const embed = new MessageEmbed()
		.setTitle(`${this.client.emotes.log["delete"]} ・ ${message.drakeWS("misc:LOG_MSG_TITLE")}`)
		.setColor(this.client.cfg.color.red)
        .setDescription(message.content ? message.content : message.drakeWS("misc:NO_TEXT", {
            emoji: "error"
        }))
		if(message.author !== null) embed.setFooter(message.drakeWS("misc:MESSAGE_OF", {
            user: message.author.tag
        }));
        else embed.setFooter(message.drakeWS("misc:MESSAGE_OF", {
            user: this.client.user.tag
        }));

		return channel.send({
            embeds: [embed]
        });
    }
};

module.exports = MessageDelete;