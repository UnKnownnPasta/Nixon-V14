const { Sequelize, DataTypes, Model } = require('sequelize')

const customBots = new Sequelize({
	dialect: 'sqlite',
    logging: false,
	storage: './Databases/customBots.sqlite'
})

const normDB = new Sequelize({
	dialect: 'sqlite',
    logging: false,
	storage: './Databases/database.sqlite'
})

try {
    customBots.authenticate();
    normDB.authenticate();
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
	avatarurl: {
		type: DataTypes.TEXT,
		unique: true,   
	},
    prefix: { type: DataTypes.STRING },
    test_cmd: { type: DataTypes.STRING },
    test_resp: { type: DataTypes.STRING },
}, {
    timestamps: false
});

customBots.define('CBProfile', {
    user_id: {
        type: DataTypes.INTEGER,
        unique: true
    },
    quoteCmd: { type: DataTypes.STRING },
    weatherCmd: { type: DataTypes.STRING },
    bankCmd: { type: DataTypes.STRING },
    bankBalance: { type: DataTypes.STRING },
    embedFeature: { type: DataTypes.STRING },
    featureCmd: { type: DataTypes.STRING },
    substFeature1: { type: DataTypes.STRING },
    substFeature2: { type: DataTypes.STRING },
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

module.exports = { customBots, normDB }


if (1 == 1) {
    (async () => {
        await customBots.sync();
        console.log('(sequelize) Synced DB [1/2]')
        await normDB.sync();
        console.log('(sequelize) Synced DB [2/2]')
    })();
}
