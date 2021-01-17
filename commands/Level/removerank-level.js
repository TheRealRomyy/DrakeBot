const Command = require("../../structure/Commands.js");

class RemoverankLevel extends Command {

    constructor(client) {
        super(client, {
            name: "removerank-level",
            aliases: ["removeranks-level", "rr", "removeranks-xp", "remove-rank-xp"],
            dirname: __dirname,
            enabled: true,
            botPerms: ["EMBED_LINKS"],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: []
        });  
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "removerank-level <level>"
        });
    
        const level = args[0];
    
        if(!data.guild.plugins.levels.rankRewards.find((r) => r.level === level)) return message.drake("level/removerank-level:NO_RANK", {
            level: level,
            emoji: "error"
        });
    
        data.guild.plugins.levels.rankRewards = data.guild.plugins.levels.rankRewards.filter((r) => r.level !== level);
    
        await data.guild.save();
    
        message.drake("level/removerank-level:SUCCES", {
            emoji: "succes",
            level: level,
        });
    };
};

module.exports = RemoverankLevel;