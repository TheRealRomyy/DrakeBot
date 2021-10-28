const { MessageEmbed, WebhookClient } = require('discord.js')

class Error {

    constructor(client) {
        this.client = client;
    };

    async run(error) {

        if(error.code == 10008) return; // Unknow message
        if(error.code == 50001) return; // Missing access

        const client = this.client;

        if((client.lastError + 2 * 1000) > Date.now()) return;

        const webhook = new WebhookClient({
            id: "873575156818247680", 
            token: "cY2sCYeRQ0h7KW9xL_R_KakvkrXkaK2e9EMu9SYO9EE2Ey-fkIbp7EoIJgfv0OqKXAfp"
        });

        let embed = new MessageEmbed()
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.red)
            .setAuthor("New error detected:", client.user ? client.user.displayAvatarURL({dynamic:true}) : null)
            .setDescription(`${error} (${error.code ? error.code : ""})`);

        webhook.send({
            embeds: [embed]
        });

        client.lastError = Date.now();
    };
};

module.exports = Error;