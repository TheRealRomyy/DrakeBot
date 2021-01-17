const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Company extends Command {

    constructor(client) {
        super(client, {
            name: "company",
            aliases: [ "cmp", "cp" ],
            dirname: __dirname,
            enabled: false,
            botPerms: [ "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 10,
            restriction: []
        });
    };

    async run(message, args, data) {

        const opt = { max: 1, time: 50000, errors: [ "time" ] };
        let filter = (reaction, user) => {
            return ['💰', '👮', '🛒', '🍴'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        let embed = null;
        let msg = null;
        let reaction = null;
        let collected = null;
        let yesOrNo = null;

        async function WaitForReaction(msg) {

            let reaction = null;
    
            await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
                reaction = collected.first();
                reaction.users.remove(message.author.id).catch(() => {});
            }).catch(collected => {
                message.delete.Catch(() => {});
                msg.edit(message.drakeWS("common:CANCEL", {
                    emoji: "succes"
                })).catch(() => {});
            });
    
            if(reaction == null) return;
            return reaction.emoji.name;
        };

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "company <create/manage/claim>"
        });

        switch(args[0]) {

            case "create":
                let companyType = null;
                let name = args.slice(1).join(" ");
                if(!name) return message.drake("economy/company:NAME_MISSING", {
                    emoji: "error"
                });
    
                if(data.guild.companys.find((comp) => comp.owner === message.author.id)) return message.drake("economy/company:ALREADY_HAVE", {
                    emoji: "error"
                });
    
                if(data.member.money < 15000) return message.drake("economy/company:NOT_ENOUGHT", {
                    emoji: "error",
                    require: "**25 000" + data.guild.symbol + "**"
                });

                const waitEmbed2 = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
                .setColor(this.client.cfg.color.green)
                .setTitle("Domaine de __" + name + "__")
                .setFooter(this.client.cfg.footer)
                .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                    emoji: "waiting"
                }));
    
                embed = new MessageEmbed()
                .setTitle("Domaine de __" + name + "__")
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setColor(this.client.cfg.color.green)
                .setFooter(this.client.cfg.footer)
                .setDescription(message.drakeWS("economy/company:DESC"));
    
                msg = await message.channel.send(waitEmbed2);
    
                await msg.react('💰');
                await msg.react('👮');
                await msg.react('🛒');
                await msg.react('🍴');
                
                await msg.edit(embed);

                reaction = await WaitForReaction(msg);
    
                switch(reaction) {
                    case "💰":
                        companyType = "Bourse";
                        break;
                    case "👮":
                        companyType = "Sécurité";
                        break;
                    case "🛒":
                        companyType = "Grande surface";
                        break;
                    case "🍴":
                        companyType = "Restauration";
                        break;
                    default:
                        return;
                };
    
                let companyInfo = {
                    name: name,
                    type: companyType,
                    owner: message.author.id,
                    members: [],
                    officers: [],
                    createAt: Date.now(),
                };
    
                data.guild.companys.push(companyInfo);
                data.member.money -= 15000;
    
                await data.member.save();
                await data.guild.save();
    
                await msg.delete().catch(() => {});
                return message.drake("economy/company:SUCCES", {
                    emoji: "succes",
                    name: name,
                    type: companyType
                });
            case "manage":
                let company = data.guild.companys.find((comp) => comp.owner === message.author.id);

                if(data.guild.companys.find((comp) => comp.members.includes(message.author.id)) || data.guild.companys.find((comp) => comp.officers.includes(message.author.id))) return message.channel.send(this.client.emotes["error"] + " **Vous devez être `Owner` de votre company pour la gérer.**");
                if(!company) return message.channel.send(this.client.emotes["error"] + " **Vous devez avoir créer une company pour la gérer !**");

                const waitEmbed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
                .setColor(this.client.cfg.color.blue)
                .setTitle(this.client.emotes["label"] + " Gestion de " + company.name)
                .setFooter(this.client.cfg.footer)
                .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                    emoji: "waiting"
                }));

                embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle(this.client.emotes["label"] + " Gestion de " + company.name)
                .setColor(this.client.cfg.color.blue)
                .setThumbnail(message.guild.iconURL({dynamic: true, size: 1024}))
                .setFooter(this.client.cfg.footer)
                .setDescription("🏷️ Changer le nom (**3000" + data.guild.symbol + "**) \n👥 Gérer les membres \n👮 Gérer les officiers \n \n👑 Transférer la propriété \n🗑️ Supprimer la company");

                msg = await message.channel.send(waitEmbed);

                await msg.react('🏷️');
                await msg.react('👥');
                await msg.react('👮');
                await msg.react('👑');
                await msg.react('🗑️');

                await msg.edit(embed);

                filter = (reaction, user) => {
                    return ['🏷️', '👥', '👮', '👑', '🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
                };

                reaction = await WaitForReaction(msg);

                switch(reaction) {
                    case "🏷️":
                        if(data.member.money < 3000) return message.channel.send(this.client.emotes["error"] + " Vous n'avez pas **3000" + data.guild.symbol + "** sur vous !");
                        filter = (m) => m.author.id === message.author.id;

                        let msg3 = await message.channel.send(this.client.emotes["write"] + " **Veuillez marquer le nouveau nom de votre company.**");

                        collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
                        if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        const confMessage = collected.first().content;
                        if(confMessage === "cancel") return message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        collected.first().delete().catch(() => {});
                        msg3.delete().catch(() => {});

                        filter = (reaction, user) => {
                            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
                        };

                        let msg2 = await message.channel.send(this.client.emotes["question"] + " Etes vous sur de vouloir définir le nom de votre company sur **" + confMessage + "** ?");
                        
                        await msg2.react('👍');
                        await msg2.react('👎');
                        
                        yesOrNo = await WaitForReaction(msg2);

                        await msg2.delete().catch(() => {});

                        switch(yesOrNo) {
                            case "👍":
                                if(data.member.money < 3000) return message.channel.send(this.client.emotes["error"] + " vous n'avez pas **3000" + data.guild.symbol + "** sur vous !");

                                company.name = confMessage;
                                data.member.money -= 3000;

                                await data.guild.save();
                                await data.member.save();

                                await msg.delete().catch(() => {});
                                await message.channel.send(this.client.emotes["succes"] + " Votre company s'appelle maintenant **" + confMessage + "** !").catch(() => {});
                                break;
                            case "👎":
                                await msg.delete().catch(() => {});
                                await message.drake("common:CANCEL", {
                                    emoji: "succes"
                                });
                                break;
                            default: 
                                return;
                        };
                        break;
                    case "👥":
                        break;
                    case "👮":
                        break;
                    case "👑":
                        filter = (m) => m.author.id === message.author.id;

                        let msg5 = await message.channel.send(this.client.emotes["write"] + " **Veuillez mentionner le nouveau propriétaire.**");

                        collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
                        if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        const confMessage2 = collected.first();
                        let confMember = confMessage2.mentions.members.first();
                        confMessage2.delete().catch(() => {});
                        msg5.delete().catch(() => {});

                        if(!confMember) {
                            await msg.delete().catch(() => {});
                            return message.channel.send(this.client.emotes["error"] + " **Je ne trouve pas ce membre !**");
                        };

                        if(confMember.user.bot) {
                            await msg.delete().catch(() => {});
                            return message.channel.send(this.client.emotes["error"] + " **Ce membre est un bot !**");
                        }; 

                        if(data.guild.companys.find((comp) => comp.owner === confMember.user.id) !== undefined) {
                            await msg.delete().catch(() => {});
                            return message.channel.send(this.client.emotes["error"] + " **Ce membre posséde déjà une company !**");
                        };

                        filter = (reaction, user) => {
                            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
                        };

                        let msg4 = await message.channel.send(this.client.emotes["question"] + " Etes vous sur de vouloir donner la propriété de la company a **" + confMember.user.username + "** ?");
                        
                        await msg4.react('👍');
                        await msg4.react('👎');
                        
                        yesOrNo = await WaitForReaction(msg4);

                        await msg4.delete().catch(() => {});

                        switch(yesOrNo) {
                            case "👍":
                                company.owner = confMember.user.id;
                                company.members.push(message.author.id);
                                await data.guild.save();

                                await msg.delete().catch(() => {});
                                await message.channel.send(this.client.emotes["succes"] + " **Le nouveau propriétaire de la company est: <@" + confMember + "> !**").catch(() => {});
                                break;
                            case "👎":
                                await msg.delete().catch(() => {});
                                await message.drake("common:CANCEL", {
                                    emoji: "succes"
                                });
                                break;
                            default: 
                                return;
                        };
                        break;
                    case "🗑️":
                        filter = (reaction, user) => {
                            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
                        };

                        let msgDelete = await message.channel.send(this.client.emotes["question"] + " **Etes vous sur de vouloir supprimer votre company ?**");
                        
                        await msgDelete.react('👍');
                        await msgDelete.react('👎');
                        
                        yesOrNo = await WaitForReaction(msgDelete);

                        await msgDelete.delete().catch(() => {});

                        switch(yesOrNo) {
                            case "👍":
                                data.guild.companys = data.guild.companys.filter((comp) => comp.owner !== message.author.id);
                                await data.guild.save();

                                await msg.delete().catch(() => {});
                                await message.channel.send(this.client.emotes["succes"] + " **Votre company a bien été supprimée ** !").catch(() => {});
                                break;
                            case "👎":
                                await msg.delete().catch(() => {});
                                await message.drake("common:CANCEL", {
                                    emoji: "succes"
                                });
                        };
                        break;
                    default:
                        return;
                };
                break;
            case "claim":
                break;
            default:
                return;
        };
    };
};

module.exports = Company;