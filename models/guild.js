exports.Guild = (guildID, client) => {
    return [
        // The guild id
        guildID,
        // The names of the guild
        [],

        // The plugins
        {
            captcha: {
                enabled: false,
                captchaChannel: null,
                captchaLog: null,
                role: null
            },
            autorole: {
                enabled: false,
                role: null
            },
            automod: {
                antiPub: false,
                antiBadwords: false,
                antiMajs: false	
            },
            welcome: {
                enabled: false,
                channel: null,
                message: null
            },
            leave: {
                enabled: false,
                channel: null,
                message: null
            },
            levels: {
                enabled: true,
                channel: "current",
                message: ":tada: Congratulations to {user} to reach **level {level}** !",
                rankRewards: [],
            },
            messreac: {
                enabled: true,
                channel: null,
                reaction: null
            },
            welcomeDM: null,
            suggestions: null
        },

        // The default prefix
        client.cfg.prefix,
        // The default language
        client.cfg.lang.find((l) => l.default).name,
        // The default symbol
        '$',

        // The case count
        0,
        // The companys
        [],
        // The custom commands
        [],
    ];
};