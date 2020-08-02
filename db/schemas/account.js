/* Filename: account.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file handles access to the 'accounts' collection.
 */

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
        create: function (user, pass) {
            const newAccount = new Account({
                username: user,
                passHash: pass,
                passSalt: 'temp'
            });

            let success;
            newAccount.save((err) => {
                if (err) {
                    console.log('Error creating account: ' + err);
                    //if username already exists: err.code == 11000
                    success = false;
                } else {
                    console.log('USER CREATED:\n' + newAccount.username);
                    success = true;
                }
            });
            return success;
        },

        userExists: function (user) {
            Account.findOne({username: user}, (err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
                } else if (result) {
                    return true;
                } else {
                    return false;
                }
            });
        },

        authenticate: function (user, pass) {
            let valid;
            Account.findOne({username: user}, (err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
                } else if (result) {
                    if (result.passHash == pass) {
                        valid = true;
                    } else {
                        valid = false;
                    }
                } else {
                    valid = false;
                }
            });
            return valid;
        }
    };
};
