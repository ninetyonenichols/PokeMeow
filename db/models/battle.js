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
        trainer1: {type: ObjectId, ref: 'Trainer'},
        trainer2: {type: ObjectId, ref: 'Trainer'}
    });

    // Createes and returns a new battle document
    BattleSchema.statics.create = function(id1, id2, callback) {
        this.deleteOne({trainer1: id1}, (err, removed) => {
            if (err) console.log(err);
            const btl = new mongoose.model('Battle')({trainer1: id1, trainer2: id2});
            btl.save();
            callback(btl);
        });
    }

    return mongoose.model('Battle', BattleSchema);
};
