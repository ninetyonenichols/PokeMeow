/* Filename: command.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file is for handling the game commands that are submitted
 *      to the server by the user. It consists of a Command object that can be
 *      used to parse the command and generate a JSON object for use by the
 *      client that represents the command's output.
 */


//NOTES:
// PURPOSE: To separate the command parsing etc from server.js (which should
//      only have to worry about recieving/sending information). server.js is
//      also kind of acting as a controller (as in it has control/logic
//      elements to it like (as of writing this) determining what each command
//      is or how to respond to it). For good separation of responsibilities,
//      server.js should only be concerned with sending/recieving information,
//      not with what to do with that information. Having this separation is
//      good for readability b/c it 1. separates/distributes the logic, and 2.
//      shortens the length of the file.
// Necessary functionality: parse command, then return object for client's use
// Do i want to use a protoype to construct it from?
//      ->maybe then i can include only the relevant properties? (this may make
//        it easier for server.js to decide how to change the database, b/c
//        there won't be a need to check each property (example: check if it is
//        an add or remove command, etc.). Maybe server.js will have to do that
//        regardless tho?)
// Should i also include the database? As in, after parsing the command this
//      object will also execute the command on the database. Or should the
//      execution be left up to server.js? What is the proper separation of
//      code/responsibilites here?
// Related to the above, how will this object return some JSON representing the
//      output of the command which the client will use to display that output?


/*  Description: This object constructor creates an object that represents a
 *      pokemeow command. During construction, it parses the command string and
 *      sets the appropriate properties (based on what the command was).
 *  Parameters:
 *      cmdStr - the command in string form
 *      database - the database that the command manipulates
 */
exports.command = function Command(cmdStr, user, database) {
    this.db = database;
    this.user = user;
    this.cmd = cmdStr.split(' ');
    this.output = {main: null, encounter: null, battle: null};
    this.pokemon = null;

    //Execute the command's function (maybe just remove this?)
    this.execute = function(callback) {
        callback('Command not parsed yet!',
        {main: null, encounter: null, battle: null});
    };

    //Parse the command and set execute to appropriate function
    this.parseMain = function() {
        switch (this.cmd[0]) {
            case 'random-encounter':
                this.execute = this.execEncounter;
                break;
            case 'view-party':
                this.execute = this.execParty;
                break;
            case 'view-pokemon':
                this.execute = this.execViewCaught;
                break;
            case 'view':
                if (this.cmd.length == 2) {
                    this.pokemon = this.cmd[1];
                    this.execute = this.execView;
                    break;
                }
            case 'remove':
                if (this.cmd.length == 2) {
                    this.pokemon = this.cmd[1];
                    this.execute = this.execRemove;
                    break;
                }
            case 'add':
                if (this.cmd.length == 2) {
                    this.pokemon = this.cmd[1];
                    this.execute = this.execAdd;
                    break;
                }
            case 'release':
                if (this.cmd.length == 2) {
                    this.pokemon = this.cmd[1];
                    this.execute = this.execRelease;
                    break;
                }
            default:
                this.execute = this.invalidCommand;
        }
    }

    //Parse the command and set execute to appropriate function
    this.parseEnc = function() {
        switch (this.cmd[0]) {
            case 'throw-ball':
                this.execute = this.execThrow;
                break;
            case 'run':
                this.execute = this.execRun;
                break;
            default:
                this.execute = this.invalidCommand;
        }
    }

    /* Use:

    const c = new Command(cmd, db);
    c.parse();
    c.execute((err, output) => {
        if (err) console.log('Error: ' + err);
        res.json(output);
    });

    */


    // Execute Helper Functions //

    this.invalidCommand = (callback) => {
        callback('Invalid Command', this.output);
    }

    this.execEncounter = (callback) => {
        //execute command
        //this.db.startEncounter((err, result) => {
            //success:
            this.output.encounter = 'ENCOUNTER';
            callback(null, this.output);
            //error:
            //callback(err, {main: null, encounter: null, battle: null});
        //});
    }

    this.execParty = (callback) => {
        this.db.account.getTrainer(this.user, (err, trainer) => {
            if (err) {
                console.log('Error getting trainer: ' + err);
                callback(err, this.output);
            } else if (trainer) {
                this.output.main = trainer.party;
                callback(null, this.output);
            } else {
                callback('Could not find trainer', this.output);
            }
        });
    }

    this.execViewCaught = (callback) => {
        this.output.main = 'CAUGHT';
        callback(null, this.output);
    }

    this.execView = (callback) => {
        callback(null, {main: this.pokemon, encounter: null, battle: null});

    }

    this.execRemove = (callback) => {
        callback(null, {main: 'REMOVE', encounter: null, battle: null});

    }

    this.execAdd = (callback) => {
        callback(null, {main: 'ADD', encounter: null, battle: null});

    }

    this.execRelease = (callback) => {
        callback(null, {main: 'RELEASE', encounter: null, battle: null});

    }

    this.execThrow = (callback) => {
        callback(null, {main: null, encounter: 'THROW', battle: null});

    }

    this.execRun = (callback) => {
        callback(null, {main: 'RUN', encounter: null, battle: null});

    }
}
