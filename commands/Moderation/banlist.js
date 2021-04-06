const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

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
            restriction: []
        })
    };

    async run(message, args, data) {

      let client = this.client;
      let banM = (await message.guild.fetchBans()).size;

      if(banM == 0) return message.drake("moderation/banlist:NONE", {
          emoji: "error"
      });

      let i0 = 0;
      let i1 = 10;
      let page = 1;

      let description =
        `Ban members - ${banM}\n\n` +
        (await message.guild.fetchBans())
          .map(u => u)
          .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : message.drakeWS("misc:NO_REASON")}\``)
          .slice(0, 10)
          .join("\n \n");

      let embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setColor(client.cfg.color.yellow)
        .setFooter(client.cfg.footer)
        .setThumbnail(message.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
        .setTitle(`Page - ${page}/${Math.ceil(banM / 10)}`)
        .setDescription(description);

      let msg = await message.channel.send(embed);

      await msg.react("⬅");
      await msg.react("➡");
      await msg.react("❌");

      let collector = msg.createReactionCollector(
        (reaction, user) => user.id === message.author.id
      );

      collector.on("collect", async (reaction, user) => {
        if (reaction._emoji.name === "⬅") {
          i0 = i0 - 10;
          i1 = i1 - 10;
          page = page - 1;

          if (i0 + 1 < 0) {
            console.log(i0)
            return msg.delete();
          }
          if (!i0 || !i1) {
            return msg.delete();
          }

          let description =
          `Ban members - ${banM}\n\n` +
          (await message.guild.fetchBans())
            .map(u => u)
            .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : message.drakeWS("misc:NO_REASON")}\``)
            .slice(i0, i1)
            .join("\n \n");
    

          embed
            .setTitle(`Page - ${page}/${Math.round(banM / 10 + 1)}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setColor(client.cfg.color.yellow)
            .setFooter(client.cfg.footer)
            .setThumbnail(message.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
            .setDescription(description);
          msg.edit(embed);
        }

        if (reaction._emoji.name === "➡") {
          i0 = i0 + 10;
          i1 = i1 + 10;
          page = page + 1;

          if (i1 > banM + 10) {
            return msg.delete();
          }
          if (!i0 || !i1) {
            return msg.delete();
          }

          let description =
          `Ban members - ${banM}\n\n` +
          (await message.guild.fetchBans())
            .map(u => u)
            .map((u, i) => `**${i + 1}** - ${u.user.username} - **${u.user.id}**\nReason: \`${u.reason != null ? u.reason : message.drakeWS("misc:NO_REASON")}\``)
            .slice(i0, i1)
            .join("\n \n");
    

          embed
            .setTitle(`Page - ${page}/${Math.round(banM / 10 + 1)}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setColor(client.cfg.color.yellow)
            .setFooter(client.cfg.footer)
            .setThumbnail(message.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
            .setDescription(description);
          msg.edit(embed);
        }

        if(reaction._emoji.name === "❌") {
          message.delete().catch(() => {});
          return msg.delete();
        }

        await reaction.users.remove(message.author.id);
    });
  };
};

module.exports = Banlist;