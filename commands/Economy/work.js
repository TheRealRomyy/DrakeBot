const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Work extends Command {

    constructor(client) {
        super(client, {
            name: "work",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 0,
            restriction: []
        });
    };

    async run(message, args, data) {

        const client = this.client;

        const isInCooldown = data.member.cooldowns.work;
        if(isInCooldown && isInCooldown > Date.now()) return message.drake("economy/work:COOLDOWN", {
            time: message.time.convertMS(isInCooldown - Date.now()),
            emoji: "error"
        });

        const jobs = [
            {
                name: "Developper",
                pay: "05|10",
                chance: "0|19",
                number: 1
            }, 
            {
                name: "Cooker",
                pay: "04|09",
                chance: "19|39",
                number: 2
            },
            {
                name: "Policeman",
                pay: "06|11",
                chance: "39|53",
                number: 3
            }, 
            {
                name: "Coach",
                pay: "20|40",
                chance: "53|63",
                number: 4
            },
            {
                name: "Astronaut",
                pay: "100|1000",
                chance: "63|64",
                number: 5
            }, 
            {
                name: "Chef",
                pay: "25|35",
                chance: "64|71",
                number: 6
            },
            {
                name: "Doctor",
                pay: "40|75",
                chance: "71|74",
                number: 7
            },
            {
                name: "Journalist",
                pay: "30|40",
                chance: "74|77",
                number: 8
            },
            {
                name: "Firefighter",
                pay: "06|11",
                chance: "77|94",
                number: 9
            }, 
            {
                name: "Dentist",
                pay: "30|50",
                chance: "94|101",
                number: 10
            }
        ];


        const number = client.functions.getRandomInt(0, 100);
        const arrayOutOfForEach = [];
        let jobName = "";

        jobs.forEach(job => {
            const arrayInForEach = {
                "Name": job.name,
                "Array": []
            };
            const splitedChance = job.chance.split("|");
            const min = splitedChance[0];
            const max = splitedChance[1];
            for (let i = 0; i < 100; i++) {
                if(i >= min && i < max) arrayInForEach["Array"].push(i)
            };
            arrayOutOfForEach.push(arrayInForEach);
        });

        await arrayOutOfForEach.forEach(object => {
            if(object["Array"].includes(number)) jobName = object["Name"];
        });

        const job = jobs.find(job => job.name === jobName);

        const minToWin = job.pay.split("|")[0];
        const maxToWin = job.pay.split("|")[1];

        const win = client.functions.getRandomInt(parseInt(minToWin), parseInt(maxToWin));
        jobName = message.drakeWS("economy/work:" + jobName.toUpperCase());

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setColor(client.cfg.color.purple)
        .setFooter(client.cfg.footer)
        .setDescription(message.drakeWS("economy/work:WORK", {
            pay: win,
            job: jobName,
            symbol: data.guild.symbol
        }));

        message.channel.send(embed);

        const toWait = Date.now() + 600000;

        data.member.cooldowns.work = toWait;
        data.member.money += win;
        await data.member.save(data.member);
    };
};

module.exports = Work;