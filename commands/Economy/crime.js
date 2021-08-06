const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Crime extends Command {

    constructor(client) {
        super(client, {
            name: "crime",
            aliases: [ "crim" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 0,
            restriction: [],

            slashCommandOptions: {
                description: "Make a crime in order to gain money"
            }
        });
    };

    async run(message, args, data) {

        let toWait = 0;

        const isInCooldown = data.member.cooldowns.crime;
        if(isInCooldown && isInCooldown > Date.now()) return message.drake("economy/crime:COOLDOWN", {
            time: message.time.convertMS(isInCooldown - Date.now()),
            emoji: "error"
        });

        const number = this.client.functions.getRandomInt(100, 130);

        if(number < 120 || number > 130) {
            toWait = Date.now() + 3600000;
            message.drake("economy/crime:JAIL", {
                time: message.time.convertMS(toWait - Date.now()),
                emoji: "jail"
            });
            data.member.cooldowns.crime = toWait;
            await data.member.save(data.member);
            return;
        };

        const crimeMsg = message.drakeWS("economy/crime:" + number, {
            symbol: data.guild.symbol
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setColor(this.client.cfg.color.red)
        .setFooter(this.client.cfg.footer)
        .setDescription(crimeMsg);

        await message.channel.send({
            embeds: [embed]
        });

        toWait = Date.now() + 1200000;
        data.member.cooldowns.crime = toWait;
        data.member.money += number;
        await data.member.save(data.member);
    };

    async runInteraction(interaction, data) {

        let toWait = 0;

        const isInCooldown = data.member.cooldowns.crime;
        if(isInCooldown && isInCooldown > Date.now()) return interaction.reply({
            content: interaction.drakeWS("economy/crime:COOLDOWN", {
                time: interaction.time.convertMS(isInCooldown - Date.now()),
                emoji: "error"
            }),
            ephemeral: true
        });

        const number = this.client.functions.getRandomInt(100, 130);

        if(number < 120 || number > 130) {
            toWait = Date.now() + 3600000;

            interaction.reply({
                content: interaction.drakeWS("economy/crime:JAIL", {
                    time: interaction.time.convertMS(toWait - Date.now()),
                    emoji: "jail"
                })
            });

            data.member.cooldowns.crime = toWait;
            await data.member.save(data.member);
            return;
        };

        const crimeMsg = interaction.drakeWS("economy/crime:" + number, {
            symbol: data.guild.symbol
        });

        const embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
        .setColor(this.client.cfg.color.red)
        .setFooter(this.client.cfg.footer)
        .setDescription(crimeMsg);

        await interaction.reply({
            embeds: [embed]
        });

        toWait = Date.now() + 1200000;
        data.member.cooldowns.crime = toWait;
        data.member.money += number;
        await data.member.save(data.member);
    };
};

module.exports = Crime;