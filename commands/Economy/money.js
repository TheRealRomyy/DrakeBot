const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Money extends Command {

    constructor(client) {
        super(client, {
            name: "money",
            aliases: [ "sold", "balance" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let member = message.mentions.members.first() || message.guild.member(this.client.users.cache.get(args[0])) || message.member;
        let user = member.user;

        if(user.bot) return message.drake("economy/money:BOT", {
            emoji: "error",
            bot: user.username
        });

        const memberData = (message.author === user) ? data.member : await this.client.db.findOrCreateMember(user, message.guild); 

        const money = memberData.money;
        const bankSold = memberData.banksold;
        const globalMoney = memberData.money + memberData.banksold;

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setTitle(message.drakeWS("economy/money:TITLE", {
            emoji: "moneybag",
            username: user.username
        }))
        .setColor(money > 0 ? this.client.cfg.color.green : this.client.cfg.color.red)
        .addField(message.drakeWS("economy/money:MONEY"), 
        money + data.guild.symbol, false)
        .addField(message.drakeWS("economy/money:BANKSOLD"), 
        bankSold + data.guild.symbol, false)
        .addField(message.drakeWS("economy/money:GLOBAL"), 
        globalMoney + data.guild.symbol, false);
	
        return message.channel.send(embed);
    };
}; 

module.exports = Money;