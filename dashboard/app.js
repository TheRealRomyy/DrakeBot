const express = require("express");
const router = require('./router');

const cors = require('cors');
const path = require("path");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const app = express();

module.exports.load = async(client) => {

	const ip = client.cfg.dashboard.ip;
	const port = client.cfg.dashboard.port;

	app.use(morgan('combined')); 
	app.use(cors()); 
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
		req.clientData = await client.db.findOrCreateClient({ id: client.user.id });
		next();
	});
	app.use(router);
	app.set("ip", client.cfg.dashboard.ip);
	app.set("port", client.cfg.dashboard.port);

	app.listen(port, ip, () => {
		console.log(`Website: Running at https://drakebot.xyz/`);
	});
};