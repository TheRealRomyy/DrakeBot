module.exports = async (client) => {

    client.db.pool.query("SELECT * FROM guilds").then(guilds => {
        guilds.rows.forEach(async guild => {

            if(!client.guilds.cache.get(guild.id)) return;

            class Guild {
                id = guild.id;
            }

            guild.save = async (data) => {
                if (!data) data = await client.cache.guilds.get(guild.id);
                if (!data) throw new Error("This guild isn't in the cache.");

                let dGuild = await client.db.pool.query("SELECT * FROM guilds WHERE id=$1", [data.id]);
                dGuild = dGuild.rows[0];

                Object.keys(dGuild).forEach(async d => {
                    if (dGuild[d] !== data[d]) {
                        await client.db.pool.query(`UPDATE guilds SET ${d}=$1 WHERE id=$2`, [data[d], data.id]).catch(e => e);
                        dGuild[d] = data[d];
                    }
                })

                dGuild.save = data.save;
                client.cache.guilds.set(guild.id, dGuild);
            }

            return client.cache.guilds.set(guild.id, guild);
        })
    })

    client.db.pool.query("SELECT * FROM users").then(users => {
        users.rows.forEach(async user => {

            if(!client.users.cache.get(user.id)) return;

            class User {
                id = user.id;
            }

            user.save = async (data) => {
                if (!data) data = await client.cache.users.get(user.id);
                if (!data) throw new Error("This user isn't in the cache.");

                let dGuild = await client.db.pool.query("SELECT * FROM users WHERE id=$1", [data.id]);
                dGuild = dGuild.rows[0];

                Object.keys(dGuild).forEach(async d => {
                    if (dGuild[d] !== data[d]) {
                        await client.db.pool.query(`UPDATE users SET ${d}=$1 WHERE id=$2`, [data[d], data.id]).catch(e => e);
                        dGuild[d] = data[d];
                    }
                })

                dGuild.save = data.save;
                client.cache.users.set(user.id, dGuild);
            }

            return client.cache.users.set(user.id, user);
        })
    })

    client.db.pool.query("SELECT * FROM members").then(members => {
        members.rows.forEach(async user => {

            const guild = client.guilds.cache.get(user.guildid);

            if(!guild) return;
            if(!guild.members.cache.get(user.id)) return;

            class Member {
                id = user.id;
                guild = user.guildid
            }

            user.save = async (data) => {
                if (!data) data = await client.cache.members.get(user.guildid + user.id);
                if (!data) throw new Error("This member isn't in the cache.");

                let dGuild = await client.db.pool.query("SELECT * FROM members WHERE id=$1 AND guildid=$2", [data.id, data.guildid]);
                dGuild = dGuild.rows[0];

                Object.keys(dGuild).forEach(async d => {
                    if (dGuild[d] !== data[d]) {
                        await client.db.pool.query(`UPDATE members SET ${d}=$1 WHERE id=$2 AND guildid=$3`, [data[d], data.id, data.guildid]).catch(e => e);
                        dGuild[d] = data[d];
                    }
                })

                dGuild.save = data.save;
                client.cache.members.set(user.guildid + user.id, dGuild);
            }

            return client.cache.members.set(user.guildid + user.id, user);
        })
    })
}