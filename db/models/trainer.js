/* Filename: trainerDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'trainers' collection.
 */

const MAX_PARTY_SIZE = 3;

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const PokemonSchema = mongoose.model('Pokemon').schema;

    const TrainerSchema = new Schema({
        name: { type: String, unique: true, required: true },
        photo: { type: String, default: './img/avatars/default.png' },
        pokemon: [ PokemonSchema ],
        party: [ PokemonSchema ],
        active: { type: Number, default: 0 },
        battle: { type: ObjectId, ref: 'Battle', default: null },
        encounter: PokemonSchema
    });

    /*  Description: A virtual 'get' property that returns true if all pokemon
     *      in the trainer's party have 0 currHp, and false otherwise.
     *  Parameters: none.
     */
    TrainerSchema.virtual('defeated').get(function() {
        var defeated = true;
        this.party.forEach(function(pkmn) {
            if (!pkmn.fainted) { defeated = false; }
        });
        return defeated;
    });

    /*  Description: Create a new Trainer document with name = 'trainerName'
     *      and return it.
     *  Parameters:
     *      trainerName - the name of the trainer
     */
    TrainerSchema.statics.create = function(trainerName) {
        var trainer = new mongoose.model('Trainer')({ name: trainerName });
        return trainer;
    };

    /*  Description: Create a new trainer document by copying the trainer named
     *      'name'. Does not save it to the database.
     *  Parameters:
     *      name - the name of the trainer
     *      callback - the callback to use when completed
     */
    TrainerSchema.statics.copy = function(name, callback) {
        this.findOne({name: name})
        .lean()
        .exec((err, trainerObj) => {
            delete trainerObj['_id'];
            let newParty = [];
            for (let p of trainerObj.party) {
                newParty.push(mongoose.model('Pokemon').copy(p))
            }
            trainerObj.party = [];
            let newTrainer = new mongoose.model('Trainer')(trainerObj);
            newTrainer.party = newParty;
            callback(newTrainer);
        });
    };

    /*  Description: Removes the first pokemon whose name matches 'pkmn',
     *      looking first in the trainer's pokemon, then the party. Returns
     *      true if a pokemon was removed, false otherwise.
     *  Parameters:
     *      pkmn - the name of a pokemon
     */
    TrainerSchema.methods.release = function(pkmn) {
        for (let i = 0; i < this.pokemon.length; i++) {
            if (this.pokemon[i].name == pkmn) {
                this.pokemon.splice(i, 1);
                this.save();
                return true;
            }
        }

        for (let i = 0; i < this.party.length; i++) {
            if (this.party[i].name == pkmn) {
                this.party.splice(i, 1);
                this.save();
                return true;
            }
        }

        return false;
    }

    /*  Description: Adds a pokemon from the trainer's pokemon to the party if
     *      there is room. Returns true if it succeeds, false otherwise.
     *  Parameters:
     *      pkmn - the name of a pokemon
     */
    TrainerSchema.methods.addParty = function(pkmn) {
        for (let i = 0; i < this.pokemon.length; i++) {
            if (this.pokemon[i].name == pkmn) {
                if (this.party.length < MAX_PARTY_SIZE) {
                    this.party.push(this.pokemon[i]);
                    this.pokemon.splice(i, 1);
                    this.save();
                    return true;
                } else {
                    return false;
                }
            }
        }

        return false;
    };

    /*  Description: Removes a pokemon from the party and puts it into the
     *      trainer's pokemon. Returns true on success, false otherwise.
     *  Parameters:
     *      pkmn - the name of a pokemon
     */
    TrainerSchema.methods.removeParty = function(pkmn) {
        for (let i = 0; i < this.party.length; i++) {
            if (this.party[i].name == pkmn) {
                this.pokemon.push(this.party[i]);
                this.party.splice(i, 1);
                this.save();
                return true;
            }
        }

        return false;
    };

    /*  Description: Adds the pokemon in the trainer's encounter property to
    *      the trainer's party or pokemon, whichever is appropriate. Then it
    *      saves the trainer.
    *  Parameters: none.
    */
    TrainerSchema.methods.add = function() {
        const pkmn = this.encounter;
        if (this.party.length < MAX_PARTY_SIZE) {
            this.party.push(pkmn);
            this.save();
        } else {
            this.pokemon.push(pkmn);
            this.save();
        }
    }

    /*  Description: Sets a reference to a battle and prepares the trainer for
     *      battle by setting their active pokemon to be the first in the party
     *      and resetting all of their party pokemon's currHp to full. Then it
     *      saves the trainer.
     *  Parameters:
     *      newBattle - the newly created battle object
     */
    TrainerSchema.methods.setBattle = function(newBattle) {
        this.battle = newBattle._id;
        this.active = 0;
        this.resetAll();
        this.save();
    };

    /*  Description: Returns the pokemon that is at position 'active' in the
     *      trainer's party.
     *  Parameters: none.
     */
    TrainerSchema.methods.getActive = function() {
        return this.party[this.active];
    }

    /*  Description: Searches the party for the pokemon matching 'name' and
     *      sets that pokemon to be active if it is not fainted (hp != 0).
     *      Saves the trainer and returns true on success, false otherwise.
     *  Parameters:
     *      name - the name of a pokemon
     */
    TrainerSchema.methods.switchActive = function(name) {
        for (let i = 0; i < this.party.length; i++) {
            const poke = this.party[i];
            if (poke.name == name && !(poke.fainted)) {
                this.active = i;
                this.save();
                return true;
            }
        }

        return false;
    }

    /*  Description: Sends out the next pokemon (tries to use only non-fainted
     *      pokemon first) by setting 'active' to the appropriate pokemon and
     *      then saving.
     *  Parameters: none.
     */
    TrainerSchema.methods.nextPkmn = function() {
        let poke;
        for (let i = 0; i < this.party.length; i++) {
            poke = this.party[i];

            if (!(poke.fainted)) {
                this.active = i;
                this.save();
                return poke;
            }
        }

        //didn't find a non-fainted pokemon, so set it to the first pokemon
        this.active = 0;
        this.save();
        return this.party[this.active];
    }

    /*  Description: Calls pokemon.subtractHp on the active pokemon to subtract
     *      'dmg' from the pokemon's currHp without dropping below zero.
     *  Parameters:
     *      dmg - a number representing the damage to the pokemon
     */
    TrainerSchema.methods.subtractHp = function(dmg) {
        this.getActive().subtractHp(dmg);
    }

    /*  Description: Resets all this trainer's party-pokemon back to full
     *      health.
     *  Parameters: none.
     */
    TrainerSchema.methods.resetAll = function() {
        this.party.forEach(function(pkmn) { pkmn.resetHp(); });
    }

    /*  Description: Sets the 'photo' property to be a path to a photo 'name'
     *      in the public_html/img/avatars directory.
     *  Parameters:
     *      name - the name of the photo
     */
    TrainerSchema.methods.setPhoto = function(name) {
        this.photo = './img/avatars/' + name;
        this.save();
    }

    // Return/Export the Trainer model
    return mongoose.model('Trainer', TrainerSchema);
};
