/* Filename: trainerDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'trainers' collection.
 */

module.exports = (mongoose) => { 
    const Schema = mongoose.Schema;

    const TrainerSchema = new Schema({
        name: { type: String, unique: true, required: true },
        pokemon: [{ type: ObjectId, ref: 'Pokemon' }], 
        party: [{ type: ObjectId, ref: 'Pokemon' }], 
        battle: { type: ObjectId, ref: 'Battle' }
    });

    // Preparing exports
    var exports = { 
        Trainer : mongoose.model('Trainer', TrainerSchema)
    };

    return exports;
};

