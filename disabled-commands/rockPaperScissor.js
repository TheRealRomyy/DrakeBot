const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class RockPaperScissor extends Command {

    constructor(client) {
        super(client, {
            name: "rockPaperScissor",
            aliases: ["rock-paper-scissor", "rps"],
            enabled: true,
            dirname: __dirname,
            botPerms: [],
            userPerms: [],
            restriction: []
        });
    };

    async run(message, args, data) {
        
        const client = this.client;

        const i = client.functions.getRandomInt(1, 3)
        const iF = i.toFixed(0);
        let ii = 0;
        
        // 1 = Rock | 2 = Paper | 3 = Scissor 

        async function playRock() {
            // 1
            if(iF == 2) {
                const embed = new MessageEmbed()
                .setColor(client.cfg.color.red)
                .setTitle(message.drakeWS("misc:LOOSE", {
                    emoji: "cry"
                }))
                .setDescription(message.drakeWS("fun/rockPaperScissor:WIN_PAPER", {
                    emoji: "scroll"
                }))
                .setFooter(client.cfg.footer)

                message.channel.send(embed);
            } else if(iF == 3) {
                const embed = new MessageEmbed()
                .setTitle(message.drakeWS("misc:WIN", {
                    emoji: "trophy"
                }))
                .setColor(client.cfg.color.yellow)
                .setDescription(message.drakeWS("fun/rockPaperScissor:LOSE_SCISSOR", {
                    emoji: "scissor"
                }))
                .setFooter(client.cfg.footer)

                message.channel.send(embed);
            };
        };

        async function playScissors() {
            // 3
            if(iF == 2) {
                const embed = new MessageEmbed()
                .setColor(client.cfg.color.yellow)
                .setTitle(message.drakeWS("misc:WIN", {
                    emoji: "trophy"
                }))
                .setDescription(message.drakeWS("fun/rockPaperScissor:LOSE_PAPER", {
                    emoji: "scroll"
                }))
                .setFooter(client.cfg.footer)

                message.channel.send(embed);
            } else if(iF == 1) {
                const embed = new MessageEmbed()
                .setTitle(message.drakeWS("misc:LOOSE", {
                    emoji: "cry"
                }))
                .setColor(client.cfg.color.red)
                .setDescription(message.drakeWS("fun/rockPaperScissor:WIN_ROCK", {
                    emoji: "rock"
                }))
                .setFooter(client.cfg.footer)

                message.channel.send(embed);
            };
        };

        async function playPaper() {
            // 2
            if(iF == 1) {
                const embed = new MessageEmbed()
                .setColor(client.cfg.color.yellow)
                .setTitle(message.drakeWS("misc:WIN", {
                    emoji: "trophy"
                }))
                .setDescription(message.drakeWS("fun/rockPaperScissor:LOSE_ROCK", {
                    emoji: "rock"
                }))
                .setFooter(client.cfg.footer)

                message.channel.send(embed);
            } else if(iF == 3) {
                const embed = new MessageEmbed()
                .setColor(client.cfg.color.red)
                .setTitle(message.drakeWS("misc:LOOSE", {
                    emoji: "cry"
                }))
                .setDescription(message.drakeWS("fun/rockPaperScissor:WIN_SCISSOR", {
                    emoji: "scissor"
                }))
                .setFooter(client.cfg.footer)

                message.channel.send(embed);
            };
        };

        const msg = await message.channel.send(message.drakeWS("fun/rockPaperScissor:PLAY", {
            emoji: "play"
        }));
        msg.react('📜').then(() => msg.react('✂️').then(() => msg.react('🌍')));
    
        const filter = (reaction, user) => {
                return ['📜', '✂️', '🌍'].includes(reaction.emoji.name) && user.id === message.author.id;
            };
    
            msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first();
                    if(reaction.emoji.name === '📜') {
                            ii = 2;
                            msg.delete();
                            message.drake("fun/rockPaperScissor:YOU_PAPER", {
                                emoji: "play"
                            })
                            if(iF == ii) {
                                const embed = new MessageEmbed()
                                .setColor(client.cfg.color.purple)
                                .setDescription(message.drakeWS("fun/rockPaperScissor:ALSO_PAPER", {
                                    emoji: "scroll"
                                }))
                                .setTitle(message.drakeWS("misc:EQUALITY", {
                                    emoji: "gem"
                                }))
                                .setFooter(client.cfg.footer)
        
                                return message.channel.send(embed);
                            }
                            playPaper();
                    } else if(reaction.emoji.name === '✂️'){
                        ii = 3;
                        msg.delete();
                        message.drake("fun/rockPaperScissor:YOU_SCISSOR", {
                            emoji: "play"
                        })
                        if(iF == ii) {
                            const embed = new MessageEmbed()
                            .setColor(client.cfg.color.purple)
                            .setDescription(message.drakeWS("fun/rockPaperScissor:ALSO_SCISSOR", {
                                emoji: "scissor"
                            }))
                            .setTitle(message.drakeWS("misc:EQUALITY", {
                                emoji: "gem"
                            }))
                            .setFooter(client.cfg.footer)

                            return message.channel.send(embed);
                        }
                        playScissors();
                    } else if(reaction.emoji.name === '🌍'){
                        ii = 1;
                        msg.delete();
                        message.drake("fun/rockPaperScissor:YOU_ROCK", {
                            emoji: "play"
                        })
                        if(iF == ii) {
                            const embed = new MessageEmbed()
                            .setColor(client.cfg.color.purple)
                            .setDescription(message.drakeWS("fun/rockPaperScissor:ALSO_ROCK", {
                                emoji: "rock"
                            }))
                            .setTitle(message.drakeWS("misc:EQUALITY", {
                                emoji: "gem"
                            }))
                            .setFooter(client.cfg.footer)

                            return message.channel.send(embed);
                        }
                        playRock();
                    };
            }).catch(collected => {
                msg.delete();
        });        
    };
};

module.exports = RockPaperScissor;