module.exports = class {

    constructor(client) {
        this.client = client;
    };

    async run(member) {

        // Guild
        let guild = member.guild;

		// Get le data de la guild
		const guildData = await this.client.db.findOrCreateGuild(guild);

        // Définir le plugin de goodbye si il y en a pas
        if(!guildData.plugins.leave) guildData.plugins.leave = {
            enabled: false,
            message: null,
            channel: null
        };

        // Check le goodbye plugin
        if(guildData.plugins.leave.enabled) {
            let channel = this.client.channels.cache.get(guildData.plugins.leave.channel);
            channel.send({
                content: guildData.plugins.leave.message
                    .replace("{user}", member.user.username)
                    .replace("{guild.name}", guild.name)
                    .replace("{guild.members}", guild.memberCount)
            });
        };
    };
};