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
        name: [{ type: String, unique: true, required: true, enum: [
            'Bug Buzz', 'Dark Pulse', 'Outrage', 'Thunderbolt', 'Moonblast',
            'Close Combat', 'Flamethrower', 'Sky Attack', 'Shadow Ball',
            'Solar Beam', 'Earthquake', 'Ice Beam', 'Hyper Beam', 'Sludge Wave',
            'Psychic', 'Rock Slide', 'Flash Cannon', 'Hydro Cannon'
        ]}],
        pType: {
            type: String,
            enum: [ 'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting',
                'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal',
                 'Poison', 'Psychic', 'Rock', 'Steel', 'Water' ],
            default: 'Normal'
        },
        baseDmg: { type: Number, required: true }
    });

    // Calculates the damage done by this move from pkmn1 against pkmn2
    // Damage = Floor ((1/2)(movepower)(att/def)(STAB)(Effectiveness)) + 1
    MoveSchema.statics.damage = function(moveName, attacker, defender, cb) {
        //get the move
        this.findOne({ name: moveName })
        .exec((err, move) => {
            if (move) {
                //set some variables used in the calculation
                let mvDmg = move.baseDmg;
                let atk = attacker.atk;
                let def = defender.def;
                let mvType = move.pType;

                let stab = (mvType == attacker.pType1) ? stab_bonus : 1;
                if (attacker.pType2) {
                    stab = (mvType == attacker.pType2) ? stab_bonus : stab;
                }

                let effectiveness = vs[defender.pType1][mvType];
                if (defender.pType2) {
                    effectiveness = effectiveness * vs[defender.pType2][mvType];
                }

                //calculate the damage and return
                let result = Math.floor(0.5 * mvDmg * (atk / def) * stab * effectiveness);
                console.log(attacker.name + ' used: ' + moveName + ' dealing: ' + result);
                cb(result);

            } else {
                cb(null);
            }
        });
    }

    //getMove: function(move, callback) {}

    return mongoose.model('Move', MoveSchema)
};
