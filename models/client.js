module.exports.Client = clientID => {
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