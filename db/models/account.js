/* Filename: account.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'accounts' collection. It
 *      exports three functions: 'create', 'userExists', and 'authenticate'.
 */

const crypto = require('crypto');
const Trainer = require('./trainer.js');

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;

    // User accounts
    const AccountSchema = new Schema({
        username: { type: String, unique: true, required: true },
        passHash: { type: String, required: true },
        passSalt: { type: String, required: true },
        trainer: { type: ObjectId, ref: 'Trainer' },
        dev: { type: Boolean, default: false }
    });
    const Account = mongoose.model('Account', AccountSchema);

    // Return exports
    return {
        /*  Description: This function creates a new Account document with a
         *      randomly generated salt and uses pbkdf2 to hash the password
         *      before storing it.
         *  Parameters:
         *      user - the username
         *      pass - the plaintext password
         *      callback(boolean) - the callback function (basically used in
         *          place of a 'return' statement)
         */
        create: function (user, pass, callback) {
            //generate salt
            crypto.randomBytes(64, (err, buf) => {
                if (err) throw err;
                const salt = buf.toString('base64');

                //generate encrypted key
                crypto.pbkdf2(pass, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                    if (err) throw err;
                    const key = derivedKey.toString('hex');

                    const newTrainer = Trainer.create(user);

                    const newAccount = new Account({
                        username: user,
                        passHash: key,
                        passSalt: salt,
                        trainer: newTrainer._id
                    });

                    newTrainer.save((err) => {
                        if (err) {
                            console.log('Error creating account: ' + err);
                            callback(false);
                        } else {
                            newAccount.save((err) => {
                                if (err) {
                                    console.log('Error creating account: ' + err);
                                    //if username already exists: err.code == 11000
                                    callback(false);
                                } else {
                                    console.log('USER CREATED:\n' + newAccount.username);
                                    callback(true);
                                }
                            });
                        }
                    });
                });
            });
        },

        /*  Description: This function searches the database for an account
         *      matching the given 'user' and returns the account's trainer.
         *  Parameters:
         *      user - the username
         *      callback(boolean) - the callback function (basically used in
         *          place of a 'return' statement)
         */
        getTrainer: function (user, callback) {
            Account.findOne({username: user})
            .populate('trainer')
            .exec((err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
                    callback(err, null);
                } else if (result) {
                    callback(null, result.trainer);
                } else {
                    callback(null, null);
                }
            });
        },

        /*  Description: This function searches the database for an account
         *      matching the given 'user' and returns true if an account is
         *      found.
         *  Parameters:
         *      user - the username
         *      callback(boolean) - the callback function (basically used in
         *          place of a 'return' statement)
         */
        userExists: function (user, callback) {
            Account.findOne({username: user}, (err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
                    callback(false);
                } else if (result) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        },

        /*  Description: This function authenticates a user's name and password
         *      against those in the database.
         *  Parameters:
         *      user - the username
         *      pass - the plaintext password
         *      callback(boolean) - the callback function (basically used in
         *          place of a 'return' statement)
         */
        authenticate: function (user, pass, callback) {
            Account.findOne({username: user}, (err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
                    callback(false);
                } else if (result) {
                    //encrypt the given 'pass' using the account's salt
                    const salt = result.passSalt;
                    crypto.pbkdf2(pass, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                        if (err) throw err;
                        const key = derivedKey.toString('hex');

                        //compare the resultant key to the account's 'passHash'
                        if (result.passHash == key) {
                            callback(true);
                        } else {
                            callback(false);
                        }
                    });
                } else {
                    callback(false);
                }
            });
        }
    };
};
