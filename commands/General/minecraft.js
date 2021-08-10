const { MessageEmbed, MessageActionRow, MessageButton, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");
const Command = require("../../structure/Commands.js");
const minecraft = require('minecraft-api');
const MojangAPI = require('mojang-api');
const ms = require("ms");

class Minecraft extends Command {

    constructor(client) {
        super(client, {
            name: "minecraft",
            aliases: ["mc", "mc-account"],
            enabled: true,
            dirname: __dirname,
            botPerms: [],
            userPerms: [],
            restriction: [],

            slashCommandOptions: {
                description: "Show informations about a minecraft account",
                options: [
                    {
                        name: "pseudo",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "Which account ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        const client = this.client;

		// Variables for pages
		let i0 = 0;
		let i1 = 5;
		let page = 1;

        let pseudo = args[0];
        if(!pseudo) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "minecraft <pseudo>"
        });

        let uuid = await minecraft.uuidForName(pseudo);
        if(uuid == null) return message.drake("general/minecraft:NO_UUID_FOUND", {
            emoji: "error"
        });

        MojangAPI.nameHistory(uuid, async function(err, res) {
            if (err) client.emit("error", err)
            else {

                const pseudoCount = res.length;

                if(res.length == 1) {

                    let embed = new MessageEmbed()
                    .setTitle("Minecraft Profile - " + pseudo)
                    .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                    .setColor(client.cfg.color.blue)
                    .setFooter(client.cfg.footer)
                    .setImage(`https://crafatar.com/renders/body/${uuid}?overlay=true`)
                    .setThumbnail(`https://mc-heads.net/avatar/${uuid}`)
                    .setDescription(`**1** • **${res[0].name.replace("_", "\\_")}** \`${message.drakeWS("general/minecraft:ACCOUNT_CREATED")}\`.`)
                    .setTimestamp();

                    return message.channel.send({
                        embeds: [embed]
                    });
                } else {

                    let description = 
                    `Pseudos: ${pseudoCount}\n\n`+
                    res.sort((a,b) => a.changedToAt - b.changedToAt)
                        .map((r, i) => `**${i + 1}** • **${r.name.replace("_", "\\_")}** \`${r.changedToAt ? message.time.printDate(r.changedToAt) : `${message.drakeWS("general/minecraft:ACCOUNT_CREATED")}`}\``)
                        .slice(0, 5)
                        .join("\n \n");

                    const embed = new MessageEmbed()
                        .setAuthor(message.author.username, message.author.displayAvatarURL())
                        .setColor(client.cfg.color.purple)
                        .setTitle(`Minecraft Profile - ${pseudo} \nPage: ${page}/${Math.ceil(pseudoCount/5)}`)
                        .setFooter(client.cfg.footer)
                        .setImage(`https://crafatar.com/renders/body/${uuid}?overlay=true`)
                        .setThumbnail(`https://mc-heads.net/avatar/${uuid}`)
                        .setDescription(description);

                    let nextButton = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('Next ➡️')
                        .setDisabled(false)
                        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NEXT-MINECRAFT`);
            
                    let previousButton = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('Previous ⬅️')
                        .setDisabled(false)
                        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}PREVIOUS-MINECRAFT`);
                
                    let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);
            
                    const msg = await message.channel.send({
                        embeds: [embed],
                        components: [group1]
                    });

                    const filter = (button) => button.user.id === message.author.id && (
                        button.customId === nextButton.customId ||
                        button.customId === previousButton.customId
                    );

                    const collector = msg.createMessageComponentCollector({ 
                        filter, 
                        time: ms("10m"), 
                        errors: ['time'] 
                    });

                    collector.on("collect", async button => {

                        await button.deferUpdate();
            
                        if(button.customId === previousButton.customId) {
            
                            // Security Check
                            if ((i0 - 5) + 1 < 0) return;
            
                            // Update variables
                            i0 -= 5;
                            i1 -= 5;
                            page--;
            
                            // Check of the variables
                            if (!i1) return;
            
                            description = `Pseudos: ${pseudoCount}\n\n` +
                            res.sort((a,b) => a.changedToAt - b.changedToAt)
                                .map((r, i) => `**${i + 1}** • **${r.name.replace("_", "\\_")}** \`${r.changedToAt ? message.time.printDate(r.changedToAt) : `${message.drakeWS("general/minecraft:ACCOUNT_CREATED")}`}\``)
                                .slice(i0, i1)
                                .join("\n \n");
            
                            // Update the embed with new informations
                            embed.setTitle(`Minecraft Profile - ${pseudo} \nPage: ${page}/${Math.ceil(pseudoCount/5)}`)
                                .setDescription(description);
                        
                            // Edit the message 
                            msg.edit({
                                embeds: [embed]
                            }).catch(() => {});;
                        };
            
                        if(button.customId === nextButton.customId) {
            
                            // Security Check
                            if ((i1 + 5) > pseudoCount + 5) return;
            
                            // Update variables
                            i0 += 5;
                            i1 += 5;
                            page++;
            
                            // Check of the variables								
                            if (!i0 || !i1) return;
            
                            description = `Pseudos: ${pseudoCount}\n\n` +
                            res.sort((a,b) => a.changedToAt - b.changedToAt)
                                .map((r, i) => `**${i + 1}** - **${r.name.replace("_", "\\_")}** \`${r.changedToAt ? message.time.printDate(r.changedToAt) : `${message.drakeWS("general/minecraft:ACCOUNT_CREATED")}`}\``)
                                .slice(i0, i1)
                                .join("\n \n");
            
                            // Update the embed with new informations
                            embed.setTitle(`Minecraft Profile - ${pseudo} \nPage: ${page}/${Math.ceil(pseudoCount/5)}`)
                                .setDescription(description);
                        
                            // Edit the message 
                            msg.edit({
                                embeds: [embed]
                            }).catch(() => {});;
                        };
                    });
            
                    collector.on("end", async () => {
                        let nextButton = new MessageButton()
                        .setStyle('SECONDARY')
                        .setLabel('Next ➡️')
                        .setDisabled(true)
                        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NEXT-MINECRAFT`);
                  
                        let previousButton = new MessageButton()
                        .setStyle('SECONDARY')
                        .setLabel('Previous ⬅️')
                        .setDisabled(true)
                        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}PREVIOUS-MINECRAFT`);
                
                        let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);
                
                        msg.edit({
                          components: [group1]
                        }).catch(() => {});;
                    });

                };
            };
        });
    };

    async runInteraction(interaction, data) {

        const client = this.client;

		// Variables for pages
		let i0 = 0;
		let i1 = 5;
		let page = 1;

        let pseudo = interaction.options.getString("pseudo");

        let uuid = await minecraft.uuidForName(pseudo);
        if(uuid == null) return interaction.reply({
            content: interaction.drakeWS("general/minecraft:NO_UUID_FOUND", {
                emoji: "error"
            }),
            ephemeral: true
        });

        MojangAPI.nameHistory(uuid, async function(err, res) {
            if (err) client.emit("error", err)
            else {

                const pseudoCount = res.length;

                if(res.length == 1) {

                    let embed = new MessageEmbed()
                    .setTitle("Minecraft Profile - " + pseudo)
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                    .setColor(client.cfg.color.blue)
                    .setFooter(client.cfg.footer)
                    .setImage(`https://crafatar.com/renders/body/${uuid}?overlay=true`)
                    .setThumbnail(`https://mc-heads.net/avatar/${uuid}`)
                    .setDescription(`**1** • **${res[0].name.replace("_", "\\_")}** \`${interaction.drakeWS("general/minecraft:ACCOUNT_CREATED")}\`.`)
                    .setTimestamp();

                    return interaction.reply({
                        embeds: [embed]
                    });
                } else {

                    let description = 
                    `Pseudos: ${pseudoCount}\n\n`+
                    res.sort((a,b) => a.changedToAt - b.changedToAt)
                        .map((r, i) => `**${i + 1}** • **${r.name.replace("_", "\\_")}** \`${r.changedToAt ? interaction.time.printDate(r.changedToAt) : `${interaction.drakeWS("general/minecraft:ACCOUNT_CREATED")}`}\``)
                        .slice(0, 5)
                        .join("\n \n");

                    const embed = new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
                        .setColor(client.cfg.color.purple)
                        .setTitle(`Minecraft Profile - ${pseudo} \nPage: ${page}/${Math.ceil(pseudoCount/5)}`)
                        .setFooter(client.cfg.footer)
                        .setImage(`https://crafatar.com/renders/body/${uuid}?overlay=true`)
                        .setThumbnail(`https://mc-heads.net/avatar/${uuid}`)
                        .setDescription(description);

                    let nextButton = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('Next ➡️')
                        .setDisabled(false)
                        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NEXT-MINECRAFT`);
            
                    let previousButton = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('Previous ⬅️')
                        .setDisabled(false)
                        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}PREVIOUS-MINECRAFT`);
                
                    let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);
            
                    await interaction.reply({
                        embeds: [embed],
                        components: [group1]
                    });

                    const filter = (button) => button.user.id === interaction.user.id && (
                        button.customId === nextButton.customId ||
                        button.customId === previousButton.customId
                    );

                    const collector = interaction.channel.createMessageComponentCollector({ 
                        filter, 
                        time: ms("10m"), 
                        errors: ['time'] 
                    });

                    collector.on("collect", async button => {

                        await button.deferUpdate();
            
                        if(button.customId === previousButton.customId) {
            
                            // Security Check
                            if ((i0 - 5) + 1 < 0) return;
            
                            // Update variables
                            i0 -= 5;
                            i1 -= 5;
                            page--;
            
                            // Check of the variables
                            if (!i1) return;
            
                            description = `Pseudos: ${pseudoCount}\n\n` +
                            res.sort((a,b) => a.changedToAt - b.changedToAt)
                                .map((r, i) => `**${i + 1}** • **${r.name.replace("_", "\\_")}** \`${r.changedToAt ? interaction.time.printDate(r.changedToAt) : `${interaction.drakeWS("general/minecraft:ACCOUNT_CREATED")}`}\``)
                                .slice(i0, i1)
                                .join("\n \n");
            
                            // Update the embed with new informations
                            embed.setTitle(`Minecraft Profile - ${pseudo} \nPage: ${page}/${Math.ceil(pseudoCount/5)}`)
                                .setDescription(description);
                        
                            // Edit the message 
                            interaction.editReply({
                                embeds: [embed]
                            }).catch(() => {});;
                        };
            
                        if(button.customId === nextButton.customId) {
            
                            // Security Check
                            if ((i1 + 5) > pseudoCount + 5) return;
            
                            // Update variables
                            i0 += 5;
                            i1 += 5;
                            page++;
            
                            // Check of the variables								
                            if (!i0 || !i1) return;
            
                            description = `Pseudos: ${pseudoCount}\n\n` +
                            res.sort((a,b) => a.changedToAt - b.changedToAt)
                                .map((r, i) => `**${i + 1}** - **${r.name.replace("_", "\\_")}** \`${r.changedToAt ? interaction.time.printDate(r.changedToAt) : `${interaction.drakeWS("general/minecraft:ACCOUNT_CREATED")}`}\``)
                                .slice(i0, i1)
                                .join("\n \n");
            
                            // Update the embed with new informations
                            embed.setTitle(`Minecraft Profile - ${pseudo} \nPage: ${page}/${Math.ceil(pseudoCount/5)}`)
                                .setDescription(description);
                        
                            // Edit the message 
                            interaction.editReply({
                                embeds: [embed]
                            }).catch(() => {});;
                        };
                    });
            
                    collector.on("end", async () => {
                        let nextButton = new MessageButton()
                        .setStyle('SECONDARY')
                        .setLabel('Next ➡️')
                        .setDisabled(true)
                        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NEXT-MINECRAFT`);
                  
                        let previousButton = new MessageButton()
                        .setStyle('SECONDARY')
                        .setLabel('Previous ⬅️')
                        .setDisabled(true)
                        .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}PREVIOUS-MINECRAFT`);
                
                        let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);
                
                        interaction.editReply({
                          components: [group1]
                        }).catch(() => {});;
                    });
                };
            };
        });
    };
};

module.exports = Minecraft;