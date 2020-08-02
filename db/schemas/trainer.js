/* Filename: trainerDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'trainers' collection.
 */

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;

    const TrainerSchema = new Schema({
        name: { type: String, unique: true, required: true },
        photo: { type: String, default: '../avatars/default.jpg' },
        pokemon: [{ type: ObjectId, ref: 'Pokemon' }],
        party: [{ type: ObjectId, ref: 'Pokemon' }],
        battle: { type: ObjectId, ref: 'Battle' }
    });
    const Trainer = mongoose.model('Trainer', TrainerSchema)

    // Preparing exports
    return {
        create: function(name, callback) {},
        addPokemon: function(pokemon, callback) {},
        removeParty: function(pokemon, callback) {},
        addParty: function(pokemon, callback) {},
        setBattle: function(battle, callback) {}
    };
};
