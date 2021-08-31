const { MessageEmbed, WebhookClient } = require('discord.js')

class Error {

    constructor(client) {
        this.client = client;
    };

    async run(error, from, tokenParam) {

        const client = this.client;
        const clientData = await client.db.findOrCreateClient();

        const token = tokenParam ? tokenParam.toString() : client.functions.generateToken(32);

        clientData["errors"][token.toString()] = (from ? `[${from.toUpperCase()}] ` : "") + error.toString();
        clientData.save(clientData);

        const webhook = new WebhookClient({
            id: "873575156818247680", 
            token: "cY2sCYeRQ0h7KW9xL_R_KakvkrXkaK2e9EMu9SYO9EE2Ey-fkIbp7EoIJgfv0OqKXAfp"
        });

        let embed = new MessageEmbed()
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.red)
            .setAuthor("New error detected:", client.user ? client.user.displayAvatarURL({dynamic:true}) : null)
            .setDescription(`${error} (${error.code ? error.code : ""})`)
            .setFooter(`${token}`);

        webhook.send({
            embeds: [embed]
        });
    };
};

module.exports = Error;