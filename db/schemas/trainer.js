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
        photo: { type: String, default: '../avatars/default.jpg' },
        pokemon: [ PokemonSchema ],
        party: [ PokemonSchema ],
        battle: { type: ObjectId, ref: 'Battle' }
    });

    // Creates a new trainer document
    TrainerSchema.statics.create = (trainerName) => {
        return new mongoose.model('Trainer')({
            name: trainerName
        });
    }

    // Adds a pokemon to this trainer's collection
    TrainerSchema.methods.addPokemon = (pokemon) => {
        this.pokemon.push(pokemon);
    }

    // Adds a pokemon to this trainer's party
    TrainerSchema.methods.addParty = (pokemon) => {
        if (trainer.party.length < MAX_PARTY_SIZE) this.party.push(pokemon);
    }

    // Removes a pokemon from this trainer's party
    TrainerSchema.methods.removeParty = (pokemon) => {
        const index = this.party.indexOf(pokemon);
        if (index > -1) { this.party.splice(index, 1); }
    }

    // Sets a reference to the battle that this trainer is currently fighting
    TrainerSchema.methods.setBattle = (battle) => {
        this.battle = battle;
    }

    return mongoose.model('Trainer', TrainerSchema);
};
