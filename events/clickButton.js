class ClickButton {

    constructor(client) {
        this.client = client;
    };

    async run (button) {

        const client = this.client;

        const channel = button.channel;
        if(!channel) return;
    };
};

module.exports = ClickButton;