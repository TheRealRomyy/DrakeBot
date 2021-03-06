const { MessageEmbed, WebhookClient } = require("discord.js");

module.exports = class {

	constructor (client) {
		this.client = client;
	}

	async run (guild) {

        this.client.serverRemoves++;

        const del = new MessageEmbed()
        .setTitle("<:remove:766787477175533591> **Server Removed**")
        .setThumbnail(guild.iconURL({ dynamic: true}))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.red)
        .setTimestamp()
        .addField(":memo: • Name", guild.name, false)
        .addField("<:id:750780969270771893> • ID", guild.id, false)
        .addField("<:owner:763412335569797141> • Owner", guild.owner.user.username + " (||" + guild.owner.id + "||)", false)
        .addField("<:member:750717695653183588> • Members", guild.memberCount, false)

        const webhook = new WebhookClient('766786237021028404', 'gy_0mhG3FtjcNH9BhX9_4reTQiEAfx9Bih6U8E7o1ry6ZOLLbK7yxDu_KIfXcoNfsFKh');
        
        webhook.send( {
            username: 'DrakeBot Stats',
            avatarURL: 'https://cdn.discordapp.com/attachments/766782356266549258/766786674763759616/drake.png',
            embeds: [del],
        });
	};
};