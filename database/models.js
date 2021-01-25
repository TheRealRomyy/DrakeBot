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

exports.Member = (userID, guildID) => {
    return [
        // The id of the member
        userID,
        // The id of the guild
        guildID,

        // The money of the member
        0,
        // The bank account of the member
        0,

        // The exp of the member
        0,
        // The level of the member
        0,

        // The inventory of the member
        [],

        // All cooldowns of the member
        {
            work: 0,
            rob: 0,
            crime: 0,
            fight: 0
        },

        // The sanctions of the member
        [],
        // The mute state of the member
        {
            muted: false,
            case: null,
            endDate: null
        },
    ];
};

exports.User = (userID) => {
    return [
        // The id of the user
        userID,
        // All names of the user
        [],

        // The description of the user
        null,           
        // The afk state of the user,
        null,
        // The reminds of the user
        [],
    ];
};

exports.Client = clientID => {
    return [
        // The id of the client
        clientID,
        // The count of commands run
        0,

        // The blacklist
        {
            guilds: [],
            users: []
        },
    ];
};