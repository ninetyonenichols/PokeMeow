/* Filename: typeDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'types' collection.
 */

module.exports = (mongoose) => { 
    const Schema = mongoose.Schema;

    const TypeSchema = new Schema({
        name: { 
            type: String, 
            unique: true, 
            required: true, 
            enum: [ 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 
                'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal',
                 'poison', 'psychic', 'rock', 'steel', 'water' ]
        },
        weakness: [{ type: ObjectId, ref: 'Type' }],
        resistance: [{ type: ObjectId, ref: 'Type' }]
    });

    // Preparing exports
    var exports = { 
        Type : mongoose.model('Type', TypeSchema)
    };

    return exports;
};

