const Command = require("../../structure/Commands.js");

class Captcha extends Command {

    constructor(client) {
        super(client, {
            name: "captcha",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "ADMINISTRATOR" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 5,
            restriction: [],

			slashCommandOptions: {
				description: "Enable or disable captcha"
			}
        })
    };

    async run(message, args, data) {

        let client = this.client;

        if(data.guild.plugins.captcha.enabled) {

			if(message.guild.channels.cache.get(data.guild.plugins.captcha.captchaChannel)) message.guild.channels.cache.get(data.guild.plugins.captcha.captchaChannel).delete();
			if(message.guild.channels.cache.get(data.guild.plugins.captcha.logCaptchaChannel)) message.guild.channels.cache.get(data.guild.plugins.captcha.logCaptchaChannel).delete();
			if(message.guild.roles.cache.get(data.guild.plugins.captcha.role)) message.guild.roles.cache.get(data.guild.plugins.captcha.role).delete();
			
			data.guild.plugins.captcha = {
				enabled: false,
				captchaChannel: null,
				logCaptchaChannel: null,
				role: null,
			};
			
			await data.guild.save();
	
			return message.drake("administration/captcha:DISABLED", {
                emoji: "succes"
            });
	
		} else {
			
			const captcha = await message.guild.channels.create('captcha', {
				type: 'text',
				permissionOverwrites: [
					{
						id: message.guild.id,
						deny: ['VIEW_CHANNEL'],
					},
				],
				reason: "Captcha enabled"
			  });
			const captchaLog = await message.guild.channels.create('captcha-logs', {
				type: 'text',
				permissionOverwrites: [
					{
						id: message.guild.id,
						deny: ['VIEW_CHANNEL'],
					},
				],
				reason: "Captcha enabled"
			  });

			const noVerifiedRole = await message.guild.roles.create({
				name: 'No Verified',
				color: '#000000',
				permissions: [],
				reason: "Captcha enabled"
			});

			await message.guild.channels.cache.forEach((channel) => {
				channel.permissionOverwrites.edit(noVerifiedRole, {
					VIEW_CHANNEL: false,
				}).catch((err) => {});
			});
			
			await captcha.permissionOverwrites.edit(noVerifiedRole, {
				VIEW_CHANNEL: true,
				READ_MESSAGE_HISTORY: true,
			}).catch((err) => {});
	
			data.guild.plugins.captcha = {
				enabled: true,
				captchaChannel: captcha.id,
				logCaptchaChannel: captchaLog.id,
				role: noVerifiedRole.id,
			};
			
			await data.guild.save();
	
			return message.drake("administration/captcha:ENABLED", {
				emoji: "succes"
			});
        };
    };

	async runInteraction(interaction, data) {

        let client = this.client;

        if(data.guild.plugins.captcha.enabled) {

			if(interaction.guild.channels.cache.get(data.guild.plugins.captcha.captchaChannel)) interaction.guild.channels.cache.get(data.guild.plugins.captcha.captchaChannel).delete();
			if(interaction.guild.channels.cache.get(data.guild.plugins.captcha.logCaptchaChannel)) interaction.guild.channels.cache.get(data.guild.plugins.captcha.logCaptchaChannel).delete();
			if(interaction.guild.roles.cache.get(data.guild.plugins.captcha.role)) interaction.guild.roles.cache.get(data.guild.plugins.captcha.role).delete();
			
			data.guild.plugins.captcha = {
				enabled: false,
				captchaChannel: null,
				logCaptchaChannel: null,
				role: null,
			};
			
			await data.guild.save();
	
			interaction.reply({
				content: interaction.drakeWS("administration/captcha:DISABLED", {
                	emoji: "succes"
            	})
			});
	
		} else {
			
			const captcha = await interaction.guild.channels.create('captcha', {
				type: 'text',
				permissionOverwrites: [
					{
						id: interaction.guild.id,
						deny: ['VIEW_CHANNEL'],
					},
				],
				reason: "Captcha enabled"
			  });
			const captchaLog = await interaction.guild.channels.create('captcha-logs', {
				type: 'text',
				permissionOverwrites: [
					{
						id: interaction.guild.id,
						deny: ['VIEW_CHANNEL'],
					},
				],
				reason: "Captcha enabled"
			  });

			const noVerifiedRole = await interaction.guild.roles.create({
				name: 'No Verified',
				color: '#000000',
				permissions: [],
				reason: "Captcha enabled"
			});

			await interaction.guild.channels.cache.forEach((channel) => {
				channel.permissionOverwrites.edit(noVerifiedRole, {
					VIEW_CHANNEL: false,
				}).catch((err) => {});
			});
			
			await captcha.permissionOverwrites.edit(noVerifiedRole, {
				VIEW_CHANNEL: true,
				READ_MESSAGE_HISTORY: true,
			}).catch((err) => {});
	
			data.guild.plugins.captcha = {
				enabled: true,
				captchaChannel: captcha.id,
				logCaptchaChannel: captchaLog.id,
				role: noVerifiedRole.id,
			};
			
			await data.guild.save();
	
			interaction.reply({
				content: interaction.drakeWS("administration/captcha:ENABLED", {
					emoji: "succes"
				})
			});
        };
    };
};

module.exports = Captcha;