const { MessageEmbed, WebhookClient } = require("discord.js");

module.exports = class {

	constructor (client) {
		this.client = client;
	}

	async run (guild) {

        this.client.serverAdds++;

        const create = new MessageEmbed()
        .setTitle("<:add:766787439535718412> **Server Added**")
        .setDescription(this.client.guilds.cache.size + "/100")
        .setThumbnail(guild.iconURL({ dynamic: true}))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.green)
        .setTimestamp()
        .addField(":memo: • Name", guild.name, false)
        .addField("<:id:750780969270771893> • ID", guild.id, false)
        .addField("<:owner:763412335569797141> • Owner", guild.owner.user.username + " (||" + guild.owner.id + "||)", false)
        .addField("<:member:750717695653183588> • Members", guild.memberCount, false)
        
        const thankEmbed = new MessageEmbed()
        .setTitle(":heart: Thanks to adding me !")
        .setTimestamp()
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.green)
        .setDescription(`:flag_gb: You can change my prefix with \`d!setprefix <newPrefix>\` \nOr change my language with \`d!setlang <fr/en>\` \nYou can also see the list of my commands with \`d!help\` \nI'm on **${this.client.guilds.cache.size} guilds** with **${this.client.users.cache.size} users** !` + "\n \n" + `:flag_fr: Vous pouvez changer mon prefix avec \`d!setprefix <newPrefix>\` \nVous pouvez changer mon langage par défaut avec \`d!setlang <fr/en>\` \nEt vous pouvez aussi regarder la liste des commandes avec \`d!help\` \nJe suis sur **${this.client.guilds.cache.size} serveurs** avec **${this.client.users.cache.size} utilisateurs** !`)

        const webhook = new WebhookClient('766786432017891348', 'SOgXc_zTwIY8EiS9jUK0G9uiiWZReyt3_UaXv2ZVFeMB7SYLXN-onnJXkHPAtP2fj16R');
        
        webhook.send({
            username: 'DrakeBot Stats',
            avatarURL: 'https://cdn.discordapp.com/attachments/766782356266549258/820754780816670740/drakebot.png',
            embeds: [create],
        });
        
        guild.owner.send(thankEmbed);
	};
};