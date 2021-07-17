const Command = require("../../structure/Commands.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");
const ms = require("ms");

class Mute extends Command {

    constructor(client) {
        super(client, {
            name: "mute",
            aliases: [ "tempmute" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_MESSAGES", "MANAGE_CHANNELS", "MANAGE_ROLES" ],
            userPerms: [ "MANAGE_MESSAGES" ],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        // Définir le client
        const client = this.client;

        // Si y'a pas d'args 0
        if(!args[0] && !message.mentions.users.first()) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "ban <user> (reason)",
            emoji: "error"
        });

        // Resolver le member
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // Si ya pas de member
        if(!member) return message.drake("misc:MEMBER_NOT_FOUND", {
            emoji: "error"
        });

        // Si le member c'est le mec qui a run la commande
        if(member.id === message.author.id) return message.drake("misc:YOURSELF", {
            emoji: "error"
        });

        // Chopper la position du member & check si elle est pas supérieure a la tienne + si le member est pas l'owner
        const memberPosition = member.roles.highest.position;
        const moderationPosition = message.member.roles.highest.position;
        if(moderationPosition < memberPosition) return message.drake("misc:SUPERIOR", {
            emoji: "error"
        });

        // Chopper le memberData dans la DB
        const memberData = await this.client.db.findOrCreateMember(member, message.guild);

        // Récupérer le time avec l'args 1
        let time = args[1];

        // Si y a pas de time
        if(!time || isNaN(ms(time))) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "mute <user> <time> (reason)",
            emoji: "error"
        });

        time = ms(time);

        // Chopper la raison avec le message en le découpant de 2
        let reason = args.slice(2).join(" ");

        // Si ya pas la raison
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        // Envoyer un message de confirmation
        let waitMsg = await message.channel.send(message.drakeWS("moderation/mute:CONFIRM", {
            emoji: "question",
            username: member.user.username,
            time: message.time.convertMS(time),
            reason: reason
        }));

        // Définir le filtre du collecteur
        const filter = (button) => button.clicker.user.id === message.author.id;

        // Réagir au message
        let yesButton = new MessageButton()
        .setStyle('green')
        .setLabel('Yes 👍')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}YES-MUTE`);

        let noButton = new MessageButton()
        .setStyle('red')
        .setLabel('No 👎')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}NO-MUTE`);

        let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

        await msg.edit({
            components: [group1]
        }).catch(() => {});

        // Définir le collecteur et ses réactions
        await waitMsg.awaitButtons(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let button = collected.first();
            if(!button) {
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            };
            if(button.id === yesButton.custom_id) { 
                client.functions.mute(member, message, message.author, data.guild, reason, memberData, client, time);
                message.delete().catch(() => {});
                return waitMsg.delete().catch(() => {});
            } else {
                message.drake("common:CANCEL", {
                    emoji: "succes"
                });
                return waitMsg.delete().catch(() => {});
            }
        });
    };  
};

module.exports = Mute;