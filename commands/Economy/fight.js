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

        // Récupérer le client du constructeur
        let client = this.client;

        // Créer l'historique du fight & le message
        let log = null;
        let msg = null;

        // Check le cooldown
        if(data.member.cooldowns.fight && data.member.cooldowns.fight > Date.now()) return message.drake("economy/fight:COOLDOWN", {
            time: message.time.convertMS(data.member.cooldowns.fight - Date.now()),
            emoji: "error"
        });

        // Calculer les domages et points de vies du mob
        let damageOfTheMob = 0;
        let mobHP = client.functions.getRandomInt(5, 350);

        // Récupérer la langue
        let lang = client.cfg.lang.find((l) => l.name === data.guild.language);

        // Récupérer le nom de toutes les armes et calculer laquelle est utilisée
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

        // Calculer les domages et points de vies du joueur
        let damage = weapon !== message.drakeWS("common:HAND") ? (data.member.inventory != "" ? (data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === weapon)).damage : 5) : 5;
        let lp = (armor !== message.drakeWS("common:HAND") ? (data.member.inventory != "" ? (((data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === armor)).resistance) ? (data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === armor)).resistance : 5) : 5) : 5) + 60;

        // Envoyer le message annoncant l'ennemi & ses pv
        log = message.drakeWS("economy/fight:MOB", {
            weapon
        });

        msg = await message.channel.send(log);


        sendMessage("\n" + message.drakeWS("economy/fight:MOB_HP", {
            mobHP
        }));

        // Boucle tant que le mob est en vie
        while(mobHP > 0 && lp > 0) {
            await playerHitMob();
            await mobHitPlayer();
            await checkWin();
        };

        // Vérifier si il y a victoire ou défaite
        async function checkWin() {
            // Ni victoire ni défaite : les deux sont encore en vie
            if(mobHP > 0 && lp > 0) return;

            if(lp > 0) { // Victoire du joueur :]

                // Calculer l'argent gagnée
                let toWin = client.functions.getRandomInt(20, 30) * (data.member.inventory != "" ? (data.member.inventory.find((i) => (lang.moment === "fr" ? i.namefr : i.nameen) === weapon)).dexterite : 2);
                
                // Envoyer un message de victoire
                sendMessage(message.drakeWS("economy/fight:MOB_DEAD", {
                    symbol: data.guild.symbol,
                    amount: toWin.toString()
                }));

                // Définir un cooldown & le sauvegarder dans la db
                const toWait = Date.now() + 3600000;
                data.member.money += toWin;
                data.member.cooldowns.fight = toWait;

                return await data.member.save();
            
            } else if(mobHP > 0) { // Défaite du joueur ]:

                // Envoyer un message annoncant la mort du joueur
                sendMessage(message.drakeWS("economy/fight:DEAD"));

                // Définir un cooldown & le sauvegarder dans la db
                const toWait = Date.now() + 3600000;
                data.member.cooldowns.fight = toWait;
                return await data.member.save();
            };
        };

        // Quand le mob tape le joueur
        async function mobHitPlayer() {

            // Calculer les dégats du mob
            damageOfTheMob = client.functions.getRandomInt(5, 65);

            // Les soustraires au pv du joueur
            lp -= damageOfTheMob;

            // Informer le joueur de l'attaque du mob
            sendMessage(message.drakeWS("economy/fight:MOB_DAMAGES", {
                damage: damageOfTheMob
            }));

            // Donner le nombre de points de vie restants du joueur
            sendMessage(message.drakeWS("economy/fight:YOUR_HP", {
                lp: lp > 0 ? lp : 0
            }));

        };

        // Quand le joueur tape le mob
        async function playerHitMob() {

            // Envoyer le message donnant l'attaque du joueur
            sendMessage(message.drakeWS("economy/fight:MOB_DAMAGE", {
                damage
            }));

            // La soustraire au pv du mob
            mobHP -= damage;

            /// Donner le nombre de points de vie du mob
            sendMessage(message.drakeWS("economy/fight:DAMAGES", {
                mobHP
            }));
        };

        // Envoyer un message
        function sendMessage(mess) {
            log += mess + "\n";
            msg.edit(log);
        };
    };
};

module.exports = Fight;