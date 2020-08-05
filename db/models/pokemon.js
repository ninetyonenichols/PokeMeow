/* Filename: pokemonDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'pokemon' collection.
 */

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;

    const PokemonSchema = new Schema({
        name: { type: String, required: true },
        sprite: { type: String, default: '../sprites/default.jpg' },
        pType1: {
            type: String,
            enum: [ 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
                'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal',
                 'poison', 'psychic', 'rock', 'steel', 'water' ],
            default: 'normal'
        },
        pType2: {
            type: String,
            enum: [ 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
                'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal',
                 'poison', 'psychic', 'rock', 'steel', 'water' ],
        },
        maxHp: { type: Number, default: 100 },
        currHp: { type: Number, default: 100 },
        atk: { type: Number, default: 100 },
        def: { type: Number, default: 100 },
        moves: [{ type: ObjectId, ref: 'Move' }],
        catchRate: { type: Number, default: 0.6 },
        fleeRate: { type: Number, default: 0.1 },
    });

    // Creates an 'instance' of a pokemon by copying the data from that
    // pokemon specie's document into a new document.
    PokemonSchema.statics.create = function(specie, callback) {
        var pkmnJSON = mongoose.model('Pokemon').findOne({ name: specie })
            .lean()
            .exec((err, pkmnObj) => {
                delete pkmnObj['_id'];
                callback(new mongoose.model('Pokemon')(pkmnObj));
            })
    }; 

    // Subtracts HP from a pokemon 
    PokemonSchema.methods.subtractHp = function() {
        this.currHp = max(0, this.currHp - loss);
    };

    // Resets a Pokemon's hit-points
    PokemonSchema.methods.resetHp = function() {
        this.currHp = this.maxHp;
    };

    return mongoose.model('Pokemon', PokemonSchema, 'pokemon');
};