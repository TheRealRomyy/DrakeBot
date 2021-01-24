const Command = require("../../structure/Commands.js");

class Fight extends Command {

    constructor(client) {
        super(client, {
            name: "fight",
            aliases: [ "combat" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let client = this.client;

        //try {
            const isInCooldown = data.member.cooldowns.fight;
            if(isInCooldown){
                if(isInCooldown > Date.now()) return message.drake("economy/fight:COOLDOWN", {
                        time: message.time.convertMS(isInCooldown - Date.now()),
                        emoji: "error"
                });
            }

            let damageOfTheMob = 0;
            let mobHP = client.functions.getRandomInt(5, 350);

            let toFight = client.functions.getRandomInt(1, 25);
            let lang = client.cfg.lang.find((l) => l.name === data.guild.language);

            if(!data.member.inventory) data.member.inventory = [];

            let weapon = message.drakeWS("common:HAND");
            let armor = message.drakeWS("common:HAND");

            if((data.member.inventory.map((i) => i.name)).includes("wooden_sword")) weapon = message.drakeWS("economy/fight:WOODEN_SWORD");
            if((data.member.inventory.map((i) => i.name)).includes("stone_sword")) weapon = message.drakeWS("economy/fight:STONE_SWORD");
            if((data.member.inventory.map((i) => i.name)).includes("iron_sword")) weapon = message.drakeWS("economy/fight:IRON_SWORD");
            if((data.member.inventory.map((i) => i.name)).includes("diamond_sword")) weapon = message.drakeWS("economy/fight:DIAMOND_SWORD");
            if((data.member.inventory.map((i) => i.name)).includes("demonic_sword")) weapon = message.drakeWS("economy/fight:DEMONIC_SWORD");
            if((data.member.inventory.map((i) => i.name)).includes("legendary_sword")) weapon = message.drakeWS("economy/fight:LEGENDARY_SWORD");

            if((data.member.inventory.map((i) => i.name)).includes("wooden_armor")) armor = message.drakeWS("economy/fight:WOODEN_ARMOR");
            if((data.member.inventory.map((i) => i.name)).includes("stone_armor")) armor = message.drakeWS("economy/fight:STONE_ARMOR");
            if((data.member.inventory.map((i) => i.name)).includes("iron_armor")) armor = message.drakeWS("economy/fight:IRON_ARMOR");
            if((data.member.inventory.map((i) => i.name)).includes("diamond_armor")) armor = message.drakeWS("economy/fight:DIAMOND_ARMOR");

            let damage = weapon !== message.drakeWS("common:HAND") ? (data.member.inventory != "" ? (data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === weapon)).damage : 5) : 5;
            let lp = (armor !== message.drakeWS("common:HAND") ? (data.member.inventory != "" ? (((data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === armor)).resistance) ? (data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === armor)).resistance : 5) : 5) : 5) + 60;

            if(toFight == 1) {

                message.drake("economy/fight:BOSS", {
                    emoji: "skeleton",
                    weapon
                });

            } else {

                message.drake("economy/fight:MOB", {
                    emoji: "fight",
                    weapon
                });

                message.drake("economy/fight:MOB_HP", {
                    mobHP
                });

                message.drake("economy/fight:MOB_DAMAGE", {
                    damage
                });

                if(damage >= mobHP) {
                    let toWin = client.functions.getRandomInt(20, 30) * (data.member.inventory != "" ? (data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === weapon)).dexterite : 2);
                    message.drake("economy/fight:MOB_DEAD", {
                        emoji: "trophy",
                        symbol: data.guild.symbol,
                        amount: toWin.toString()
                    });
                    const toWait = Date.now() + 3600000;
                    data.member.money += toWin;
                    data.member.cooldowns.fight = toWait;
                    return await data.member.save();
                } else {
                    hitMob(damage, mobHP, lp)
                    if(mobHP > 0 && lp > 0) {
                        message.drake("economy/fight:MOB_DAMAGE", {
                            damage
                        });
                        hitMob(damage)
                        if(mobHP > 0 && lp > 0) {
                            message.drake("economy/fight:MOB_DAMAGE", {
                                damage
                            });
                            mobHP -= damage;

                            if(mobHP <= 0) {
                                let toWin = client.functions.getRandomInt(20, 30) * (data.member.inventory != "" ? (data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === weapon)).dexterite : 2);
                                message.drake("economy/fight:DAMAGES", {
                                    mobHP: 0
                                });
                                message.drake("economy/fight:MOB_DEAD", {
                                    emoji: "trophy",
                                    symbol: data.guild.symbol,
                                    amount: toWin.toString()
                                });
                                const toWait = Date.now() + 3600000;
                                data.member.money += toWin;
                                data.member.cooldowns.fight = toWait;
                                return await data.member.save();
                            }

                            message.drake("economy/fight:DAMAGES", {
                                mobHP
                            });

                            damageOfTheMob = lp;
                            lp -= damageOfTheMob;

                            message.drake("economy/fight:MOB_DAMAGES", {
                                damage: lp
                            });

                            message.drake("economy/fight:DEAD", {
                                emoji: "skeleton"
                            });
                            const toWait = Date.now() + 3600000;
                            data.member.cooldowns.fight = toWait;
                            return await data.member.save();
                        };
                    };
                };
            };

            async function hitMob(degats) {
                mobHP -= degats;

                if(mobHP <= 0) {
                    let toWin = client.functions.getRandomInt(20, 30) * (data.member.inventory != "" ? (data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === weapon)).dexterite : 2);
                    message.drake("economy/fight:DAMAGES", {
                        mobHP: 0
                    });
                    message.drake("economy/fight:MOB_DEAD", {
                        emoji: "trophy",
                        symbol: data.guild.symbol,
                        amount: toWin.toString()
                    });
                    const toWait = Date.now() + 3600000;
                    data.member.money += toWin;
                    data.member.cooldowns.fight = toWait;
                    return await data.member.save();
                }

                message.drake("economy/fight:DAMAGES", {
                    mobHP
                });

                damageOfTheMob = client.functions.getRandomInt(5, 65);

                lp -= damageOfTheMob;

                message.drake("economy/fight:MOB_DAMAGES", {
                    damage: damageOfTheMob
                });

                if(lp <= 0) {
                    message.drake("economy/fight:DEAD", {
                        emoji: "skeleton"
                    });
                    const toWait = Date.now() + 3600000;
                    data.member.cooldowns.fight = toWait;
                    return await data.member.save();
                } else {
                    message.drake("economy/fight:YOUR_HP", {
                        lp
                    });
                };
            };
        //} catch (error) {
           // client.functions.sendErrorCmd(client, message, this.help.name, error);
        //};
    };
};

module.exports = Fight;