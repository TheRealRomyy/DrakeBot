const express = require("express");
const router = require('./router');

const path = require("path");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const app = express();

module.exports.load = async(client) => {

	const ip = client.cfg.dashboard.ip;
	const port = client.cfg.dashboard.port;

	app.use(morgan('combined')); 
	app.use(bodyParser.json()); 
	app.use(bodyParser.urlencoded({
			extended: true
	}));
	app.use(express.static(__dirname + '/public'));
	app.engine("html", require("ejs").renderFile);
	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "/views"));
	app.use(async function(req, res, next){
		req.client = client;
		req.clientData = await client.db.findOrCreateClient(client.user.id);
		req.clientData.save = async (data) => {
            if(!data) data = await client.cache.master.get(client.user.id)
            if(!data) throw new Error("This master isn't in the cache.");
    
            let dGuild = await client.db.pool.query("SELECT * FROM master WHERE id=$1", [data.id]);
			let gData = await client.db.pool.query(`SELECT * FROM master WHERE id='${client.user.id}'`);
            dGuild = dGuild.rows[0];
    
            Object.keys(dGuild).forEach(async d => {
                if(dGuild[d] !== data[d]) {
                    await client.db.pool.query(`UPDATE master SET ${d}=$1 WHERE id=$2`, [data[d], data.id]).catch(e => e);
                    dGuild[d] = data[d];
                };
            });
    
            dGuild.save = data.save;
            client.cache.master.set(gData.rows[0].id, dGuild);
        };
		next();
	});
	app.use(router);
	app.set("ip", client.cfg.dashboard.ip);
	app.set("port", client.cfg.dashboard.port);

	app.listen(port, ip, () => {
		client.logger.log(`Website: Running at https://${ip}:${port !== 80 ? port + "/" : "/"}`);
	});
};