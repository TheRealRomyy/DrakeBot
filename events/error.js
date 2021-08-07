const { MessageEmbed, WebhookClient } = require('discord.js')

class Error {

    constructor(client) {
        this.client = client;
    };

    async run(error) {

        const client = this.client;

        client.logger.error(error);

        const webhook = new WebhookClient({
            id: "873575156818247680", 
            token: "cY2sCYeRQ0h7KW9xL_R_KakvkrXkaK2e9EMu9SYO9EE2Ey-fkIbp7EoIJgfv0OqKXAfp"
        });

        let embed = new MessageEmbed()
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.red)
            .setAuthor("New error detected:", client.user.displayAvatarURL({
                dynamic: true
            }))
            .setDescription(`${error}`);

        webhook.send({
            embeds: [embed]
        });
    };
};

module.exports = Error;