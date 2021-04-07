/* MADE BY ANDROZ (https://github.com/Androz2091/AtlantaBot/blob/master/helpers/checkUnmutes.js) */

module.exports = {
    
	/**
     * Starts checking...
     * @param {object} client The Discord Client instance
     */
	
	async init(client) {
		let members = await client.db.fetchAllMembers();

		members = members.filter(mem => mem.mute.muted === true)

		members.forEach((member) => {
			client.mutedUsers.set(`${member.id}${member.guildid}`, member);
		});

		setInterval(async () => {
			client.mutedUsers.array().filter((m) => m.mute.endDate <= Date.now()).forEach(async (memberData) => {
				const guild = client.guilds.cache.get(memberData.guildid);
				if(!guild) return;

				let dataMember = await client.db.findOrCreateMember(memberData.id, guild);

				const member = guild.members.cache.get(memberData.id) || await guild.members.fetch(memberData.id).catch(() => {
					dataMember.mute = {
						muted: false,
						endDate: null,
						case: null
					};
					dataMember.save();
					return null;
				});

				const guildData = await client.db.findOrCreateGuild(guild);
				guild.data = guildData;

				if(member) guild.channels.cache.forEach((channel) => {
					const permOverwrites = channel.permissionOverwrites.get(member.id);
					if(permOverwrites) permOverwrites.delete();
				});
				

				let muteRole = member.guild.roles.cache.find(r => r.name === 'Drake - Mute');

				member.roles.remove(muteRole);

				const reason = guild.translate("common:TIMEOUT");
				member.send(guild.translate("moderation/mute:UNMUTE_DM", {
					emoji: "unmute",
					username: member.user.username,
					server: member.guild.name,
					reason: reason,
				}));

				dataMember.mute = {
					muted: false,
					endDate: null,
					case: null
				};

				if(guildData.plugins.logs.mod) client.functions.sendModLog("unmute", member.user, guildData.plugins.logs.mod, client.user, guildData.cases, reason);

				client.mutedUsers.delete(`${memberData.id}${memberData.guildid}`);
				await dataMember.save();
			});
		}, 1000);
	}
};