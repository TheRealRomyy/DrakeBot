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