/**
 * Checking unbans
 * @param {object} client The Discord Client instance
*/
	
module.exports.checkUnbans = async function checkUnbans(client) {
	let members = await client.db.fetchAllMembers();

	members = members.filter(mem => mem.ban && mem.ban.banned === true);

	members.forEach((member) => {
		client.bannedUsers.set(`${member.id}${member.guildid}`, member);
	});

	setInterval(async () => {
		Array.from(client.bannedUsers.values()).filter((m) => typeof m.ban.endDate != String).filter((m) => m.ban.endDate <= Date.now()).forEach(async (memberData) => {
			const guild = await client.guilds.fetch(memberData.guildid);
			if(!guild) return;

			let dataMember = await client.db.findOrCreateMember(memberData.id, guild);

			const user = await client.users.fetch(memberData.id);

			const guildData = await client.db.findOrCreateGuild(guild);
			guild.data = guildData;
			
			await guild.bans.fetch()
			.then(bans => {
				if(bans.size == 0) return;
				let banUser = bans.find(b => b.user.id === user.id);

				if(!banUser) {
					client.bannedUsers.delete(`${memberData.id}${memberData.guildid}`);
					return;
				};

				guild.members.unban(banUser.user, guild.translate("common:TIMEOUT"));
			});

			const reason = guild.translate("common:TIMEOUT");
			user.send({
				content: guild.translate("moderation/unban:UNBAN_DM", {
					emoji: "unban",
					user: user.username,
					server: guild.name,
					reason: reason,
					moderator: client.user.username
				})
			}).catch(() => {});;

			dataMember.ban = {
				banned: false,
				endDate: null,
				case: null
			};

			if(guildData.plugins.logs.mod) {
				if(!client.channels.cache.get(guildData.plugins.logs.mod)) {
					guildData.plugins.logs.mod = false;
					await guildData.save()
				};
	
				client.functions.sendModLog("unban", user, client.channels.cache.get(guildData.plugins.logs.mod), client.user, guildData.cases, reason);
			};

			client.bannedUsers.delete(`${memberData.id}${memberData.guildid}`);
			await dataMember.save(dataMember);
		});
	}, 1000);
}
    
/**
 * Checking unmutes
 * @param {object} client The Discord Client instance
*/
	
module.exports.checkUnmutes = async function checkUnmutes(client) {
	let members = await client.db.fetchAllMembers();

	members = members.filter(mem => mem.mute.muted === true)

	members.forEach((member) => {
		client.mutedUsers.set(`${member.id}${member.guildid}`, member);
	});

	setInterval(async () => {
		Array.from(client.mutedUsers.values()).filter((m) => m.mute.endDate <= Date.now()).forEach(async (memberData) => {
			const guild = client.guilds.cache.get(memberData.guildid);
			if(!guild) return;

			let dataMember = await client.db.findOrCreateMember(memberData.id, guild);

			const member = guild.members.cache.get(memberData.id) || await guild.members.fetch(memberData.id).catch(() => {
				dataMember.mute = {
					muted: false,
					endDate: null,
					case: null
				};
				dataMember.save(dataMember);
				return null;
			});

			const guildData = await client.db.findOrCreateGuild(guild);
			guild.data = guildData;
			
			let muteRole = member.guild.roles.cache.find(r => r.name === 'Drake - Mute');

			member.roles.remove(muteRole);
			if(member.voiceChannel) await member.voice.setMute(false);

			const reason = guild.translate("common:TIMEOUT");
			member.send({
				content: guild.translate("moderation/mute:UNMUTE_DM", {
					emoji: "unmute",
					username: member.user.username,
					server: member.guild.name,
					reason: reason,
				})
			}).catch(() => {});;

			dataMember.mute = {
				muted: false,
				endDate: null,
				case: null
			};

			if(guildData.plugins.logs.mod) {
				if(!client.channels.cache.get(guildData.plugins.logs.mod)) {
					guildData.plugins.logs.mod = false;
					await guildData.save()
				};
	
				client.functions.sendModLog("unmute", member.user, client.channels.cache.get(guildData.plugins.logs.mod), client.user, guildData.cases, reason);
			};

			client.mutedUsers.delete(`${memberData.id}${memberData.guildid}`);
			await dataMember.save(dataMember);
		});
	}, 1000);
}