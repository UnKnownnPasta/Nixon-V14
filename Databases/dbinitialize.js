const { Sequelize, DataTypes, Model } = require('sequelize')

const customBots = new Sequelize({
	dialect: 'sqlite',
    logging: false,
	storage: './Databases/customBots.sqlite'
})

const karmaDB = new Sequelize({
	dialect: 'sqlite',
    logging: false,
	storage: './Databases/karmaDB.sqlite',
})

const classicDB = new Sequelize({
	dialect: 'sqlite',
    logging: false,
	storage: './Databases/snipeafk.sqlite'
})

try {
    customBots.authenticate();
    karmaDB.authenticate();
    console.log('(sequelize) Connection has been established successfully.');
  } catch (error) {
    console.error('(sequelize) Unable to connect to the database:', error);
}

// class Bots extends Model {}
// class CBProfile extends Model {}
// class Cmds extends Model {}

customBots.define('Bots', {
    user_id: {
        type: DataTypes.INTEGER,
        unique: true
    },
	name: { type: DataTypes.STRING },
	avatarurl: { type: DataTypes.STRING },
    prefix: { type: DataTypes.STRING },
    test_cmd: { type: DataTypes.STRING },
    test_resp: { type: DataTypes.STRING },
}, {
    timestamps: false
});

customBots.define('CBProfiles', {
    user_id: {
        type: DataTypes.INTEGER,
        unique: true
    },
    quoteCmd: { type: DataTypes.STRING },
    weatherCmd: { type: DataTypes.STRING },
    embedFeature: { type: DataTypes.STRING },
    featureCmd: { type: DataTypes.STRING }
}, {
    timestamps: false
})

customBots.define('Cmds', {
    user_id: {
        type: DataTypes.INTEGER,
        unique: true
    },
    cmd_name: { type: DataTypes.STRING },
    cmd_response: { type: DataTypes.STRING },
    has_embed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    embed_data: {
        type: DataTypes.JSON,
        defaultValue: '{"description":"No Embed Data.","color":2105893}',
        allowNull: true
    },
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
}, {
    timestamps: false
})

karmaDB.define('Karmas', {
    user_id: {
        type: DataTypes.STRING,
        unique: true
    }, 
    balance: { type: DataTypes.INTEGER },
    prestige: { type: DataTypes.INTEGER },
    multiplier: { type: DataTypes.FLOAT },
    prestigePercent: { type: DataTypes.FLOAT },
    prestigeReq: { type: DataTypes.FLOAT },
    prestigeEmojis: { type: DataTypes.STRING, defaultValue: '◾◽' }
}, {
    timestamps: false
})

classicDB.define('editSnipes', {
    user_id: {
        type: DataTypes.STRING,
        unique: true
    }, 
    content: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING },
    avatarurl: { type: DataTypes.STRING },
    channelId: { type: DataTypes.STRING }
}, {
    timestamps: false
})

classicDB.define('snipes', {
    user_id: {
        type: DataTypes.STRING,
        unique: true
    }, 
    content: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING },
    avatarurl: { type: DataTypes.STRING },
    channelId: { type: DataTypes.STRING }
}, {
    timestamps: false
})

classicDB.define('afks', {
    user_id: {
        type: DataTypes.STRING,
        unique: true
    }, 
    message: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN }
}, {
    timestamps: false
})

if (1 == 1) {
    (async () => {
        await customBots.sync();
        console.log('(sequelize) Synced DB [1/3]')
        await karmaDB.sync();
        console.log('(sequelize) Synced DB [2/3]')
        await classicDB.sync()
        console.log('(sequelize) Synced DB [3/3]')
    })();
}

module.exports = { karmaDB, customBots, classicDB }
