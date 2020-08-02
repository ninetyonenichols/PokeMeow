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
        create: async function (user, pass) {
            const newAccount = new Account({
                username: user,
                passHash: pass,
                passSalt: 'temp'
            });

            return await newAccount.save((err) => {
                if (err) {
                    console.log('Error creating account: ' + err);
                    //if username already exists: err.code == 11000
                    return false;
                } else {
                    console.log('USER CREATED:\n' + newAccount.username);
                    return true;
                }
            });
        },

        userExists: async function (user) {
            return await Account.findOne({username: user}, (err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
                } else if (result) {
                    return true;
                } else {
                    return false;
                }
            });
        },

        authenticate: async function (user, pass) {
            return await Account.findOne({username: user}, (err, result) => {
                if (err) {
                    console.log('Error querying account: ' + err);
                } else if (result) {
                    if (result.passHash == pass) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            });
        }
    };
};
