module.exports = class {

	constructor (client) {
		this.client = client;
	}

	async run (oldGuild, newGuild) {
		
		if(oldGuild.name !== newGuild.name) {

			let guildData = await this.client.db.findOrCreateGuild(newGuild);

			if(!guildData.names) guildData.names = [];

			let object = {
				name: oldGuild.name,
				date: Date.now()
			};
			guildData.names.push(object);

			await guildData.save();
		}
	};
};