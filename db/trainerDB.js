/* Filename: trainerDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'trainers' collection.
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

const TrainerSchema = new Schema({
    name: { type: String, unique: true, required: true },
    pokemon: [{ type: ObjectId, ref: 'Pokemon' }], 
    party: [{ type: ObjectId, ref: 'Pokemon' }], 
    battle: { type: ObjectId, ref: 'Battle' }
});
const Trainer = mongoose.model('Trainer', TrainerSchema);
