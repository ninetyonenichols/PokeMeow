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

    // Create a virtual property 'defeated' that shows whether this trainer
    // has lost the current battle (i.e. all their pokemon have fainted).
    TrainerSchema.virtual('defeated').get(function() {
        var defeated = true;
        this.party.forEach(function(pkmn) {
            if (!pkmn.fainted) { defeated = false; }
        });
        return defeated;
    });

    // Creates a new trainer document
    TrainerSchema.statics.create = function(trainerName) {
        var trainer = new mongoose.model('Trainer')({ name: trainerName });
        return trainer;
    };

    // Adds a pokemon to this trainer's collection
    TrainerSchema.methods.addPokemon = function(pkmn) {
        this.pokemon.push(pkmn);
        this.save();
    };

    // Releases a pokemon into the wild
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

    // Adds a pokemon to this trainer's party
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

    // Removes a pokemon from this trainer's party
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

    // Sets a reference to the battle that this trainer is currently fighting
    TrainerSchema.methods.setBattle = function(newBattle) {
        this.battle = newBattle._id;
        this.active = 0;
        this.resetAll();
        this.save();
    };

    // Adds a pokemon to trainer's party or collection, whichever is appropriate
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

    // Sets this trainer's active pokemon
    TrainerSchema.methods.setActive = function(num) {
        this.active = num;
        this.save();
    }

    TrainerSchema.methods.getActive = function() {
        return this.party[this.active];
    }

    TrainerSchema.methods.switchActive = function(name) {
        for (let i = 0; i < this.party.length; i++) {
            const poke = this.party[i];
            if (poke.name == name && !(poke.fainted)) {
                this.setActive(i);
                return true;
            }
        }

        return false;
    }

    // Sends out the next pokemon (tries to use only non-fainted pokemon first)
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

    TrainerSchema.methods.subtractHp = function(dmg) {
        this.party[this.active].subtractHp(dmg);
    }

    // Resets all this trainer's party-pokemon back to full health
    TrainerSchema.methods.resetAll = function() {
        this.party.forEach(function(pkmn) { pkmn.resetHp(); });
    }

    return mongoose.model('Trainer', TrainerSchema);
};
