const Command = require("../../structure/Commands.js");

class AddrankLevel extends Command {

    constructor(client) {
        super(client, {
            name: "addrank-level",
            aliases: [ "addranklevel", "addrank-lvl", "add-lvl"],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_ROLES" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(!args[0] || !args[1] || isNaN(args[0])) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "addrank-level <level> <rank>"
        });
    
        const level = args[0];
        const rank = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(x => x.name === args[1]);

        if(message.guild.members.cache.get(this.client.user.id).roles.highest.position <= rank.position) return message.drake("level/addrank-level:TOO_LOW", {
            emoji: "error"
        }); 
    
        data.guild.plugins.levels.rankRewards.push({
            level: level,
            rank: rank.id
        });
    
        await data.guild.save();
    
        message.drake("level/addrank-level:SUCCES", {
            emoji: "succes",
            rank: rank,
            level: level.toString(),
        });
    };
};

module.exports = AddrankLevel;