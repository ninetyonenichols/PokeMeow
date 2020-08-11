/* Filename: moveDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'moves' collection.
 */

const vs = require('../data/versus.js');
const stab_bonus = 1.2;

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;

    const MoveSchema = new Schema({
        name: { type: String, unique: true, required: true, enum: [
            'bugBuzz', 'darkPulse', 'outrage', 'thunderbolt', 'moonblast',
            'closeCombat', 'flamethrower', 'skyAttack', 'shadowBall',
            'solarBeam', 'earthquake', 'iceBeam', 'hyperBeam', 'sludgeWave',
            'psychic', 'rockSlide', 'flashCannon', 'hydroCannon'
        ]},
        pType: {
            type: String,
            enum: [ 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
                'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal',
                 'poison', 'psychic', 'rock', 'steel', 'water' ],
            default: 'normal'
        },
        baseDmg: { type: Number, required: true }
    });

    // Calculates the damage done by this move from pkmn1 against pkmn2
    // Damage = Floor ((1/2)(movepower)(att/def)(STAB)(Effectiveness)) + 1
    MoveSchema.statics.damage = function(moveName, attacker, defender, cb) {
        db.model('Move').findOne({ name: moveName })
        .exec((err, move) => {
            if (move) {
                let mvDmg = move.baseDmg;
                let atk = attacker.atk;
                let def = defender.def;
                let mvType = move.pType;
                let stab = (mvType == attacker.pType1 || mvType == attacker.pType2) ?
                stab_bonus : 1;
                let effectiveness = vs[defender.pType1][mvType] *
                vs[defender.pType2][mvType];
                let result = Math.floor(0.5 * mvDmg * (atk / def) * stab * effectiveness);
                cb(result);
            } else {
                cb(null);
            }
        });
    }

    //getMove: function(move, callback) {}

    return mongoose.model('Move', MoveSchema)
};
