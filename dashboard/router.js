const express = require("express");
const DBL = require("dblapi.js");
const router = express.Router();

router
    .get("/", async function(req, res) {
        res.render("home", {
            serverCount: req.client.guilds.cache.size,
            userCount: req.client.users.cache.size,
            commandCount: req.clientData.count,
        });
    })
    .get("/staff", async function(req, res) {
        res.render("staff", {
            config: req.client.cfg.staff,
            users: req.client.users.cache
        });
    })
    .get("/commands", async function(req, res) {
        res.render("commands");
    })
    .use("/vote", router.post("/", async (req, res) => {
        if(req.headers.authorization === req.client.cfg.api.dbl.password){
            const user = await req.client.users.fetch(req.body.user);
            const dbl = new DBL(req.client.cfg.api.dbl.token, req.client);
            let votes = 0;
            await dbl.getBot(req.client.user.id).then(bot => votes = bot.monthlyPoints);
            let caseInfo = {
                voterId: user.id,
                expire: Date.now() + 86400000 // 1 jour
            };
            let isInServer = req.client.guilds.cache.get("756915711250792560").member(user.id) !== null ? true : false; // 756915711250792560 = DrakeBot Support 
            let member = isInServer ? req.client.guilds.cache.get("756915711250792560").member(user.id) : null; 
            var alreadyInArray = false;
            await req.clientData.voter.forEach(vote => {
                if(vote.voterId !== user.id) return;
                vote.expire = vote.expire + 86400000;
                alreadyInArray = true;
            });
            if(isInServer && !alreadyInArray) {
                member.roles.add("827891844901765171", "Vote").catch(() => {}); // 827891844901765171 = Voter Role
                req.clientData.voter.push(caseInfo);
            };
            await req.clientData.save()
            req.client.channels.cache.get("800333554097717290").send(`<:upvote:800363606486548481> Thanks to ${isInServer ? user : "**" + user.username + "**"} who has vote to **${req.client.user.username}** (\`${votes}\` votes) \n(<https://top.gg/bot/${req.client.user.id}/vote>)\n${isInServer ? `You ${alreadyInArray ? "extend your" : "won the"} rank <@&827891844901765171> for 1 ${alreadyInArray ? "more" : ""} day` : ""}`, {"allowedMentions": { "users" : [user.id]}});
            res.status(200).send({
                message: "Thank you =)"
            });
        };
    }))
    .use((req, res) => {
        res.status(404).render("404");
    });

module.exports = router;