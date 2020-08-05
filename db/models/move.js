/* Filename: moveDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'moves' collection.
 */

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;

    const MoveSchema = new Schema({
        name: { type: String, unique: true, required: true },
        pType: {
            type: String,
            enum: [ 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
                'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal',
                 'poison', 'psychic', 'rock', 'steel', 'water' ],
            default: 'normal'
        },
        baseDmg: { type: Number, required: true }
    });

    //getMove: function(move, callback) {}
    
    return mongoose.model('Move', MoveSchema)
};
