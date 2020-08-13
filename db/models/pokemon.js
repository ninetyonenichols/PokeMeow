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
        sprite: { type: String, default: '../../public_html/img/sprites/default.jpg' },
        pType1: {
            type: String,
            enum: [ 'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting',
                'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal',
                 'Poison', 'Psychic', 'Rock', 'Steel', 'Water' ],
            default: 'Normal'
        },
        pType2: {
            type: String,
            enum: [ 'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting',
                'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal',
                 'Poison', 'Psychic', 'Rock', 'Steel', 'Water' ],
        },
        maxHp: { type: Number, default: 100 },
        currHp: { type: Number, default: 100 },
        atk: { type: Number, default: 100 },
        def: { type: Number, default: 100 },
        moves: [{ type: String, enum: [
            'Bug Buzz', 'Dark Pulse', 'Outrage', 'Thunderbolt', 'Moonblast',
            'Close Combat', 'Flamethrower', 'Sky Attack', 'Shadow Ball',
            'Solar Beam', 'Earthquake', 'Ice Beam', 'Hyper Beam', 'Sludge Wave',
            'Psychic', 'Rock Slide', 'Flash Cannon', 'Hydro Cannon'
        ]}],
        catchRate: { type: Number, default: 0.6 },
        fleeRate: { type: Number, default: 0.1 },
    });

    /*  Description: A virtual 'get' property that returns true if the pokemon
     *      has 0 currHp, and false otherwise.
     *  Parameters: none.
     */
    PokemonSchema.virtual('fainted').get(function() {
        return this.currHp == 0;
    });

    /*  Description: Returns a new pokemon document using the callback after
     *      finding a random pokemon in the database and copying it.
     *  Parameters:
     *      callback - the function to call with the new pokemon
     */
    PokemonSchema.statics.encounter = function(callback) {
        this.countDocuments()
            .exec((err, count) => {
                if (err) return callback(err);
                var rand = Math.floor(Math.random() * count);
                this.findOne()
                    .skip(rand)
                    .lean()
                    .exec((err, pkmnObj) => {
                        const newPkmn = this.copy(pkmnObj);
                        if (newPkmn) {
                            callback(newPkmn);
                        }
                    });
            });
    };

    /*  Description: Returns a new pokemon document using the callback after
     *      finding a random pokemon in the database and copying it.
     *  Parameters:
     *      pkmnObj - the lean() pokemon object
     */
    PokemonSchema.statics.copy = function(pkmnObj) {
        delete pkmnObj['_id'];
        if (pkmnObj['moves'].length != 2) { return null; }
        let mv1 = pkmnObj['moves'][0];
        let mv2 = pkmnObj['moves'][1];
        pkmnObj['moves'] = [mv1, mv2];
        return new mongoose.model('Pokemon')(pkmnObj);
    }

    // Subtracts HP from a pokemon
    PokemonSchema.methods.subtractHp = function(loss) {
        this.currHp = Math.max(0, this.currHp - loss);
    };

    // Resets a Pokemon's hit-points
    PokemonSchema.methods.resetHp = function() {
        this.currHp = this.maxHp;
    };

    // Attempts to catch this pokemon, and returns the result
    PokemonSchema.methods.attemptCapture = function() {
        let roll = Math.random();
        if (roll <= this.catchRate) { return "caught"; }
        else if (roll <= this.catchRate + this.fleeRate) { return "ran"; }
        else { return "missed"; }
    }

    return mongoose.model('Pokemon', PokemonSchema, 'pokemon');
};
