class AutomodManager {

    constructor(client, message, data) {
        this.client = client;
        this.message = message;
        this.data = data;
    };

    async check() {

        const data = this.data;
        const message = this.message;

        if(data.guild.plugins.automod.antiMajs.enabled && !message.member.permissions.has("MANAGE_MESSAGES")) this.antiMajs();
        if(data.guild.plugins.automod.antiBadwords.enabled && !message.member.permissions.has("MANAGE_MESSAGES")) this.antiBadwords();
        if(data.guild.plugins.automod.antiPub.enabled && !message.member.permissions.has("MANAGE_MESSAGES")) this.antipub();

    };

    antipub() {

        const message = this.message;
        const client = this.client;
        const data = this.data;

        if(message.content.toLowerCase().includes('.gg/'.toLowerCase() || 'discordapp.com/invite/'.toLowerCase())) {
            message.delete();
            client.functions.warn(message.member, message, client.user, data.guild, message.drakeWS("misc:PUB"), data.member, client);
        };
    }

    async antiBadwords() {

        const message = this.message;
        const client = this.client;
        const data = this.data;

        let infraction = false;
        await client.cfg.badwords.forEach((word) => {
            if(message.content.includes(word)) infraction = true;
        });

        if(infraction == true) {
            message.delete();
            client.functions.warn(message.member, message, client.user, data.guild, message.drakeWS("misc:BADWORDS"), data.member, client);
        }
    }

    antiMajs() {

        const message = this.message;
        const client = this.client;
        const data = this.data;

        let max = Math.round(message.content.length / 1.5);
            let count = 0;
            let majs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
            for(let i = message.content.length; i >- 1; i--) {
                if(majs.indexOf(message.content[i]) !== -1) {
                   count++;
                };
            };
    
            if(count >= max) {
                message.delete();
                client.functions.warn(message.member, message, client.user, data.guild, message.drakeWS("misc:FULLMAJ"), data.member, client);
            }; 
    }

};

module.exports = AutomodManager;