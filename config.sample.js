module.exports = {
	token: "TOK3N",
	inviteLink: "INVITE LINK",
    prefix: "d!",
	footer: "DrakeBot | 2021",
	api: {
		dbl: {
			token: "TOK3N",
			password: "PASSWORD"
		},
		joke: "TOK3N"

	},
	staff: {
		support: [],
		owner: []
	},
	bots: {
		"762965943529766912": ":thumbsup:",
		"710135804714024962": ":thumbsup:",
		"662062221177913354": ":thumbsup:",
		"785141123567845397": ":thumbsup:"
	},
	dashboard: {
		port: 80,
		ip: "IP",
		enabled: true,
		name: "NAME"
	},
	lang: [
		{
			name: "en-US",
			nativeName: "English",
			moment: "en",
			defaultMomentFormat: "MMMM Do YYYY",
			default: true,
			aliases: [
				"English",
				"en",
				"en-us",
				"en_us",
				"en_US"
			]
		},
		{
			name: "fr-FR",
			nativeName: "Français",
			defaultMomentFormat: "Do MMMM YYYY",
			moment: "fr",
			default: false,
			aliases: [
				"French",
				"français",
				"francais",
				"fr",
				"fr_fr"
			]
		},
	],
	database: {
        user: 'USER',
        host: "HOST",
        database: "DATABASE",
        password: 'PASSWORD',
        port: 5432
    },
    color: {
		red: "#FF0000",
		green: "#32CD32",
		yellow: "#F4EA22",
		purple: "8603F8",
		blue: "#099CFE",
		orange: "#FEA109"
	},
	enabled: true,
	version: 2.2,
	badwords: ["fuck", "pute", "putain", "bitch", "enculé", "encule", "connard", "pd", "fdp", "fils de chien", "fils de pute", "salope"]
};