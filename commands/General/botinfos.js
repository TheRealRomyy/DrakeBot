const Command = require("../../structure/Commands");

const { MessageEmbed, version } = require("discord.js");
const si = require("systeminformation");
const os = require("os");

class Botinfos extends Command {

    constructor(client) {
        super(client, {
            name: "botinfos",
            aliases: [ "botinfo", "about", "bot" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Show informations about DrakeBot"
            }
        });
    };

    async run(message, args, data) {

        const client = this.client;

        let msg = await message.channel.send(client.emotes.waiting);

        let ping = Math.round(client.ws.ping);
        let commandCount = client.cmds.size;
        let classCount = await client.functions.getAllDirFiles("/root/DrakeBot/commands");
        classCount = classCount.length.toString();

        let cpuUsage = null;

        const memory = await si.mem();
        const swapUsed = Math.floor(memory.swapused / 1024 / 1024);
        const swapFree = Math.floor(memory.swapfree / 1024 / 1024);
        const swapTot = Math.floor(swapFree + swapUsed) / 1000;
        const tot = Math.floor(memory.total / 1024 / 1024) / 1000;
        const totalMemory = Math.floor(tot + swapTot);
        const memoryUsed = Math.floor(memory.used / 1024 / 1024);
        let realMemUsed = Math.floor(swapUsed + memoryUsed) / 1000;
        let memPercent = Math.floor(realMemUsed / totalMemory * 100);

        message.channel.sendTyping();

        await si.currentLoad().then(data => cpuUsage = Math.floor(data.currentload_user));

        const uptime = message.time.convertMS(client.uptime);

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/botinfos:TITLE"))
        .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
        .setFooter(client.cfg.footer)
        .addField(message.drakeWS("general/botinfos:NAME", { emoji: "label"} ), `\`\`\`${client.user.username} (#${client.user.discriminator})\`\`\``)
        .addField(message.drakeWS("general/botinfos:ID", { emoji: "id" } ), `\`\`\`${client.user.id}\`\`\``)
        .addField(message.drakeWS("general/botinfos:STATS", { emoji: "stats"} ), `\`\`\`${client.guilds.cache.size} guilds - ${client.users.cache.size} users\`\`\``)
        .addField(message.drakeWS("general/botinfos:UPTIME", { emoji: "hourglass"} ), `\`\`\`${uptime}\`\`\``)
        .addField(message.drakeWS("general/botinfos:COMMANDS", { emoji: "dev"} ), `\`\`\`${commandCount} ${message.drakeWS("common:COMMANDS")} - ${classCount} ${message.drakeWS("common:CATEGORIES")}\`\`\``)
        .addField(message.drakeWS("general/botinfos:RAM", { emoji: "ram"} ), `\`\`\`${realMemUsed} / ${totalMemory} Go (${memPercent}%)\`\`\``)
        .addField(message.drakeWS("general/botinfos:PROCESSOR", { emoji: "computer"} ), `\`\`\`${os.cpus().map(i => `${i.model}`)[0]} (${cpuUsage}%)\`\`\``)
        .addField(message.drakeWS("general/botinfos:VERSIONS", { emoji: "page"} ), `\`\`\`Node.js: ${process.version} - Discord.js: v${version}\`\`\``)
        .addField(message.drakeWS("general/botinfos:PING", { emoji: "ping"} ), `\`\`\`${ping}ms\`\`\``)
        .addField(message.drakeWS("general/botinfos:CREDITS", { emoji: "heart"} ), message.drakeWS("general/botinfos:THANKS") + `\n \n[Inviter](${client.cfg.inviteLink}) • [Support](https://discord.gg/wyjNZSzXHZ)`)
        .setColor("RANDOM")

        msg.delete().catch(() => {});
        message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        await interaction.deferReply();

        const client = this.client;

        let ping = Math.round(client.ws.ping);
        let commandCount = client.cmds.size;
        let classCount = await client.functions.getAllDirFiles("/root/DrakeBot/commands");
        classCount = classCount.length.toString();

        let cpuUsage = null;

        const memory = await si.mem();
        const swapUsed = Math.floor(memory.swapused / 1024 / 1024);
        const swapFree = Math.floor(memory.swapfree / 1024 / 1024);
        const swapTot = Math.floor(swapFree + swapUsed) / 1000;
        const tot = Math.floor(memory.total / 1024 / 1024) / 1000;
        const totalMemory = Math.floor(tot + swapTot);
        const memoryUsed = Math.floor(memory.used / 1024 / 1024);
        let realMemUsed = Math.floor(swapUsed + memoryUsed) / 1000;
        let memPercent = Math.floor(realMemUsed / totalMemory * 100);

        await si.currentLoad().then(data => cpuUsage = Math.floor(data.currentload_user));

        const uptime = interaction.time.convertMS(client.uptime);

        const embed = new MessageEmbed()
        .setTitle(interaction.drakeWS("general/botinfos:TITLE"))
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
        .setFooter(client.cfg.footer)
        .addField(interaction.drakeWS("general/botinfos:NAME", { emoji: "label"} ), `\`\`\`${client.user.username} (#${client.user.discriminator})\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:ID", { emoji: "id" } ), `\`\`\`${client.user.id}\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:STATS", { emoji: "stats"} ), `\`\`\`${client.guilds.cache.size} guilds - ${client.users.cache.size} users\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:UPTIME", { emoji: "hourglass"} ), `\`\`\`${uptime}\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:COMMANDS", { emoji: "dev"} ), `\`\`\`${commandCount} ${interaction.drakeWS("common:COMMANDS")} - ${classCount} ${interaction.drakeWS("common:CATEGORIES")}\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:RAM", { emoji: "ram"} ), `\`\`\`${realMemUsed} / ${totalMemory} Go (${memPercent}%)\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:PROCESSOR", { emoji: "computer"} ), `\`\`\`${os.cpus().map(i => `${i.model}`)[0]} (${cpuUsage}%)\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:VERSIONS", { emoji: "page"} ), `\`\`\`Node.js: ${process.version} - Discord.js: v${version}\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:PING", { emoji: "ping"} ), `\`\`\`${ping}ms\`\`\``)
        .addField(interaction.drakeWS("general/botinfos:CREDITS", { emoji: "heart"} ), interaction.drakeWS("general/botinfos:THANKS") + `\n \n[Inviter](${client.cfg.inviteLink}) • [Support](https://discord.gg/wyjNZSzXHZ)`)
        .setColor("RANDOM")

        await interaction.editReply({
            embeds: [embed]
        });
    };
};

module.exports = Botinfos;