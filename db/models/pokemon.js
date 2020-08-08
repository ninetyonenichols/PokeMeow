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
        moves: [{ type: String, enum: [
            'bugBuzz', 'darkPulse', 'outrage', 'thunderbolt', 'moonblast', 
            'closeCombat', 'flamethrower', 'skyAttack', 'shadowBall',
            'solarBeam', 'earthquake', 'iceBeam', 'hyperBeam', 'sludgeWave',
            'psychic', 'rockSlide', 'flashCannon', 'hydroCannon'
        ]}],
        catchRate: { type: Number, default: 0.6 },
        fleeRate: { type: Number, default: 0.1 },
    });

    PokemonSchema.statics.create = function(pkmnId, callback) {
        mongoose.model('Pokemon').find({ _id: pkmnId })
            .lean()
            .exec((err, pkmnObj) => {
                delete pkmnObj['_id'];
                callback(new mongoose.model('Pokemon')(pkmnObj));
            })
    }; 

    // Generates a new random pokemon
    PokemonSchema.statics.encounter = function(callback) {
        this.countDocuments()
            .exec((err, count) => { 
                if (err) return callback(err); 
                var rand = Math.floor(Math.random() * count); 
                this.findOne()
                    .skip(rand)
                    .lean()
                    .exec((err, pkmnObj) => {
                        delete pkmnObj['_id'];
                        if (pkmnObj['moves'].length != 2) { return; }
                        let mv1 = pkmnObj['moves'][0];
                        console.log('mv1 ' + mv1);
                        let mv2 = pkmnObj['moves'][1];
                        console.log('mv2 ' +  typeof mv2);
                        pkmnObj['moves'] = [mv1, mv2];
                        console.log('mvs ' + pkmnObj.moves);
                        callback(new mongoose.model('Pokemon')(pkmnObj));
                    });
            });
    };

    // Subtracts HP from a pokemon 
    PokemonSchema.methods.subtractHp = function(loss) {
        this.currHp = Math.max(0, this.currHp - loss);
    };

    // Resets a Pokemon's hit-points
    PokemonSchema.methods.resetHp = function() {
        this.currHp = this.maxHp;
    };

    // Attempts to catch this pokemon
    PokemonSchema.methods.attemptCapture = function() {
        let roll = Math.random(); 
        if (roll <= this.catchRate) { return "caught"; }
        else if (roll <= this.catchRate + this.fleeRate) { return "ran"; }
        else { return "missed"; }
    } 

    return mongoose.model('Pokemon', PokemonSchema, 'pokemon');
};
