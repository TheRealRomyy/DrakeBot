const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");
const ms = require("ms");

class AutoSanctions extends Command {

    constructor(client) {
        super(client, {
            name: "auto-sanctions",
            aliases: ["autosanctions", "set-warns", "setwarns"],
            enabled: true,
            dirname: __dirname,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            restriction: []
        });
    };

    async run(message, args, data) {

        let client = this.client;
        const localButtonsID = {};

        let msg = null;

        const enabled = message.drakeWS("administration/automod:ENABLED");
        const disabled = message.drakeWS("administration/automod:DISABLED");

        if(!data.guild.plugins.autosanctions) data.guild.plugins.autosanctions = {
            mute: {
                enabled: false,
                count: null,
                in: null,
                muteTime: null
            },
            ban: {
                enabled: false,
                count: null,
                in: null,
            },
            kick: {
                enabled: false,
                count: null,
                in: null,
            }
        };

        let filter = (button) => button.clicker.user.id === message.author.id;
        const opt = { max: 1, time: 90000, errors: [ "time" ] };

        async function waitForButton() {

            let button = null;
    
            await msg.awaitButtons(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                button = collected.first();
                if(!button) return cancel();
                button.defer();
            });

            await changeButtonStatus("non-dispo");
    
            if(button == null) return;
            return button;
        };

        async function wait() {

            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/auto-sanctions:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                emoji: "waiting"
            }));
    
            msg = await message.channel.send(embed);
        };

        async function displayMain() {

            let isAutoMuteEnabled = data.guild.plugins.autosanctions.mute.enabled;
            let isAutoKickEnabled = data.guild.plugins.autosanctions.kick.enabled;
            let isAutoBanEnabled = data.guild.plugins.autosanctions.ban.enabled;

            let embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/auto-sanctions:TITLE"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/auto-sanctions:DESC"))
            .addField(message.drakeWS("administration/auto-sanctions:MUTE"), isAutoMuteEnabled ? `**${message.drakeWS("administration/auto-sanctions:MUTE_TIME")}** \`${message.time.convertMS(data.guild.plugins.autosanctions.mute.muteTime)}\`\n**${message.drakeWS("administration/auto-sanctions:COUNT")}** \`${data.guild.plugins.autosanctions.mute.count}\`\n**${message.drakeWS("administration/auto-sanctions:IN")}** \`${message.time.convertMS(data.guild.plugins.autosanctions.mute.in)}\`` : disabled)
            .addField(message.drakeWS("administration/auto-sanctions:KICK"), isAutoKickEnabled ? `**${message.drakeWS("administration/auto-sanctions:COUNT")}** \`${data.guild.plugins.autosanctions.kick.count}\`\n**${message.drakeWS("administration/auto-sanctions:IN")}** \`${message.time.convertMS(data.guild.plugins.autosanctions.kick.in)}\`` : disabled)
            .addField(message.drakeWS("administration/auto-sanctions:BAN"), isAutoBanEnabled ? `**${message.drakeWS("administration/auto-sanctions:COUNT")}** \`${data.guild.plugins.autosanctions.ban.count}\`\n**${message.drakeWS("administration/auto-sanctions:IN")}** \`${message.time.convertMS(data.guild.plugins.autosanctions.ban.in)}\`` : disabled)
    
            return msg.edit(embed);
        };

        async function changeButtonStatus(status) {

            let makeButtonAvailable = Boolean(status === "dispo");

            let muteButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Mute 🔇')
            .setID(localButtonsID["muteButton"]);

            let kickButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'green' : 'gray')
            .setLabel('Kick 🚪')
            .setID(localButtonsID["kickButton"]);

            let banButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'red' : 'gray')
            .setLabel('Ban 🔨')
            .setID(localButtonsID["banButton"]);

            if(!makeButtonAvailable) {
                muteButton.setDisabled(true);
                kickButton.setDisabled(true);
                banButton.setDisabled(true);
            };

            let group1 = new MessageActionRow().addComponents([ muteButton, kickButton, banButton ]);

            await msg.edit({
                components: [group1]
            }).catch(() => {});
        };

        async function start() {

            await wait()
    
            filter = (button) => button.clicker.user.id === message.author.id;

            let muteButton = new MessageButton()
            .setStyle('blurple')
            .setLabel('Mute 🔇')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}MUTE-BUTTON`);

            let kickButton = new MessageButton()
            .setStyle('green')
            .setLabel('Kick 🚪')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}KICK-BUTTON`);

            let banButton = new MessageButton()
            .setStyle('red')
            .setLabel('Ban 🔨')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}BAN-BUTTON`);

            localButtonsID["muteButton"] = muteButton.custom_id;
            localButtonsID["kickButton"] = kickButton.custom_id;
            localButtonsID["banButton"] = banButton.custom_id;

            msg = await displayMain();

            let group1 = new MessageActionRow().addComponents([ muteButton, kickButton, banButton ]);

            await msg.edit({
                components: [group1]
            }).catch(() => {});
    
            const r = await waitForButton();
            await switchCTV(r);
        };


        async function after() {
            await changeButtonStatus("dispo");
            const r = await waitForButton();
            await switchCTV(r);
        };

        async function switchCTV(ctv) {
            if(!ctv) return;
            switch(ctv.id) {
                
                case localButtonsID["muteButton"]:
                    let isAutoMuteEnabled = data.guild.plugins.autosanctions.mute.enabled;
                    if(!isAutoMuteEnabled) await manage("mute");
                    else data.guild.plugins.autosanctions.mute = {
                        enabled: false,
                        muteTime: null,
                        count: null,
                        in: null
                    };
                    await data.guild.save();
                    await displayMain("mute");
                    await after();
                    break;
                case localButtonsID["kickButton"]:
                    let isAutoKickEnabled = data.guild.plugins.autosanctions.kick.enabled;
                    if(!isAutoKickEnabled) await manage("kick");
                    else data.guild.plugins.autosanctions.kick = {
                        enabled: false,
                        count: null,
                        in: null
                    };
                    await data.guild.save();
                    await displayMain("kick");
                    await after();
                    break;
                case localButtonsID["banButton"]:
                    let isAutoBanEnabled = data.guild.plugins.autosanctions.ban.enabled;
                    if(!isAutoBanEnabled) await manage("ban");
                    else data.guild.plugins.autosanctions.ban = {
                        enabled: false,
                        count: null,
                        in: null
                    };
                    await data.guild.save();
                    await displayMain("ban");
                    await after();
                    break;
                default:
                    return;
            };
        };

        async function manage(type) {
            filter = (m) => m.author.id === message.author.id;
            let collected = null;

            let muteTime = null;
            let count = null;
            let inVar = null;

            // Ask for "muteTime"
            if(type === "mute") {
                let instruction1 = await message.channel.send(message.drakeWS("administration/auto-sanctions:INSTRUCTION_MUTE", {
                    emoji: "write"
                }));
    
                collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
                if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                    emoji: "succes"
                });
                
                muteTime = collected.first().content;
                if(muteTime === "cancel") return message.drake("common:CANCEL", {
                    emoji: "succes"
                });

                if(isNaN(ms(muteTime))) return message.drake("administration/auto-sanctions:INVALID_DATE", {
                    emoji: "error"
                });

                collected.first().delete().catch(() => {});
                instruction1.delete().catch(() => {});
            };

            // Ask for "count"
            let instruction2 = await message.channel.send(message.drakeWS("administration/auto-sanctions:INSTRUCTION_COUNT", {
                emoji: "write"
            }));

            collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
            if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                emoji: "succes"
            });
            
            count = collected.first().content;
            if(count === "cancel") return message.drake("common:CANCEL", {
                emoji: "succes"
            });

            if(isNaN(count) || count < 0 || count > 100) return message.drake("administration/auto-sanctions:INVALID_COUNT", {
                emoji: "error"
            });

            collected.first().delete().catch(() => {});
            instruction2.delete().catch(() => {});

            // Ask for "in"
            let instruction3 = await message.channel.send(message.drakeWS("administration/auto-sanctions:INSTRUCTION_IN", {
                emoji: "write"
            }));

            collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
            if(!collected || !collected.first()) return message.drake("common:CANCEL", {
                emoji: "succes"
            });
            
            inVar = collected.first().content;
            if(inVar === "cancel") return message.drake("common:CANCEL", {
                emoji: "succes"
            });

            if(isNaN(ms(inVar))) return message.drake("administration/auto-sanctions:INVALID_DATE", {
                emoji: "error"
            });

            collected.first().delete().catch(() => {});
            instruction3.delete().catch(() => {});

            if(type === "mute") data.guild.plugins.autosanctions.mute = {
                enabled: true,
                muteTime: ms(muteTime),
                count: count,
                in: ms(inVar)
            };
            else data.guild.plugins.autosanctions[type] = {
                enabled: true,
                count: count,
                in: ms(inVar)
            };

            filter = (button) => button.clicker.user.id === message.author.id;
        };
    
        async function cancel() {
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
        };

        const ctv = await start();
        await switchCTV(ctv);
    };
};

module.exports = AutoSanctions;