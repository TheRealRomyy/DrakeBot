module.exports = class {

	constructor (client) {
		this.client = client;
	}

	async run() {

        this.client.channels.cache.get("793262294493560893").send({
			content: "<:idle:750782527626543136> Bot is reconnecting..."
		});

	};
};