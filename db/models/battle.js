/* Filename: battleDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'battles' collection.
 */

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const TrainerSchema = mongoose.model('Trainer').schema;
    const Trainer = mongoose.model('Trainer');

    // Ongoing battles
    const BattleSchema = new Schema({
        trainer1: {type: ObjectId, ref: 'Trainer'},
        trainer2: TrainerSchema
    });

    /*  Description: Creates and returns a new battle document. Will first
     *      delete a battle that the user's trainer is already a part of.
     *  Parameters:
     *      id1 - the _id of the first (user) trainer
     *      name - the 'name' of the second (ai) trainer
     *      callback - the function to call when done. passes in the new battle
     */
    BattleSchema.statics.create = function(id1, name, callback) {
        this.deleteOne({trainer1: id1}, (err, removed) => {
            if (err) console.log(err);
            //make a copy of the trainer with 'name'
            Trainer.copy(name, (aiTrainer) => {
                const battle = new mongoose.model('Battle')({trainer1: id1,
                    trainer2: aiTrainer});

                battle.save(() => {
                    callback(battle);
                });
            });
        });
    }

    return mongoose.model('Battle', BattleSchema);
};
