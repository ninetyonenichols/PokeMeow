/* Filename: typeDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'types' collection.
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

const TypeSchema = new Schema({
    name: { 
        type: String, 
        unique: true, 
        required: true, 
        enum: [ 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 
            'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal',
             'poison', 'psychic', 'rock', 'steel', 'water' ]
    },
    weakness: [{ type: ObjectId, ref: 'Type' }],
    resistance: [{ type: ObjectId, ref: 'Type' }]
});
const Type = mongoose.model('Type', TypeSchema);
