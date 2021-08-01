module.exports = {
    
	/**
     * Checking if voter role has expire (3 days);
     * @param { Object } client The Discord Client instance
    */
	
	async init(client) {

        setInterval(async () => {
            const dataClient = await client.db.findOrCreateClient(client.user.id);

            dataClient.save = async (data) => {
                if(!data) data = await client.cache.master.get(client.user.id)
                if(!data) throw new Error("This master isn't in the cache.");
        
                let dGuild = await client.db.pool.query("SELECT * FROM master WHERE id=$1", [data.id]);
                let gData = await client.db.pool.query(`SELECT * FROM master WHERE id='${client.user.id}'`);
                dGuild = dGuild.rows[0];
        
                Object.keys(dGuild).forEach(async d => {
                    if(dGuild[d] !== data[d]) {
                        await client.db.pool.query(`UPDATE master SET ${d}=$1 WHERE id=$2`, [data[d], data.id]).catch(e => e);
                        dGuild[d] = data[d];
                    };
                });
        
                dGuild.save = data.save;
                client.cache.master.set(gData.rows[0].id, dGuild);
            };

            dataClient.voter.forEach(vote => {
                if(vote.expire <= Date.now()) {
                    let member = client.guilds.cache.get("756915711250792560").members.cache.get(vote.voterId); // 756915711250792560 = DrakeBot Support
                    if(member != null) member.roles.remove("827891844901765171", "Auto remove").catch(() => {}); // 827891844901765171 = Voter Role
                    dataClient.voter = dataClient.voter.filter((voteDel) => voteDel.voterId !== vote.voterId);
                }
            });


        }, 1000);
    }
};