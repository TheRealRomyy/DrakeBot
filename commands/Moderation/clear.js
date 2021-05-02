const Command = require("../../structure/Commands.js");

class Clear extends Command {

    constructor(client) {
        super(client, {
            name: "clear",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_MESSAGES", "MANAGE_CHANNELS" ],
            userPerms: [ "MANAGE_MESSAGES" ],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(args[0] == "all") return message.drake("moderation/clear:NUKE_EXIST", { 
            prefix: data.guild.prefix, 
            emoji: "info" 
        });

        let amount = args[0];
        if(!amount || isNaN(amount) || parseInt(amount) < 1) return message.drake("errors:NOT_CORRECT", {
            emoji:	"error",
            usage: data.guild.prefix + "clear <amount> (user)"
        });

        await message.delete().catch(() => {});

        const user = message.mentions.users.first() || this.client.users.cache.get(args[1]) || this.client.users.cache.find(u => u.username === args[1]);

        let messages = await message.channel.messages.fetch({ limit: 100 });
        messages = messages.array();

        if(user) messages = messages.filter((m) => m.author.id === user.id);
        if(messages.length > amount) messages.length = parseInt(amount, 10);

        messages = messages.filter((m) => !m.pinned);
        amount++;

        message.channel.bulkDelete(messages, true);

        if(user) await message.channel.send(message.drakeWS("moderation/clear:CLEARED_MEMBER", {
            amount: --amount,
            username: user.tag,
            emoji: "clear"
        })).then(m => m.delete({
            timeout: 4000
        }));
        else await message.channel.send(message.drakeWS("moderation/clear:CLEARED", {
            amount: --amount,
            emoji: "clear"
        })).then(m => m.delete({
            timeout: 4000
        }));
    };
};

module.exports = Clear;