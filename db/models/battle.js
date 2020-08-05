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

    // Createes and returns a new battle document
    BattleSchema.statics.create(id1, id2) {
        return new mongoose.model('Battle')({ trainer1: id1, trainer2: id2, currTurn: trainer1 });
    }

    // Switches the trainer whose turn it is for this battle
    BattleSchema.methods.switchTurn() {
        switch(this.currTurn) {
            case this.trainer1: 
                this.currTurn = this.trainer2;
                break;
            case this.trainer2:
                this.currTurn = this.trainer1;
                break;
            case default:
                console.log('Error: current turn id is invalid.');
        } 
    }

    //getBattle: function(battle, callback) {},

    return mongoose.mode('Battle', BattleSchema);
};
