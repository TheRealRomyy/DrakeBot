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
					dataMember.save();
					return null;
				});

				const guildData = await client.db.findOrCreateGuild(guild);
				guild.data = guildData;
				
				let muteRole = member.guild.roles.cache.find(r => r.name === 'Drake - Mute');

				member.roles.remove(muteRole);

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
				await dataMember.save();
			});
		}, 1000);
	}
};