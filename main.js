const Drake = require("./structure/drakebot");
const client = new Drake(); 

client.init();

client.login(client.cfg.token);

process.on("unhandledRejection", (err) => {
    const token = client.functions.generateToken(32);
    client.emit("error", err, "unhandled rejection", token);
});