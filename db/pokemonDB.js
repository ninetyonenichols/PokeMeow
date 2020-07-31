/* Filename: pokemonDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'pokemon' collection.
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

const PokemonSchema = new Schema({
    name: { type: String, unique: true, required: true },
    type1: { type: ObjectId, ref = 'Type', default: 'normal' },
    type2: { type: ObjectId, ref = 'Type' },
    hp: { type: Number, default: 100 },
    atk: { type: Number, default: 100 },
    def: { type: Number, default: 100 },
    moves: [{ type: ObjectId, ref: 'Move' }],
    catchRate: { type: Number, default: 0.6 }, 
    fleeRate: { type: Number, default: 0 }, 
    shiny: { type: Boolean, default: false },
    shinyRate: { type: Number, default: 0.2 }
});
const Pokemon = mongoose.model('Pokemon', PokemonSchema, 'pokemon');
