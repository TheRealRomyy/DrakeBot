const { Pool } = require('pg');
const { Guild, User, Member, Client } = require("./models.js");
const { Collection } = require('discord.js');
const chalk = require("chalk");

module.exports = class Database {

    constructor(client) {
        this.client = client;
        this.loader = require("./loader.js");

        this.pool = new Pool(this.client.cfg.database);
        this.pool.connect(error => {
            if(error) console.log(chalk.red(chalk.bold("Error: ") + " i can't connect myself to postgres"))
            else console.log(chalk.yellow(chalk.bold("Database: ") + " connected to postgres"))
        });

        // this.createDB = async function() {
        //     await this.pool.query(`CREATE TABLE guilds (id TEXT NOT NULL PRIMARY KEY, names JSON[], plugins JSON, prefix TEXT NOT NULL, language TEXT NOT NULL, symbol TEXT NOT NULL, cases INT, companys JSON[], customcommands JSON[], premium JSON)`);
        //     await this.pool.query(`CREATE TABLE master (id TEXT NOT NULL PRIMARY KEY, count INT, blacklist JSON, drakecoin INT, cours INT)`);
        //     await this.pool.query(`CREATE TABLE members (id TEXT NOT NULL, guildid TEXT NOT NULL, money INT, banksold INT, exp INT, level INT, inventory JSON[], cooldowns JSON, sanctions JSON[], mute JSON)`);
        //     await this.pool.query(`CREATE TABLE users (id TEXT NOT NULL PRIMARY KEY, names JSON[], description TEXT, afk TEXT, reminds JSON[], drakecoin INT)`);
        // };
    };
    
    async fetchGuildMembers (guildID){
        return new Promise(async resolve => {
            const { rows } = await this.pool.query(`
                SELECT * FROM members
                WHERE guildid = '${guildID}';
            `);
            resolve(rows);
        });
    };

    async fetchAllMembers (){
        return new Promise(async resolve => {
            const { rows } = await this.pool.query(`
                SELECT * FROM members;
            `);
            resolve(rows);
        });
    };

    async findOrCreateGuild(guild){
        if(typeof guild === "string") guild = this.client.guilds.cache.get(guild);
        if(this.client.cache.guilds.get(guild.id)) return this.client.cache.guilds.get(guild.id);

        let gData = await this.pool.query(`SELECT * FROM guilds WHERE id='${guild.id}'`);

        if(gData.rows.length === 0){
            await this.pool.query('INSERT INTO guilds (id, names, plugins, prefix, language, symbol, cases, companys, customcommands, premium) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', Guild(guild.id, this.client));
            gData = await this.pool.query(`SELECT * FROM guilds WHERE id=$1`, [guild.id]);		
        };

        gData.rows[0].save = async (data) => {
            if(!data) data = await this.client.cache.guilds.get(gData.rows[0].id);
            if(!data) throw new Error("This guild isn't in the cache.");
    
            let dGuild = await this.pool.query("SELECT * FROM guilds WHERE id=$1", [data.id]);
            dGuild = dGuild.rows[0];
    
            Object.keys(dGuild).forEach(async d => {
                if(dGuild[d] !== data[d]) {
                    await this.pool.query(`UPDATE guilds SET ${d}=$1 WHERE id=$2`, [data[d], data.id]).catch(e => e);
                    dGuild[d] = data[d];
                };
            });
    
            dGuild.save = data.save;
            this.client.cache.guilds.set(gData.rows[0].id, dGuild);
            return data;
        };

        this.client.cache.guilds.set(gData.rows[0].id, gData.rows[0]);
        return gData.rows[0];
    };

    async findOrCreateUser(user){
        if(typeof user === "string") user = client.users.cache.get(user);
        if(this.client.cache.users.get(user.id)) return this.client.cache.users.get(user.id);

        let gData = await this.pool.query(`SELECT * FROM users WHERE id='${user.id}'`);

        if(gData.rows.length === 0) {
            await this.pool.query('INSERT INTO users (id, names, description, afk, reminds, drakecoin) values ($1, $2, $3, $4, $5, $6)', User(user.id));
            gData = await this.pool.query(`SELECT * FROM users WHERE id=$1`, [user.id]);
        };

        gData.rows[0].save = async (data) => {
            if(!data) data = await this.client.cache.users.get(gData.rows[0].id);
            if(!data) throw new Error("This user isn't in the cache.");
    
            let dGuild = await this.pool.query("SELECT * FROM users WHERE id=$1", [data.id]);
            dGuild = dGuild.rows[0];
    
            Object.keys(dGuild).forEach(async d => {
                if(dGuild[d] !== data[d]) {
                    await this.pool.query(`UPDATE users SET ${d}=$1 WHERE id=$2`, [data[d], data.id]).catch(e => e);
                    dGuild[d] = data[d];
                };
            });
    
            dGuild.save = data.save;
            this.client.cache.users.set(gData.rows[0].id, dGuild);
        };

        this.client.cache.users.set(gData.rows[0].id, gData.rows[0]);
        return gData.rows[0];
    };

    async findOrCreateClient(){
        if(this.client.cache.master.get(this.client.user.id)) return this.client.cache.master.get(this.client.user.id)
        let gData = await this.pool.query(`SELECT * FROM master WHERE id='${this.client.user.id}'`);

        if(gData.rows.length === 0) {
            await this.pool.query('INSERT INTO master (id, count, blacklist, drakecoin, cours) values ($1, $2, $3, $4, $5)', Client(this.client.user.id));
            gData = await this.pool.query(`SELECT * FROM master WHERE id=$1`, [this.client.user.id]);
        };

        gData.rows[0].save = async (data) => {
            if (!data) data = await this.client.cache.master.get(this.client.user.id)
            if(!data) throw new Error("This master isn't in the cache.");
    
            let dGuild = await this.pool.query("SELECT * FROM master WHERE id=$1", [data.id]);
            dGuild = dGuild.rows[0];
    
            Object.keys(dGuild).forEach(async d => {
                if(dGuild[d] !== data[d]) {
                    await this.pool.query(`UPDATE master SET ${d}=$1 WHERE id=$2`, [data[d], data.id]).catch(e => e);
                    dGuild[d] = data[d];
                };
            });
    
            dGuild.save = data.save;
            this.client.cache.master.set(gData.rows[0].id, dGuild);
        };

        this.client.cache.master.set(gData.rows[0].id, gData.rows[0])
        return gData.rows[0];
    };

    async findOrCreateMember(user, guild){
        if(typeof user === "string") user = this.client.users.cache.get(user);
        if(typeof guild === "string") guild = this.client.guilds.cache.get(guild);

        if(this.client.cache.members.get(guild.id + user.id)) return this.client.cache.members.get(guild.id + user.id);

        let gData = await this.pool.query(`SELECT * FROM members WHERE id='${user.id}' AND guildid='${guild.id}'`);

        if(gData.rows.length === 0) {
            await this.pool.query('INSERT INTO members (id, guildid, money, bankSold, exp, level, inventory, cooldowns, sanctions, mute) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', Member(user.id, guild.id));
            gData = await this.pool.query(`SELECT * FROM members WHERE id='${user.id}' AND guildid='${guild.id}'`);
        };

        gData.rows[0].save = async (data) => {
            if(!data) data = await this.client.cache.members.get(guild.id + user.id);
            if(!data) throw new Error("This member isn't in the cache.");
    
            let dGuild = await this.pool.query(`SELECT * FROM members WHERE id='${user.id}' AND guildid='${guild.id}'`);
            dGuild = dGuild.rows[0];
    
            Object.keys(dGuild).forEach(async d => {
                if(dGuild[d] !== data[d]) {
                    await this.pool.query(`UPDATE members SET ${d}=$1 WHERE id='${user.id}' AND guildid='${guild.id}'`, [data[d]]).catch(e => e);
                    dGuild[d] = data[d];
                };
            });
    
            dGuild.save = data.save;
            this.client.cache.members.set(guild.id + user.id, dGuild);
        };

        this.client.cache.members.set(guild.id + user.id, gData.rows[0]);
        return gData.rows[0];
    };
};