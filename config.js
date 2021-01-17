module.exports = {
	token: "TOK3N",
    prefix: "d!",
	footer: "DrakeBot | 2021",
	api: {
		dbl: {
			token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc2Mjk2NTk0MzUyOTc2NjkxMiIsImJvdCI6dHJ1ZSwiaWF0IjoxNjA2NjczODc0fQ.C814BmzYEQ2Qvli7sHSsYGcW_gqWAuomGd8VR4xm8fo",
			password: "mouchou"
		},
	},
	staff: {
		support: [ "591341484721307654", "524615583447384064", ],
		owner: [ "709481084286533773", "654754795336237058", "547514927019982864" ]
	},
	dashboard: {
		port: 80,
		ip: "5.196.1.148",
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
        user: 'postgres',
        host: "127.0.0.1",
        database: "drake",
        password: 'mouchou44',
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