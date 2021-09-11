class ChannelCreate {

	constructor (client) {
		this.client = client;
	};

	async run (channel) {

        if(channel.type == "dm") return;

        // Récupérer le client
        const client = this.client;

        // Récupérer la guild
        const guild = channel.guild;

        // Récupérer le data de la guild
        const guildData = await client.db.findOrCreateGuild(guild);

        // Si le captcha est activé
        if(guildData.plugins.captcha.enabled) {

            const noVerifiedRole = guildData.plugins.captcha.role;

            channel.permissionOverwrites.edit(noVerifiedRole, {
                VIEW_CHANNEL: true,
                SEND_MESSAGE: false,
            }).catch((err) => {});
        };

        // Mettre a jour le channel pour le role des mutes
		let muteRole = channel.guild.roles.cache.find(r => r.name === 'Drake - Mute');
        if(muteRole) channel.permissionOverwrites.edit(muteRole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            CONNECT: false,
            SPEAK: false
        });
	};
};

module.exports = ChannelCreate;