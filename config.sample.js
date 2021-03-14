module.exports = {
	token: "TOK3N",
    prefix: "d!",
	footer: "DrakeBot | 2021",
	api: {
		dbl: {
			token: "TOK3N DBL",
			password: "PASSWORD DBL"
		},
	},
	staff: {
		support: [ "591341484721307654", "524615583447384064", ],
		owner: [ "709481084286533773", "654754795336237058", "547514927019982864" ]
	},
	bots: {
		"762965943529766912": ":thumbsup:",
		"710135804714024962": ":thumbsup:",
		"662062221177913354": ":thumbsup:"
	},
	dashboard: {
		port: 80,
		ip: "IP",
		enabled: true,
		name: "drakebot.xyz"
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
        user: 'USER PG',
        host: "IP PG",
        database: "DATABASE PG",
        password: 'PASSWORD PG',
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