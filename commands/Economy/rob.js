const Command = require("../../structure/Commands");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Rob extends Command {

    constructor(client) {
        super(client, {
            name: "rob",
            aliases: [ "robery" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 0,
            restriction: [],

            slashCommandOptions: {
                description: "Rob a member in order to gain money",
                options: [
                    {
                        name: "member",
                        type: ApplicationCommandOptionTypes.USER,
                        required: true,
                        description: "Wich member ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if(!member) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "rob <member>"
        });

        let toWait = 0;

        const isInCooldown = data.member.cooldowns.rob;
        if(isInCooldown && isInCooldown > Date.now()) return message.drake("economy/rob:COOLDOWN", {
            time: message.time.convertMS(isInCooldown - Date.now()),
            emoji: "error"
        });

        if(member.user.bot) return message.drake("economy/rob:BOT", {
            emoji: "error",
            bot: member.user.username
        });

        if(member.id === message.author.id) return message.drake("economy/rob:YOURSELF", {
            emoji: "error"
        });

        let number = this.client.functions.getRandomInt(100, 140);
        let numberStr = number.toString();

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);

        if(memberData.money === 0) return message.drake("economy/rob:NOT_MONEY", {
            emoji: "error",
            username: member.user.username,
            symbol: data.guild.symbol
        });

        if(number < 120 || number > 130) {
            toWait = Date.now() + 3600000;
            message.drake("economy/rob:JAIL", {
                time: message.time.convertMS(toWait - Date.now()),
                emoji: "jail"
            });
            data.member.cooldowns.rob = toWait;
            await data.member.save(data.member);
            return;
        };

        if(memberData.money < number && memberData.money !== 0) {
            number = memberData.money;
            numberStr = number.toString();
        };

        const robMsg = message.drakeWS("economy/rob:ROB", {
            symbol: data.guild.symbol,
            amount: numberStr,
            username: member.user.username
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setColor(this.client.cfg.color.green)
        .setFooter(this.client.cfg.footer)
        .setDescription(robMsg);

        message.channel.send({
            embeds: [embed]
        });

        toWait = Date.now() + 120000;
        data.member.cooldowns.rob = toWait;
        data.member.money += number;
        memberData.money -= number;

        await data.member.save(data.member);
        await memberData.save(memberData);
    };

    async runInteraction(interaction, data) {

        const member = interaction.options.getUser("member") ? interaction.guild.members.cache.get(interaction.options.getUser("member").id) : null;

        if(!member) return interaction.reply({
            content: interaction.drakeWS("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "rob <member>"
            }),
            ephemeral: true
        });

        let toWait = 0;

        const isInCooldown = data.member.cooldowns.rob;
        if(isInCooldown && isInCooldown > Date.now()) return interaction.reply({
            content: interaction.drakeWS("economy/rob:COOLDOWN", {
                time: interaction.time.convertMS(isInCooldown - Date.now()),
                emoji: "error"
            }),
            ephemeral: true
        });

        if(member.user.bot) return interaction.reply({
            content: interaction.drakeWS("economy/rob:BOT", {
                emoji: "error",
                bot: member.user.username
            }),
            ephemeral: true
        });

        if(member.id === interaction.user.id) return interaction.reply({
            content: interaction.drakeWS("economy/rob:YOURSELF", {
                emoji: "error"
            }),
            ephemeral: true
        });

        let number = this.client.functions.getRandomInt(100, 140);
        let numberStr = number.toString();

        const memberData = await this.client.db.findOrCreateMember(member.id, interaction.guild);

        if(memberData.money === 0) return interaction.reply({
            content: interaction.drakeWS("economy/rob:NOT_MONEY", {
                emoji: "error",
                username: member.user.username,
                symbol: data.guild.symbol
            }),
            ephemeral: true
        });

        if(number < 120 || number > 130) {
            toWait = Date.now() + 3600000;

            interaction.reply({
                content: interaction.drakeWS("economy/rob:JAIL", {
                    time: interaction.time.convertMS(toWait - Date.now()),
                    emoji: "jail"
                })
            });

            data.member.cooldowns.rob = toWait;
            await data.member.save(data.member);
            return;
        };

        if(memberData.money < number && memberData.money !== 0) {
            number = memberData.money;
            numberStr = number.toString();
        };

        const robMsg = interaction.drakeWS("economy/rob:ROB", {
            symbol: data.guild.symbol,
            amount: numberStr,
            username: member.user.username
        });

        const embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
        .setColor(this.client.cfg.color.green)
        .setFooter(this.client.cfg.footer)
        .setDescription(robMsg);

        interaction.reply({
            embeds: [embed]
        });

        toWait = Date.now() + 120000;
        data.member.cooldowns.rob = toWait;
        data.member.money += number;
        memberData.money -= number;
        
        await data.member.save(data.member);
        await memberData.save(memberData);
    };
};

module.exports = Rob;