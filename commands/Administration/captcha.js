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
            restriction: []
        });
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
			  });
			const captchaLog = await message.guild.channels.create('captcha-logs', {
				type: 'text',
				permissionOverwrites: [
				   {
					 id: message.guild.id,
					 deny: ['VIEW_CHANNEL'],
				  },
				],
			  });
			const noVerifiedRole = await message.guild.roles.create({
				data: {
					name: 'No Verified',
					color: '#000000',
					permissions: []
				}
			});

			await message.guild.channels.cache.forEach((channel) => {
				channel.updateOverwrite(noVerifiedRole, {
					VIEW_CHANNEL: false,
				}).catch((err) => {});
			});
			
			await captcha.updateOverwrite(noVerifiedRole, {
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
};

module.exports = Captcha;