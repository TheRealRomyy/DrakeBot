class ChannelCreate {

	constructor (client) {
		this.client = client;
	};

	async run (channel) {

        // Récupérer le client
        const client = this.client;

        // Récupérer la guild
        const guild = channel.guild;

        // Récupérer le data de la guild
        const guildData = await client.db.findOrCreateGuild(guild);

        // Si le captcha est activé
        if(guildData.plugins.captcha.enabled) {

            const noVerifiedRole = guildData.plugins.captcha.role;

            channel.updateOverwrite(noVerifiedRole, {
                VIEW_CHANNEL: false,
            }).catch((err) => {});
        };
	};
};

module.exports = ChannelCreate;