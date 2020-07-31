/* Filename: accountDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'accounts' collection.
 */

const mongoose = require('mongoose');

// Connect to the database
const mongoDBURL = 'mongodb://127.0.0.1/pokemeow';
mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
//get the connection object
const db = mongoose.connection;
//set up connection error reporting
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Set up our database structure
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    username: { type: String, unique: true, required: true },
    passHash: { type: String, required: true },
    passSalt: { type: String, required: true },
    dev: { type: Boolean, default: false }
});
const Account = mongoose.model('Account', AccountSchema);
