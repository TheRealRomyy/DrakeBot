const Drake = require("./structure/drakebot");
const client = new Drake(); 

client.init();

client.login(client.cfg.token);

process.on("unhandledRejection", (err) => {
    if(err.code === "50001") console.error
    else client.emit("error", err);
});