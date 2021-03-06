const Drake = require("./structure/drakebot");
const client = new Drake({
    partials: ["MESSAGE", "USER", "REACTION", "GUILD_MEMBER"],
    fetchAllMembers: true
}); 

client.init();

client.login(client.cfg.token);