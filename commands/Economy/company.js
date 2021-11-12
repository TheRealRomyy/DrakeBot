const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageButton, MessageActionRow, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");
const ms = require("ms");

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
            restriction: [],

            slashCommandOptions: {
                description: "🏭 Manage your company",
                options: [
                    {
                        name: "action",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "What do you want to do ?",
                        choices: [
                            {
                                name: "➕ Create",
                                value: "create"
                            },
                            {
                                name: "⚙️ Manage",
                                value: "manage"
                            },
                            {
                                name: "💰 Claim",
                                value: "claim"
                            }
                        ]
                    },
                ]
            }
        });
    };

    async run(message, args, data) {
        return message.channel.send("You can't use this command with \"normal\" command. Please use slash command.")
    }

    async runInteraction(interaction, args, data) {

        const client = this.client;
        const textFilter = (m) => m.author.id === interaction.user.id;

        const opt = { max: 1, time: 50000, errors: [ "time" ] };

        switch(interaction.options.getString("action")) {

            case "create":
                let companyType = null;
                let name = args.slice(1).join(" ");
                if(!name) return interaction.reply({
                    content: interaction.drakeWS("economy/company:NAME_MISSING", {
                        emoji: "error"
                    }),
                    ephemeral: true
                });
    
                if(data.guild.companys.find((comp) => comp.owner === interaction.user.id)) return interaction.reply({
                    content: interaction.drakeWS("economy/company:ALREADY_HAVE", {
                        emoji: "error"
                    }),
                    ephemeral: true
                });
    
                if(data.member.money < 15000) return interaction.reply({
                    content: interaction.drakeWS("economy/company:NOT_ENOUGHT", {
                        emoji: "error",
                        require: "**25 000" + data.guild.symbol + "**"
                    }),
                    ephemeral: true
                });
    
                const embed = new MessageEmbed()
                .setTitle("Domaine de __" + name + "__")
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                .setColor(this.client.cfg.color.green)
                .setFooter(this.client.cfg.footer)
                .setDescription(interaction.drakeWS("economy/company:DESC"));

                const economyButton = new MessageButton()
                .setStyle('PRIMARY')
                .setLabel('Economy 💰')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}ECONOMY`);

                const securityButton = new MessageButton()
                .setStyle('PRIMARY')
                .setLabel('Security 👮')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}SECURITY`);

                const shopButton = new MessageButton()
                .setStyle('PRIMARY')
                .setLabel('Shopping 🛒')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}SHOPPING`);

                const foodButton = new MessageButton()
                .setStyle('PRIMARY')
                .setLabel('Food 🍴')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}FOOD`);
                
                let group1 = new MessageActionRow().addComponents([ economyButton, securityButton, shopButton, foodButton ]);
                
                await interaction.reply({
                    embeds: [embed],
                    components: [group1]
                }).then(async () => {

                    let filter = (button) => button.user.id === interaction.user.id && (
                        button.customId === economyButton.customId ||
                        button.customId === securityButton.customId ||
                        button.customId === shopButton.customId ||
                        button.customId === foodButton.customId
                    );

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        time: ms("10m"),
                        max: 1
                    });

                    collector.on("collect", async b => {

                        await b.deferUpdate();

                        switch(b.customId) {
                            case economyButton.customId:
                                companyType = "Bourse";
                                break;
                            case securityButton.customId:
                                companyType = "Sécurité";
                                break;
                            case shopButton.customId:
                                companyType = "Grande surface";
                                break;
                            case foodButton.customId:
                                companyType = "Restauration";
                                break;
                            default:
                                return;
                        }

                        let companyInfo = {
                            name: name,
                            type: companyType,
                            owner: interaction.user.id,
                            members: [],
                            officers: [],
                            createAt: Date.now(),
                        };
            
                        data.guild.companys.push(companyInfo);
                        data.member.money -= 15000;
            
                        await data.member.save(data.member);
                        await data.guild.save(data.guild);
            
                        return interaction.reply({
                            content: interaction.drakeWS("economy/company:SUCCES", {
                                emoji: "succes",
                                name: name,
                                type: companyType
                            })
                        });
                    })

                    collector.on("end", async (collected, reason) => {
                        if(reason === "time") interaction.deleteReply();
                    })
                })
                break;
            case "manage":
                let company = data.guild.companys.find((comp) => comp.owner === interaction.user.id);

                if(data.guild.companys.find((comp) => comp.members.includes(interaction.user.id)) || data.guild.companys.find((comp) => comp.officers.includes(interaction.user.id))) return message.channel.send(this.client.emotes["error"] + " **Vous devez être `Owner` de votre company pour la gérer.**");
                if(!company) return interaction.reply({
                    content: this.client.emotes["error"] + " **Vous devez avoir créer une company pour la gérer !**",
                    ephemeral: true
                });
                
                const embedManage = new MessageEmbed()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                .setTitle(this.client.emotes["label"] + " Gestion de " + company.name)
                .setColor(this.client.cfg.color.blue)
                .setThumbnail(interaction.guild.iconURL({dynamic: true, size: 1024}))
                .setFooter(this.client.cfg.footer)
                .setDescription("🏷️ Changer le nom (**3000" + data.guild.symbol + "**) \n👥 Gérer les membres \n👮 Gérer les officiers \n \n👑 Transférer la propriété \n🗑️ Supprimer la company");

                const changeNameButton = new MessageButton()
                .setStyle('SECONDARY')
                .setLabel('Change name 🏷️')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}CHANGENAME`);

                const manageMembersButton = new MessageButton()
                .setStyle('PRIMARY')
                .setLabel('Manage members 👥')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}MANAGEMEMBERS`);

                const manageOfficersButton = new MessageButton()
                .setStyle('PRIMARY')
                .setLabel('Manage officers 👮')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}MANAGEOFFICERS`);

                const transferOwnershipButton = new MessageButton()
                .setStyle('DANGER')
                .setLabel('Transfer ownership 👑')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}TRANSFEROWNERSHIP`);

                const deleteButton = new MessageButton()
                .setStyle('DANGER')
                .setLabel('Delete company 🗑️')
                .setDisabled(false)
                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}DELETE`);

                let group2 = new MessageActionRow().addComponents([ changeNameButton, manageMembersButton, manageOfficersButton, transferOwnershipButton, deleteButton ]);

                msg = await interaction.reply({
                    embeds: [embedManage],
                    components: [group2]
                }).then(async () => {

                    let filter = (button) => button.user.id === interaction.user.id && (
                        button.customId === changeNameButton.customId ||
                        button.customId === manageOfficersButton.customId ||
                        button.customId === manageMembersButton.customId ||
                        button.customId === transferOwnershipButton.customId ||
                        button.customId === deleteButton.customId
                    );

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        time: ms("10m"),
                        max: 1
                    });

                    collector.on("collect", async b => {

                        await b.deferUpdate();

                        switch(b.customId) {
                            case changeNameButton.customId:
                                if(data.member.money < 3000) return interaction.editReply({
                                    content: this.client.emotes["error"] + " Vous n'avez pas **3000" + data.guild.symbol + "** sur vous !",
                                    ephemeral: true
                                });

                                await interaction.editReply({
                                    content: this.client.emotes["write"] + " **Veuillez marquer le nouveau nom de votre company.**",
                                    components: []
                                });
        
                                collected = await interaction.channel.awaitMessages(textFilter, opt).catch(() => {});
                                if(!collected || !collected.first()) return;

                                const confMessage = collected.first().content;
                                if(confMessage === "cancel") return;

                                collected.first().delete().catch(() => {});
                                
                                const yesButton = new MessageButton()
                                .setStyle('SUCCESS')
                                .setLabel('Yes 👍')
                                .setDisabled(false)
                                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}YES`);

                                const noButton = new MessageButton()
                                .setStyle('DANGER')
                                .setLabel('No 👎')
                                .setDisabled(false)
                                .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NO`);

                                let group3 = new MessageActionRow().addComponents([ yesButton, noButton]);

                                await interaction.editReply({
                                    content: this.client.emotes["question"] + " Etes vous sur de vouloir définir le nom de votre company sur **" + confMessage + "** ?",
                                    components: [group3]
                                }).then(async () => {
                                    let filterm1 = (button) => button.user.id === interaction.user.id && (
                                        button.customId === yesButton.customId ||
                                        button.customId === noButton.customId
                                    );
                
                                    const collector = interaction.channel.createMessageComponentCollector({
                                        filterm1,
                                        time: ms("10m"),
                                        max: 1
                                    });
                
                                    collector.on("collect", async b1 => {
                
                                        await b1.deferUpdate();

                                        switch(b1.customId) {
                                            case yesButton.customId:
                                                if(data.member.money < 3000) return interaction.editReply({
                                                    content: this.client.emotes["error"] + " Vous n'avez pas **3000" + data.guild.symbol + "** sur vous !",
                                                    ephemeral: true
                                                });
                
                                                company.name = confMessage;
                                                data.member.money -= 3000;
                
                                                await data.guild.save(data.guild);
                                                await data.member.save(data.member);
                
                                                await interaction.editReply({
                                                    content: this.client.emotes["succes"] + " Votre company s'appelle maintenant **" + confMessage + "** !"
                                                });
                                                break;
                                            case noButton.customId:
                                                await interaction.reply({
                                                    content: interaction.drakeWS("common:CANCEL", {
                                                        emoji: "succes"
                                                    }),
                                                    ephemeral: true
                                                });
                                                break;
                                            default: 
                                                return;
                                        };
                                    });
                                });
                                break;
                            case manageMembersButton.customId:
                                break;
                            case manageOfficersButton.customId:
                                break;
                            case transferOwnershipButton.customId:
                                filter = (m) => m.author.id === interaction.user.id;
        
                                await interaction.reply({
                                    content: this.client.emotes["write"] + " **Veuillez mentionner le nouveau propriétaire.**"
                                });
        
                                collected = await interaction.channel.awaitMessages(filter, opt).catch(() => {});
                                if(!collected || !collected.first()) return;

                                const confMessage2 = collected.first();
                                let confMember = confMessage2.mentions.members.first();
                                confMessage2.delete().catch(() => {});
        
                                if(!confMember) return interaction.reply({
                                    content: this.client.emotes["error"] + " **Je ne trouve pas ce membre !**",
                                    ephemeral: true
                                });
                                
        
                                if(confMember.user.bot) return interaction.reply({
                                    content: this.client.emotes["error"] + " **Ce membre est un robot !**",
                                    ephemeral: true
                                });
                        
        
                                if(data.guild.companys.find((comp) => comp.owner === confMember.user.id) !== undefined) return interaction.reply({
                                    content: this.client.emotes["error"] + " **Ce membre posséde déjà une company !**",
                                    ephemeral: true
                                });
                
        
                                filter = (reaction, user) => {
                                    return ['👍', '👎'].includes(reaction.emoji.name) && user.id === interaction.user.id;
                                };
        
                                await interaction.editReply({
                                    content: this.client.emotes["question"] + " Etes vous sur de vouloir donner la propriété de la company a **" + confMember.user.username + "** ?"
                                });
                                
                                await msg4.react('👍');
                                await msg4.react('👎');
                                
                                yesOrNo = await WaitForReaction(msg4);
        
                                await msg4.delete().catch(() => {});
        
                                switch(yesOrNo) {
                                    case "👍":
                                        company.owner = confMember.user.id;
                                        company.members.push(interaction.user.id);
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
                            case deleteButton.customId:
                                filter = (reaction, user) => {
                                    return ['👍', '👎'].includes(reaction.emoji.name) && user.id === interaction.user.id;
                                };
        
                                let msgDelete = await message.channel.send(this.client.emotes["question"] + " **Etes vous sur de vouloir supprimer votre company ?**");
                                
                                await msgDelete.react('👍');
                                await msgDelete.react('👎');
                                
                                yesOrNo = await WaitForReaction(msgDelete);
        
                                await msgDelete.delete().catch(() => {});
        
                                switch(yesOrNo) {
                                    case "👍":
                                        data.guild.companys = data.guild.companys.filter((comp) => comp.owner !== interaction.user.id);
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
                    })

                    collector.on("end", async () => {
                        const economyButton = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('Economy 💰')
                        .setDisabled(true)
                        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}ECONOMY`);

                        const securityButton = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('Security 👮')
                        .setDisabled(true)
                        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}SECURITY`);

                        const shopButton = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('Shopping 🛒')
                        .setDisabled(true)
                        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}SHOPPING`);

                        const foodButton = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('Food 🍴')
                        .setDisabled(true)
                        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}FOOD`);
                        
                        let group2 = new MessageActionRow().addComponents([ economyButton, securityButton, shopButton, foodButton ]);

                        interaction.edit({
                            components: [group2]
                        });
                    })
                })
                break;
            case "claim":
                break;
            default:
                return;
        };
    };
};

module.exports = Company;