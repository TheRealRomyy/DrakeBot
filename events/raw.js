/* FROM https://gist.github.com/Danktuary/27b3cef7ef6c42e2d3f5aff4779db8ba */

class Raw {

	constructor (client) {
		this.client = client;
	};

	async run (packet) {

        if(!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

        const channel = this.client.channels.cache.get(packet.d.channel_id);

        if(channel.messages.cache.has(packet.d.message_id)) return;

        channel.messages.fetch(packet.d.message_id).then(message => {

            const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
            const reaction = message.reactions.cache.get(emoji);

            if(reaction) reaction.users.cache.set(packet.d.user_id, this.client.users.cache.get(packet.d.user_id));

            if(packet.t === 'MESSAGE_REACTION_ADD') this.client.emit('messageReactionAdd', reaction, this.client.users.cache.get(packet.d.user_id));
            if(packet.t === 'MESSAGE_REACTION_REMOVE') this.client.emit('messageReactionRemove', reaction, this.client.users.cache.get(packet.d.user_id));
        });
	};
};

module.exports = Raw;