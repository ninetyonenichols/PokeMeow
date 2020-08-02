/* Filename: account.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'accounts' collection.
 */

const crypto = require('crypto');

module.exports = (mongoose) => {
    const Schema = mongoose.Schema;

    // User accounts
    const AccountSchema = new Schema({
        username: { type: String, unique: true, required: true },
        passHash: { type: String, required: true },
        passSalt: { type: String, required: true },
        dev: { type: Boolean, default: false }
    });
    const Account = mongoose.model('Account', AccountSchema);

    // Return exports
    return {
        create: function (user, pass, callback) {
            //generate salt
            crypto.randomBytes(256, (err, buf) => {
                if (err) throw err;
                const salt = buf.toString('base64');

                //generate encrypted key
                crypto.pbkdf2(pass, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                    if (err) throw err;
                    const key = derivedKey.toString('hex');

                    const newAccount = new Account({
                        username: user,
                        passHash: key,
                        passSalt: salt
                    });

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
                });
            });
        },

        userExists: function (user, callback) {
            Account.findOne({username: user}, (err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
                } else if (result) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        },

        authenticate: function (user, pass, callback) {
            Account.findOne({username: user}, (err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
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
