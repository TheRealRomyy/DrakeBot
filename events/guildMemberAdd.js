const Discord = require("discord.js");
const captchagen = require("captchagen");

module.exports = class {

	constructor (client) {
		this.client = client;
	};

	async run (member) {

		// Guild
		let guild = member.guild;

		// Get le data de la guild
		const guildData = await this.client.db.findOrCreateGuild(guild);
		member.guild.data = guildData;

		if(!guildData.plugins.autorole || !Array.isArray(guildData.plugins.autorole)) guildData.plugins.autorole = [];
		if(!guildData.autoroles) guildData.autoroles = 0;

		// Get le data du member
		const memberData = await this.client.db.findOrCreateMember(member, guild);
		
		if(guildData.fortress) {
			await member.send({
				content: member.guild.translate("moderation/kick:KICK_DM", {
					emoji: "door",
					username: member.user.tag,
					server: guild.name,
					moderator: this.client.user.tag,
					reason: member.guild.translate("misc:FORTRESS_ENABLED")
				})
			}).catch(() => {});
	
			member.kick(member.guild.translate("misc:FORTRESS_ENABLED"))
		};

		// Check l'autorole
		if(guildData.plugins.autorole.length !== 0 && !guildData.plugins.captcha.enabled && !member.user.bot) {
			guildData.plugins.autorole.forEach(role => {
				member.roles.add(role.role);
			});
		};

		// Check le captcha
		if(guildData.plugins.captcha.enabled) {

			this.memberRoles = new Array();

			if(guild.roles.cache.get(guildData.plugins.captcha.role) == "undefined") return;

			if(member.user.bot) return;

			const embed = new Discord.MessageEmbed()
			.setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic:true }))
			.setFooter(this.client.cfg.footer)
			.setColor(this.client.cfg.color.orange)
			.setDescription(member.guild.translate("administration/captcha:WAIT", {
				member: member.user.tag,
				createDate: this.client.functions.printDate(member.user.createdAt),
				time: this.client.functions.printDateFrom(member.user.createdAt),
			}));

			const failEmbed = new Discord.MessageEmbed()
			.setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic:true }))
			.setFooter(this.client.cfg.footer)
			.setColor(this.client.cfg.color.red)
			.setDescription(this.client.emotes["arrow_down"] + "  " +  member.guild.translate("administration/captcha:FAIL", {
				member: member.user.tag
			}));

			const noEmbed = new Discord.MessageEmbed()
			.setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic:true }))
			.setFooter(this.client.cfg.footer)
			.setColor(this.client.cfg.color.red)
			.setDescription(this.client.emotes["arrow_down"] + "  " +  member.guild.translate("administration/captcha:NO", {
				member: member.user.tag	
			}));

			const succesEmbed = new Discord.MessageEmbed()
			.setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic:true }))
			.setFooter(this.client.cfg.footer)
			.setColor(this.client.cfg.color.green)
			.setDescription(this.client.emotes["arrow_up"] + "  " + member.guild.translate("administration/captcha:SUCCES", {
				member: member.user.tag
			}));

			const opt = { 
				filter: (m) => m.author.id === member.id,
				max: 1, 
				time: 120000, 
				errors: [ "time" ] 
			};

			var captcha = captchagen.create();

			captcha.text();
			captcha.height();
			captcha.width();  
			captcha.generate();

			let attachment = new Discord.MessageAttachment(captcha.buffer(), "captcha.png")

			const captchaChannel = guild.channels.cache.get(guildData.plugins.captcha.captchaChannel);
			const captchaLogChannel = guild.channels.cache.get(guildData.plugins.captcha.logCaptchaChannel);
			const captchaRole = guildData.plugins.captcha.role;

			member.roles.add(captchaRole).catch(() => {});

			let msg = await captchaChannel.send({
				content: member.guild.translate("administration/captcha:CAPTCHA", {
					mention: "<@" + member.user.id + ">"
				}), 
				files: [attachment]
			});

			captchaLogChannel.send({
				embeds: [embed]
			});

			await member.roles.cache.forEach(role => {
				if(role.id == captchaRole) return;
				member.roles.remove(role.id).catch(() => {});
				this.memberRoles.push(role.id);
			});

			let collected = await captchaChannel.awaitMessages(opt).catch(() => {})

			if(!collected || !collected.first()) {
				msg.delete().catch(() => {});

				await member.send({
					content: member.guild.translate("moderation/kick:KICK_DM", {
						emoji: "door",
						username: member.user.tag,
						server: guild.name,
						moderator: this.client.user.tag,
						reason: member.guild.translate("administration/captcha:NO_FILL")
					})
				}).catch(() => {});

				member.kick(member.guild.translate("administration/captcha:NO_FILL"))

				return captchaLogChannel.send({
					embeds: [noEmbed]
				});
			}

			let confMessage = collected.first().content;
			collected.first().delete();
			
			if(confMessage.toLowerCase() === captcha.text()) {

				msg.delete().catch(() => {});

				member.roles.remove(captchaRole);

				await this.memberRoles.forEach(role => {
					member.roles.add(role).catch(() => {})
				});

				this.memberRoles = new Array();

				captchaLogChannel.send({
					embeds: [succesEmbed]
				});

				// Autorole system
				if(guildData.plugins.autorole.length !== 0) {
					guildData.plugins.autorole.forEach(role => {
						member.roles.add(role.role);
					});
				};

				// Welcome system
				if(guildData.plugins.welcome.enabled) {
					let welcomeChannel = this.client.channels.cache.get(guildData.plugins.welcome.channel);

					welcomeChannel.send({
						content: guildData.plugins.welcome.message
							.replace("{user}", member.user)
							.replace("{user.nickname}", member.user.username)
							.replace("{inviter}", "Unknow")
							.replace("{guild.name}", guild.name)
							.replace("{guild.members}", guild.memberCount)
					});
				};
			} else {

				msg.delete();

				await member.send({
					content: member.guild.translate("moderation/kick:KICK_DM", {
						emoji: "door",
						username: member.user.tag,
						server: guild.name,
						moderator: this.client.user.tag,
						reason: member.guild.translate("administration/captcha:BAD_FILL")
					})
				}).catch(() => {});

				member.kick(member.guild.translate("administration/captcha:BAD_FILL"));

				captchaLogChannel.send({
					embeds: [failEmbed]
				});
			};
		};

		// Check le système de bienvenue
		if(guildData.plugins.welcome.enabled && !guildData.plugins.captcha.enabled) {
			let channel = this.client.channels.cache.get(guildData.plugins.welcome.channel);

			channel.send({
				content: guildData.plugins.welcome.message
					.replace("{user}", member.user)
					.replace("{user.nickname}", member.user.username)
					.replace("{inviter}", "Unknow")
					.replace("{guild.name}", guild.name)
					.replace("{guild.members}", guild.memberCount)
			});
		};

		if(!guildData.plugins.welcomeDM) guildData.plugins.welcomeDM = null;

		// Check le système de bienvenue en message privés
		if(guildData.plugins.welcomeDM !== null) {
			member.send({
				content: guildData.plugins.welcomeDM
					.replace("{user}", member.user)
					.replace("{guild.name}", guild.name)
					.replace("{guild.members}", guild.memberCount)
			}).catch(() => {});
		};
	};
};