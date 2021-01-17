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
            req.client.channels.cache.get("800333554097717290").send("<:upvote:800363606486548481> Thanks to <@" + user + "> (||" + user.username + "||) who has vote to **" + req.client.user.username + "** (`" + votes + "` votes) \n(https://top.gg/bot/" + req.client.user.id + "/vote)");
            res.status(200).send({
                message: "Thank you =)"
            });
        };
    }))
    .use((req, res) => {
        res.status(404).render("404");
    });

module.exports = router;