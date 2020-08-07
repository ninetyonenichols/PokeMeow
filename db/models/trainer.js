/* Filename: trainerDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'trainers' collection.
 */

const MAX_PARTY_SIZE = 6;

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const PokemonSchema = mongoose.model('Pokemon').schema;

    const TrainerSchema = new Schema({
        name: { type: String, unique: true, required: true },
        photo: { type: String, default: '../avatars/default.png' },
        pokemon: [ PokemonSchema ],
        party: [ PokemonSchema ],
        battle: { type: ObjectId, ref: 'Battle' },
        encounter: { type: ObjectId, ref: 'Pokemon' }
    });

    // Creates a new trainer document
    TrainerSchema.statics.create = function(trainerName) {
        return new mongoose.model('Trainer')({ name: trainerName });
    };

    // Adds a pokemon to this trainer's collection
    TrainerSchema.methods.addPokemon = function(pkmn) {
        this.pokemon.push(pkmn);
    };

    // Adds a pokemon to this trainer's party
    TrainerSchema.methods.addParty = function(pkmn) {
        if (this.party.length < MAX_PARTY_SIZE) this.party.push(pkmn);
    };

    // Removes a pokemon from this trainer's party
    TrainerSchema.methods.removeParty = function(pkmn) {
        for (i in this.party) {
            if (this.party[i]._id == pkmn._id) {
                delete this.party[i];
            }
        }
    };

    // Sets a reference to the battle that this trainer is currently fighting
    TrainerSchema.methods.setBattle = function(newBattle) {
        this.battle = newBattle;
    };

    return mongoose.model('Trainer', TrainerSchema);
};
