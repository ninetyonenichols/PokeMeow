/* Filename: accountDB.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'accounts' collection and
 *      should be imported into the 'server.js' file. 'server.js' should not
 *      access the database directly, but instead call the functions in this
 *      file to perform operations on the 'accounts' collection. This is just a
 *      starting point as I'm not yet entirely sure how to do this yet, so the
 *      organization of this is subject to change.
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
    username: {type: String, unique: true},
    passHash: String,
    passSalt: String
});
const Account = mongoose.model('Account', AccountSchema);
