module.exports = class {

	constructor (client) {
		this.client = client;
	}

	async run() {

        this.client.channels.cache.get("793262294493560893").send({
			content: "<:dnd:750782449168023612> Bot disconnected"
		});

	};
};