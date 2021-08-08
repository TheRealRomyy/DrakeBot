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
            autosanctions: [],
            automod: {
                antiPub: {
                    enabled: false,
                    discord: true,
                    links: true,
                    ignoredChannels: [],
                    ignoredRoles: []
                },
                antiBadwords: {
                    enabled: false,
                    ignoredChannels: [],
                    ignoredRoles: []
                },
                antiMajs: {
                    enabled: false,
                    ignoredChannels: [],
                    ignoredRoles: [],
                },
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
            logs: {
                mod: false,
                messages: false
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

        // The subscription status
        {
            premium: false,
            since: null,
            expires: null,
            subs: []
        },

        // The fortress mod
        false,

        // The reaction roles array
        [],
        // The reactions count
        0,

        // The antiraid system
        {
            channelCreate: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            channelDelete: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            emojiCreate: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            emojiDelete: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            roleCreate: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            roleDelete: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            webHookUpdate: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            guildBanAdd: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            guildMemberRemove: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any"
            },
            antispam: {
                enabled: false,
                ignoredRoles: [],
                ignoredChannels: [],
                limit: 3,
                time: 5000,
                sanction: "any",
                muteTime: null
            },
        },

        // The sanction case
        0
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

        // The total exp of the member
        0
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

        // User records
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
        // The array of the voters
        []
    ];
};