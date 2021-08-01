const { MessageEmbed } = require("discord.js");

module.exports = class {

	constructor (client) {
		this.client = client;
	};

	async run (guild) {

        const guildOwner = this.client.users.cache.get(guild.ownerId);

        // Send stats on top.gg
        this.client.functions.sendServerCount(this.client);

        this.client.serverAdds++;

        const create = new MessageEmbed()
        .setTitle("<:add:766787439535718412> **Server Added**")
        .setDescription(this.client.guilds.cache.size + "/100")
        .setThumbnail(guild.iconURL({ dynamic: true}))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.green)
        .setTimestamp()
        .addField(":memo: • Name", guild.name, false)
        .addField("<:id:750780969270771893> • ID", `${guild.id}`, false)
        .addField("<:owner:763412335569797141> • Owner", guildOwner.username + " (||" + guild.ownerId + "||)", false)
        .addField("<:member:750717695653183588> • Members", `${guild.memberCount}`, false)
        
        const thankEmbed = new MessageEmbed()
        .setTitle(":heart: Thanks to adding me !")
        .setTimestamp()
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.green)
        .setDescription(`:flag_gb: You can change my prefix with \`d!setprefix <newPrefix>\` \nOr change my language with \`d!setlang <fr/en>\` \nYou can also see the list of my commands with \`d!help\` \nI'm on **${this.client.guilds.cache.size} guilds** with **${this.client.users.cache.size} users** !` + "\n \n" + `:flag_fr: Vous pouvez changer mon prefix avec \`d!setprefix <newPrefix>\` \nVous pouvez changer mon langage par défaut avec \`d!setlang <fr/en>\` \nEt vous pouvez aussi regarder la liste des commandes avec \`d!help\` \nJe suis sur **${this.client.guilds.cache.size} serveurs** avec **${this.client.users.cache.size} utilisateurs** !`)

        const channel = this.client.channels.cache.get("766782498633678908");
        
        channel.send({
            embeds: [create]
        });

        guildOwner.send({
            embeds: [thankEmbed]
        });
	};
};