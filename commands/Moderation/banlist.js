const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const ms = require("ms");

class Banlist extends Command {

    constructor(client) {
        super(client, {
            name: "banlist",
            aliases: [ "bans"],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "BAN_MEMBERS" ],
            userPerms: [ "MANAGE_MESSAGES", "BAN_MEMBERS" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
              description: "Get a list of all members banned from this server"
            }
        })
    };

    async run(message, args, data) {

      const client = this.client;
      const filter = (button) => button.user.id === message.author.id;

      await message.delete().catch(() => {});

      // Variables of pages
      let i0 = 0;
      let i1 = 5;
      let page = 1;

      // Shortcuts
      let banM = (await message.guild.bans.fetch()).size;

      if(banM == 0) return message.drake("moderation/banlist:NONE", {
          emoji: "error"
      });

      let description =
        `Ban members - ${banM}\n\n` +
        (await message.guild.bans.fetch())
          .map(u => u)
          .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : message.drakeWS("misc:NO_REASON")}\``)
          .slice(0, 5)
          .join("\n \n");

      let embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setColor(client.cfg.color.yellow)
        .setFooter(client.cfg.footer)
        .setThumbnail(message.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
        .setTitle(`Page - ${page}/${Math.ceil(banM / 5)}`)
        .setDescription(description);

      let nextButton = new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('Next ➡️')
      .setDisabled(false)
      .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NEXT-BANLIST`);

      let previousButton = new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('Previous ⬅️')
      .setDisabled(false)
      .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}PREVIOUS-BANLIST`);

      let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);

      let msg = await message.channel.send({
        embeds: [embed],
        components: [group1]
      }).catch(() => {});;

      const collector = msg.createMessageComponentCollector({ 
        filter, 
        time: ms("10m"), 
        errors: ['time'] 
      });

      collector.on("collect", async button => {

        await button.deferUpdate();

        if (button.customId === previousButton.customId) {

        // Security Check
				if ((i0 - 5) + 1 < 0) return;

				// Update variables
				i0 -= 5;
				i1 -= 5;
				page--;

				// Check of the variables
				if (!i1) return;
          
          let description =
          `Ban members - ${banM}\n\n` +
          (await message.guild.bans.fetch())
            .map(u => u)
            .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : message.drakeWS("misc:NO_REASON")}\``)
            .slice(i0, i1)
            .join("\n \n");
    

          embed
            .setTitle(`Page - ${page}/${Math.round(banM / 5 + 1)}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setColor(client.cfg.color.yellow)
            .setFooter(client.cfg.footer)
            .setThumbnail(message.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
            .setDescription(description);

          msg.edit({
            embeds: [embed]
          }).catch(() => {});
        };

        if (button.customId === nextButton.customId) {

        // Security Check
				if ((i1 + 5) > banM + 5) return;

				// Update variables
				i0 += 5;
				i1 += 5;
				page++;

				// Check of the variables								
				if (!i0 || !i1) return;

          let description =
          `Ban members - ${banM}\n\n` +
          (await message.guild.bans.fetch())
            .map(u => u)
            .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : message.drakeWS("misc:NO_REASON")}\``)
            .slice(i0, i1)
            .join("\n \n");
    

          embed
            .setTitle(`Page - ${page}/${Math.round(banM / 5 + 1)}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setColor(client.cfg.color.yellow)
            .setFooter(client.cfg.footer)
            .setThumbnail(message.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
            .setDescription(description);
          msg.edit({
            embeds: [embed]
          }).catch(() => {});
        };
      });

      collector.on("end", async () => {
        let nextButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('Next ➡️')
        .setDisabled(true)
        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NEXT-BANLIST`);
  
        let previousButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('Previous ⬅️')
        .setDisabled(true)
        .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}NEXT-BANLIST`);

        let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);

        msg.edit({
          components: [group1]
        }).catch(() => {});
    });
  };

  async runInteraction(interaction, data) {

    const client = this.client;

    // Variables of pages
    let i0 = 0;
    let i1 = 5;
    let page = 1;

    // Shortcuts
    let banM = (await interaction.guild.bans.fetch()).size;

    if(banM == 0) return interaction.reply({
      content: interaction.drakeWS("moderation/banlist:NONE", {
        emoji: "error"
      }),
      ephemeral: true
    });

    let description =
      `Ban members - ${banM}\n\n` +
      (await interaction.guild.bans.fetch())
        .map(u => u)
        .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : interaction.drakeWS("misc:NO_REASON")}\``)
        .slice(0, 5)
        .join("\n \n");

    let embed = new MessageEmbed()
      .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
      .setColor(client.cfg.color.yellow)
      .setFooter(client.cfg.footer)
      .setThumbnail(interaction.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
      .setTitle(`Page - ${page}/${Math.ceil(banM / 5)}`)
      .setDescription(description);

    let nextButton = new MessageButton()
    .setStyle('PRIMARY')
    .setLabel('Next ➡️')
    .setDisabled(false)
    .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NEXT-BANLIST`);

    let previousButton = new MessageButton()
    .setStyle('PRIMARY')
    .setLabel('Previous ⬅️')
    .setDisabled(false)
    .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}PREVIOUS-BANLIST`);

    const filter = (button) => button.user.id === interaction.user.id && (
      button.customId === nextButton.customId ||
      button.customId === previousButton.customId
    );

    let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);

    let msg = await interaction.reply({
      embeds: [embed],
      components: [group1]
    }).catch(() => {});;

    const collector = interaction.channel.createMessageComponentCollector({ 
      filter, 
      time: ms("10m"), 
      errors: ['time'] 
    });

    collector.on("collect", async button => {

      await button.deferUpdate();

      if (button.customId === previousButton.customId) {

      // Security Check
      if ((i0 - 5) + 1 < 0) return;

      // Update variables
      i0 -= 5;
      i1 -= 5;
      page--;

      // Check of the variables
      if (!i1) return;
        
        let description =
        `Ban members - ${banM}\n\n` +
        (await interaction.guild.bans.fetch())
          .map(u => u)
          .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : interaction.drakeWS("misc:NO_REASON")}\``)
          .slice(i0, i1)
          .join("\n \n");
  

        embed
          .setTitle(`Page - ${page}/${Math.round(banM / 5 + 1)}`)
          .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
          .setColor(client.cfg.color.yellow)
          .setFooter(client.cfg.footer)
          .setThumbnail(interaction.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
          .setDescription(description);

        interaction.editReply({
          embeds: [embed]
        }).catch(() => {});
      };

      if (button.customId === nextButton.customId) {

      // Security Check
      if ((i1 + 5) > banM + 5) return;

      // Update variables
      i0 += 5;
      i1 += 5;
      page++;

      // Check of the variables								
      if (!i0 || !i1) return;

        let description =
        `Ban members - ${banM}\n\n` +
        (await interaction.guild.bans.fetch())
          .map(u => u)
          .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : interaction.drakeWS("misc:NO_REASON")}\``)
          .slice(i0, i1)
          .join("\n \n");
  

        embed
          .setTitle(`Page - ${page}/${Math.round(banM / 5 + 1)}`)
          .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
          .setColor(client.cfg.color.yellow)
          .setFooter(client.cfg.footer)
          .setThumbnail(interaction.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
          .setDescription(description);
        interaction.editReply({
          embeds: [embed]
        }).catch(() => {});
      };
    });

    collector.on("end", async () => {
      let nextButton = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('Next ➡️')
      .setDisabled(true)
      .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NEXT-BANLIST`);

      let previousButton = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('Previous ⬅️')
      .setDisabled(true)
      .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}NEXT-BANLIST`);

      let group1 = new MessageActionRow().addComponents([ previousButton, nextButton ]);

      interaction.editReply({
        components: [group1]
      }).catch(() => {});
  });
};
};

module.exports = Banlist;