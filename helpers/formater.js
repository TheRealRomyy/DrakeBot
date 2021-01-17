module.exports = class Formater {

    constructor(message) {
        this.msg = message;
    };

    say() {

        let formatedMsg = this.msg
            .replace("{pepeNice}", "<:pepeNice:787061542549061644>")
            .replace("{hapcool}", "<:hapcool:759431719513620500>")
            .replace("{hapsad}", "<:hapsad:764850641053941821>")
            .replace("{pepeCross}", "<:pepeCross:752830297577488391>")
            .replace("{pepeHacker}", "<a:pepeHacker:782660005014274069>")
            .replace("{pepeKnife}", "<:pepeKnife:787061432612814858>")
            .replace("{issouPoils}", "<:issou_poils:768572382460772412>")
            .replace("{logik}", "<:logikk:752829760069042237>")
            .replace("{waveSmile}", "<a:waveSmile:524164490296557580>")
            .replace("{harold}", "<:harold:768572456419459083>")
            .replace("{badmood}", "<:badmood:760953781600649286>");

        return formatedMsg;
    }
};