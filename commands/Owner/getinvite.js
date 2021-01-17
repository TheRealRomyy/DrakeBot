const Command = require("../../structure/Commands");

class Getinvite extends Command {
    constructor(client) {
        super(client,{
            name: "getinvite",
            aliases: [ "gi" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [ "MODERATOR" ]
        });
    };

    async run(message, args, data) {

        let guild = null;

        if (!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "getinvite <server_name>"
        });

        if(args[0]){
            let fetched = this.client.guilds.cache.find(g => g.name === args.join(" "));
            let found = this.client.guilds.cache.get(args[0]);
            if(!found) {
                if(fetched) {
                    guild = fetched;
                }
            } else {
                guild = found
            }
        } 
        if(guild){

            let tChannel = guild.channels.cache.find(ch => ch.type == "text" && ch.permissionsFor(ch.guild.me).has("CREATE_INSTANT_INVITE"));
            if(!tChannel) {
                message.delete();
                message.channel.send(`${this.client.emotes.error} **| La guild \`\`${args.join(' ')}\`\` n'a pas de salons textuels !**`).then(m => m.delete ({
                    timeout: 3000
                }));
                return;
            }
            let invite = await tChannel.createInvite({ temporary: false, maxAge: 0 }).catch(err => {
                message.delete();
                return;
            });

            message.channel.send(`Invitation vers: **${args.join(' ')}** \n ❯ ${invite.url}`);
        } else {
            message.delete();
            message.channel.send(`${this.client.emotes.error} **| Le bot n'est pas sur le serveur \`\`${args.join(' ')}\`\`**`).then(m => m.delete ({
                timeout: 3000
            }));
            return;
        };
    };
};

module.exports = Getinvite;