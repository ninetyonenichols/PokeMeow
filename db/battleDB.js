/* Filename: battleDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'battles' collection.
 */

const mongoose = require('mongoose');

// Connect to the database
const mongoDBURL = 'mongodb://127.0.0.1/pokemeow';
mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
//get the connection object
const db = mongoose.connection;
//set up connection error reporting
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Set up our database structure
const Schema = mongoose.Schema;

const BattleSchema = new Schema({
	trainer1: {type: ObjectId, ref: 'Trainer', unique: true},
	trainer2: {type: ObjectId, ref: 'Trainer', unique: true},
	currTurn: {type: ObjectId, ref: 'Trainer', unique: true}
});
const Battle = mongoose.model('Battle', BattleSchema);
