const { MessageEmbed } = require("discord.js");

module.exports = class {

	constructor (client) {
		this.client = client;
	};

	async run (guild) {

        const guildOwner = this.client.users.cache.get(guild.ownerId);

        this.client.serverRemoves++;

        const del = new MessageEmbed()
        .setTitle("<:remove:766787477175533591> **Server Removed**")
        .setThumbnail(guild.iconURL({ dynamic: true}))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.red)
        .setTimestamp()
        .addField(":memo: • Name", guild.name, false)
        .addField("<:id:750780969270771893> • ID", `${guild.id}`, false)
        .addField("<:owner:763412335569797141> • Owner", guildOwner.username + " (||" + guild.ownerId + "||)", false)
        .addField("<:member:750717695653183588> • Members", `${guild.memberCount}`, false)

        const channel = this.client.channels.cache.get("766782516908392498");
        
        channel.send({
            embeds: [del]
        });
	};
};