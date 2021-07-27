class AntiraidManager {

    constructor(client) {
        this.client = client;

        this.messages = {};
    };

    async init() {

        // Antispam
        this.client.on("message", (message) => this.antispam(message));

    };

    async antispam(message) {

        const guildData = await this.client.db.findOrCreateGuild(message.guild);

        if(!guildData.antiraid.antiraid.enabled) return;

        if (guildData.antiraid.antispam.ignoredRoles.some((r) => message.member.roles.cache.has(r))) return;
        if (guildData.antiraid.antispam.ignoredChannels.includes(message.channel.id)) return;
        if (message.guild.owner.id === message.author.id);

        let messageToCache = {
            authorId: message.author.id,
            guildId: message.guild.id,
            sentTimestamp: message.createdTimestamp,
            channelId: message.channel.id
        };

        if(this.messages[message.guild.id] !== null) this.messages[message.guild.id] = [];
        this.messages[message.guild.id].push(messageToCache);

        const cachedMessagesMatches = this.messages.filter((msg) => msg.authorId === message.author.id && msg.guildId === message.guild.id);
        const spamMessages = cachedMessagesMatches.filter((msg) => msg.sentTimestamp > (messageToCache.sentTimestamp - guildData.antiraid.antispam.time));

        if(spamMessages >= guildData.antiraid.antispam.limit) return;

        
    };

};

module.exports = AntiraidManager;