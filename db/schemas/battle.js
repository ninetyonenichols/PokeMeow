/* Filename: battleDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'battles' collection.
 */

module.exports = (mongoose) => { 
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;

    // Ongoing battles
    const BattleSchema = new Schema({
        trainer1: {type: ObjectId, ref: 'Trainer', unique: true},
        trainer2: {type: ObjectId, ref: 'Trainer', unique: true},
        currTurn: {type: ObjectId, ref: 'Trainer', unique: true}
    });

    // Preparing exports
    var exports = { 
        Battle : mongoose.model('Battle', BattleSchema)
    };

    return exports;
};
