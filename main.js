const Drake = require("./structure/drakebot");
const client = new Drake(); 

client.init();

client.login(client.cfg.token);