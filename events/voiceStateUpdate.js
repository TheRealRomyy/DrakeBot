const { MessageEmbed } = require("discord.js");

class VoiceStateUpdate {

    constructor(client) {
        this.client = client;
    };
    
    async run(oldState, newState) {

        if(oldState.guild.id !== "739217304935596100") return; // Coffee Place

        let type = null;

        // Connection & leave
        if(oldState.channelId !== null && newState.channelId === null) type = "leave";
        if(oldState.channelId === null && newState.channelId !== null) type = "connection";
        // Server & Self mute & deaf
        if(!oldState.serverDeaf && newState.serverDeaf) type = "serverDeaf";
        if(!oldState.serverMute && newState.serverMute) type = "serverMute";
        if(!oldState.selfDeaf && newState.selfDeaf) type = "selfDeaf";
        if(!oldState.selfMute && newState.selfMute) type = "selfMute";
        // Server & self unmute & undeaf
        if(oldState.serverDeaf && !newState.serverDeaf) type = "un_serverDeaf";
        if(oldState.serverMute && !newState.serverMute) type = "un_serverMute";
        if(oldState.selfDeaf && !newState.selfDeaf) type = "un_selfDeaf";
        if(oldState.selfMute && !newState.selfMute) type = "un_selfMute";
        // Stream and unstram
        if(oldState.streaming && !newState.streaming) type = "un_stream";
        if(!oldState.streaming && newState.streaming) type = "stream";

        switch(type) {
            // Connexion & leave
            case "leave":
                const embed = new MessageEmbed()
                .setTitle("📤 Log - Vocal")
                .setColor(this.client.cfg.color.red)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> s'est déconnecté du salon vocal `" + this.client.channels.cache.get(oldState.channelId).name + "`")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed]
                });
                break;
            case "connection":
                const embed1 = new MessageEmbed()
                .setTitle("📥 Log - Vocal")
                .setColor(this.client.cfg.color.green)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> s'est connecté au salon vocal `" + this.client.channels.cache.get(newState.channelId).name + "`")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed1]
                });
                break;
             // Server & Self mute & deaf
            case "serverDeaf": 
                const embed2 = new MessageEmbed()
                .setTitle("<:casque_off:817159014605389885> Log - Vocal")
                .setColor(this.client.cfg.color.orange)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a eu son casque coupé par le serveur (dans `" + this.client.channels.cache.get(oldState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed2]
                });
                break;
            case "serverMute":
                const embed3 = new MessageEmbed()
                .setTitle("<:micro_off:817159014768836608> Log - Vocal")
                .setColor(this.client.cfg.color.orange)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a eu son micro coupé par le serveur (dans `" + this.client.channels.cache.get(oldState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed3]
                });
                break;
            case "selfDeaf":
                const embed4 = new MessageEmbed()
                .setTitle("<:casque_off:817159014605389885> Log - Vocal")
                .setColor(this.client.cfg.color.purple)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a désactivé son casque (dans `" + this.client.channels.cache.get(oldState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed4]
                });
                break;
            case "selfMute":
                const embed5 = new MessageEmbed()
                .setTitle("<:micro_off:817159014768836608> Log - Vocal")
                .setColor(this.client.cfg.color.purple)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a désactivé son micro (dans `" + this.client.channels.cache.get(newState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed5]
                });
                break;
             // Server & self unmute & undeaf
            case "un_serverDeaf": 
                const embed6 = new MessageEmbed()
                .setTitle("<:casque:817159014772506704> Log - Vocal")
                .setColor(this.client.cfg.color.yellow)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a eu son casque remis par le serveur (dans `" + this.client.channels.cache.get(oldState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed6]
                });
                break;
            case "un_serverMute":
                const embed7 = new MessageEmbed()
                .setTitle("<:micro:817159014399737897> Log - Vocal")
                .setColor(this.client.cfg.color.yellow)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a eu son micro remis par le serveur (dans `" + this.client.channels.cache.get(oldState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed7]
                });
                break;
            case "un_selfDeaf":
                const embed8 = new MessageEmbed()
                .setTitle("<:casque:817159014772506704> Log - Vocal")
                .setColor(this.client.cfg.color.blue)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a réactivé son casque (dans `" + this.client.channels.cache.get(oldState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed8]
                });
                break;
            case "un_selfMute":
                const embed9 = new MessageEmbed()
                .setTitle("<:micro:817159014399737897> Log - Vocal")
                .setColor(this.client.cfg.color.blue)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a réactivé son micro. (dans `" + this.client.channels.cache.get(newState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed9]
                });
                break;
            case "stream":
                const embed10 = new MessageEmbed()
                .setTitle("<:stream:817159014541688833> Log - Vocal")
                .setColor(this.client.cfg.color.yellow)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a démarré un live dans `" + this.client.channels.cache.get(oldState.channelId).name + "`")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed10]
                });
                break;
            case "un_stream":
                const embed11 = new MessageEmbed()
                .setTitle("<:stream:817159014541688833> Log - Vocal")
                .setColor(this.client.cfg.color.red)
                .setFooter(this.client.cfg.footer)
                .setDescription("<@" + this.client.users.cache.get(newState.id) + "> a arrêté son live (dans `" + this.client.channels.cache.get(oldState.channelId).name + "`)")

                this.client.channels.cache.get("884860986190856252").send({
                    embeds: [embed11]
                });
                break;
            default:
                break;
        };
    };
};

module.exports = VoiceStateUpdate;