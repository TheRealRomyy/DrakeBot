const path = require("path");

module.exports = class Command {
	constructor(client, {
		name = null,
		aliases = new Array(),
		dirname = false,
		enabled = true,
		botPerms = new Array(),
		userPerms = new Array(),
		cooldown = 3,
		restriction = new Array(),
		slashCommandOptions = null
	})
	{
		const category = (dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length-1, 10)] : "Other");
		this.client = client;
		this.settings = { enabled, userPerms, botPerms, cooldown, restriction};
		this.help = { name, category, aliases };
		this.slashCommandOptions = slashCommandOptions && {
            name,
            options: slashCommandOptions.options || [],
            description: slashCommandOptions.description
        };
	}
};