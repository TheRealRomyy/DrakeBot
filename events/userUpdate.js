module.exports = class {

	constructor (client) {
		this.client = client;
	}

	async run (oldUser, newUser) {

        // if(oldUser.avatar !== newUser.avatar) this.client.channels.cache.get('795147142011420722').send(newUser.displayAvatarURL({ dynamic:true, size: 1024}))
		
		if(oldUser.username !== newUser.username) {

			let userData = await this.client.db.findOrCreateUser(newUser);

			if(!userData.names) userData.names = [];

			let object = {
				name: oldUser.username,
				date: Date.now()
			};
			userData.names.push(object);

			await userData.save();
		}
	};
};