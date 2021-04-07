const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");
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

        // Resolver le member
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // Si ya pas de member
        if(!member) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "mute <user> <time> (reason)",
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
        const time = args[1];

        // Si y a pas de time
        if(!time || isNaN(ms(time))) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "mute <user> <time> (reason)",
            emoji: "error"
        });

        // Chopper la raison avec le message en le découpant de 2
        let reason = args.slice(2).join(" ");

        // Si ya pas la raison
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        async function mute() {

            // Récupérer le role mute
            let muteRole = message.guild.roles.cache.find(r => r.name === 'Drake - Mute');

            if(!muteRole) {
                muteRole = await message.guild.roles.create({
                    data: {
                        name: 'Drake - Mute',
                        color: '#000',
                        permissions: []
                    }
                });
        
                message.guild.channels.cache.forEach(async (channel, id) => {
                    await channel.updateOverwrite(muteRole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        CONNECT: false
                    });
                });
            };

            // Ajouter le rôle au gars qu'on veut mute
            await member.roles.add(muteRole);

            // Envoyer un message au member qui c'est fait mute
            member.send(message.drakeWS("moderation/mute:MUTE_DM", {
                emoji: "mute",
                username: member.user.username,
                server: message.guild.name,
                moderator: message.author.tag,
                time: time,
                reason: reason,
            }));

            // Envoyer un message dans le salon comme quoi un mec c'est fait mute
            client.functions.sendSanctionMessage(message, "mute", member.user, reason, time)

            // Ajouter +1 au case
            data.guild.cases++;

            // Modifier l'info de la case
            const caseInfo = {
                moderator: message.author.id,
                date: Date.now(),
                type: "mute",
                case: data.guild.cases,
                reason: reason,
                time: time,
            };

            // Update le memberData
            memberData.mute.muted = true;
            memberData.mute.endDate = Date.now() + ms(time);
            memberData.mute.case = data.guild.cases;
            memberData.sanctions.push(caseInfo);

            if(data.guild.plugins.logs.mod) client.functions.sendModLog("mute", member.user, client.channels.cache.get(data.guild.plugins.logs.mod), message.author, data.guild.cases, reason, time);

            await client.mutedUsers.set(`${member.id}${message.guild.id}`, memberData);
            
            await memberData.save();
            await data.guild.save();
        };

        // Envoyer un message de confirmation
        let waitMsg = await message.channel.send(message.drakeWS("moderation/mute:CONFIRM", {
            emoji: "question",
            username: member.user.username,
            time: time,
            reason: reason
        }));

        // Définir le filtre du collecteur
        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        // Réagir au message
        await waitMsg.react('👍');
        await waitMsg.react('👎');

        // Définir le collecteur et ses réactions
        await waitMsg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let reaction = collected.first();
            let reactionName = reaction.emoji.name;
            if(reactionName == '👍') { 
                mute();
                message.delete().catch(() => {});
                return waitMsg.delete().catch(() => {});
            } else {
                message.drake("common:CANCEL", {
                    emoji: "succes"
                });
                return waitMsg.delete().catch(() => {});
            }
        }).catch(collected => {
            waitMsg.delete().catch(() => {});
            return message.delete().catch(() => {});
        });
    };  
};

module.exports = Mute;