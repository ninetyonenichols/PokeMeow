/* Filename: pokemonDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'pokemon' collection.
 */

module.exports = (mongoose) => { 
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

    // Preparing exports
    var exports = { 
        Pokemon : mongoose.model('Pokemon', PokemonSchema, 'pokemon')
    };

    return exports;
};

