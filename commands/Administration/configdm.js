const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class ConfigDm extends Command {

    constructor(client) {
        super(client, {
            name: "configdm",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: [],
        });
    };

    async run(message, args, data) {

       if(data.guild.plugins.welcomeDM !== null) {

            // Send message
            message.drake("administration/configdm:DISABLED", {
                emoji: "succes"
            });

            // Update the data
            data.guild.plugins.welcomeDM = null;
            await data.guild.save();

       } else {

            // Create filter
            const filter = (m) => m.author.id === message.author.id;
            const opt = { max: 1, time: 90000, errors: [ "time" ] };
            
            // Send the first instruction
            let msg = await message.channel.send(message.drakeWS("administration/configdm:INSTRUCTION_1", {
                emoji: "write"
            }));

            // Get first response
            let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
            if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                emoji: "succes"
            });
            const confMessage = collected.first().content;
            if(confMessage === "cancel") return message.drake("common:CANCEL", {
                emoji: "succes"
            });
            if(confMessage === data.guild.prefix + "configdm") return;
            collected.first().delete().catch(() => {});

            // Send succes message
            message.channel.send(message.drakeWS("administration/configdm:SUCCES", {
                emoji: "succes"
            })).then(m => m.delete({
                timeout: 3000
            }));

            let simulation = confMessage                    
                .replace("{user}", message.author)
                .replace("{guild.name}", message.guild.name)
                .replace("{guild.members}", message.guild.memberCount)

            // Create embed
            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/configdm:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .addField(message.drakeWS("common:MESSAGE"), confMessage)
            .addField(message.drakeWS("common:SIMULATION"), simulation)
            .setColor("RANDOM")
            .setFooter(this.client.cfg.footer);

            // Send embed and delete instructions
            msg.delete();
            message.channel.send(embed);

            // Update the data
            data.guild.plugins.welcomeDM = confMessage;
            await data.guild.save();
        };
    };
};

module.exports = ConfigDm;