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
        photo: { type: String, default: '../avatars/default.png' },
        pokemon: [ PokemonSchema ],
        party: [ PokemonSchema ],
        active: PokemonSchema,
        battle: { type: ObjectId, ref: 'Battle' },
        encounter: PokemonSchema
    });

    // Create a virtual property 'defeated' that shows whether this trainer 
    // has lost the current battle (i.e. all their pokemon have fainted).
    TrainerSchema.virtual('defeated').get(function() {
        var defeated = true;
        this.party.forEach(function(pkmn) {
            if (!pkmn.fainted) { defeated = false; }
        }) 
        return defeated;
    });

    // Creates a new trainer document
    TrainerSchema.statics.create = function(trainerName) {
        return new mongoose.model('Trainer')({ name: trainerName });
    };

    // Adds a pokemon to this trainer's collection
    TrainerSchema.methods.addPokemon = function(pkmn) {
        if (this.pokemon.includes(pkmn)) { return; }
        this.pokemon.push(pkmn);
    };
     
    // Releases a pokemon into the wild
    TrainerSchema.methods.release = function(pkmn) {
        if (!this.pokemon.includes(pkmn)) { return; }
        if (this.party.includes(pkmn)) { this.removeParty(pkmn); }
        for (i in this.pokemon) {
            if (this.pokemon[i]._id == pkmn._id) {
                delete this.pokemon[i];
                return;
            }
        }
    }

    // Adds a pokemon to this trainer's party
    TrainerSchema.methods.addParty = function(pkmn) {
        var spaceAvail = this.party.length < MAX_PARTY_SIZE;
        var ownsPkmn = this.pokemon.includes(pkmn); 
        var unique = !this.party.includes(pkmn);
        console.log('spaceAvail = ' + spaceAvail);
        console.log('ownsPkmn = ' + ownsPkmn);
        console.log('unique = ' + unique);
        if (spaceAvail && ownsPkmn && unique) {
            this.party.push(pkmn);
            console.log('party inside brackets = ' + this.party);
        }
    };

    // Removes a pokemon from this trainer's party
    TrainerSchema.methods.removeParty = function(pkmn) {
        for (i in this.party) {
            if (this.party[i]._id == pkmn._id) {
                delete this.party[i];
                return;
            }
        }
    };

    // Sets a reference to the battle that this trainer is currently fighting
    TrainerSchema.methods.setBattle = function(newBattle) {
        this.battle = newBattle;
    };
    
    // Adds a pokemon to trainer's party or collection, whichever is appropriate
    TrainerSchema.methods.add = function() {
        var pkmn = this.encounter;
        this.addPokemon(pkmn);
        var spaceAvail = this.party.length < MAX_PARTY_SIZE;
        if (spaceAvail) { this.addParty(pkmn); } 
    } 

    // Sets this trainer's active pokemon
    TrainerSchema.methods.setActive = function(pkmn) {
        this.active = pkmn;
    } 

    // Sends out the next pokemon (intended for AI use)
    TrainerSchema.methods.nextPkmn = function() {
    }

    return mongoose.model('Trainer', TrainerSchema);
};
