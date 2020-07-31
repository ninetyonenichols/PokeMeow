/* Filename: moveDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'moves' collection.
 */

module.exports = (mongoose) => { 
    const Schema = mongoose.Schema;

    const MoveSchema = new Schema({
        name: { type: String, unique: true, required: true },
        type: { type: ObjectId, ref: 'Type', required: true },
        baseDmg: { type: Number, required: true }
    });

    // Preparing exports
    var exports = { 
        Move : mongoose.model('Move', MoveSchema)
    };

    return exports;
};
