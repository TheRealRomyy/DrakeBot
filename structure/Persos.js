class Perso {

    constructor(client, message) {
        this.client = client;
        this.message = message;
    };

    run() {
        switch(this.message.content.split("d!")[1]) {
            case "bastien":
                this.bastien()
                break;
            case "nath":
                this.nath();
                break;
            case "thomas":
                this.thomas();
                break;
            case "oxam":
                this.oxam();
                break;
            case "antonin":
                this.antonin();
                break;
            default: 
                return;
        };
    };

    bastien() {
        return this.message.channel.send("https://tenor.com/view/hello-ant-hi-insect-gif-13933414");
    };

    nath() {
        return this.message.channel.send("https://tenor.com/view/poca-guru-poca_guru-camper-campeur-gif-18344230");
    };

    thomas() {
        return this.message.channel.send("https://tenor.com/view/wink-teeth-dentist-big-smile-big-teeth-gif-12706835");
    };

    oxam() {
        return this.message.channel.send("https://tenor.com/view/its-game-night-game-night-tv-game-night-video-games-stadia-gif-18245688");
    };

    antonin() {
        return this.message.channel.send("https://tenor.com/view/dragon-rawr-baby-dragon-gif-8180489");
    };
};

module.exports = Perso;