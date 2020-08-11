/* Filename: db.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file acts as a controller for the whole database. There
 * 	will be many separate scripts that control small portions of the database,
 * 	and this script will make calls to all of them as needed.
 */

// setting up connection to database
const mongoose = require('mongoose');
const mongoDBURL = 'mongodb://127.0.0.1/pokemeow';
mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// importing scripts for each separate collection
// note: to access the Account model, type "account.Account"
exports.battle = require('./models/battle.js')(mongoose);
exports.move = require('./models/move.js')(mongoose);
exports.pokemon = require('./models/pokemon.js')(mongoose);
exports.trainer = require('./models/trainer.js')(mongoose);
exports.vs = require('./data/versus.js').versus;
exports.account = require('./models/account.js')(exports.trainer, mongoose);
