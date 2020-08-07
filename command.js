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
exports.command = function Command(cmdStr, database) {
    this.db = database;
    this.cmd = cmdStr.split(' ');

    //Parse the command and set execute to appropriate function
    this.parse = function() {
        this.execute = parseMainCmd(this.cmd, parseEncCmd);
    }

    //Execute the command's function (maybe just remove this?)
    this.execute = function(callback) {
        callback('Command not parsed yet!',
                 {main: null, encounter: null, battle: null});
    };

    /* Use:

    const c = new Command(cmd, db);
    c.parse();
    c.execute((err, output) => {
        if (err) console.log('Error: ' + err);
        res.json(output);
    });

    */


    // Parser Helper Functions //

    function parseMainCmd(cmd, next) {
        switch (cmd[0]) {
            case 'random-encounter':
                return execEncounter;
                break;
            case 'view-party':
                return execParty;
                break;
            case 'view-pokemon':
                return execViewCaught;
                break;
            case 'view':
                if (cmd.length == 2) {
                    this.pokemon = cmd[1];
                    return execView;
                    break;
                }
            case 'remove':
                if (cmd.length == 2) {
                    this.pokemon = cmd[1];
                    return execRemove;
                    break;
                }
            case 'add':
                if (cmd.length == 2) {
                    this.pokemon = cmd[1];
                    return execAdd;
                    break;
                }
            case 'release':
                if (cmd.length == 2) {
                    this.pokemon = cmd[1];
                    return execRelease;
                    break;
                }
            default:
                return next(cmd, parseBattleCmd);
        }
    }

    function parseEncCmd(cmd, next) {
        switch (cmd[0]) {
            case 'throw-ball':
                return execThrow;
                break;
            case 'run':
                return execRun;
                break;
            default:
                return next();
        }
    }

    function parseBattleCmd(cmd, next) {
        return invalidCommand;
    }


    // Execute Helper Functions //

    function invalidCommand(callback) {
        callback('Invalid Command',{main: null, encounter: null, battle: null});
    }

    function execEncounter(callback) {
        //execute command
        //this.db.startEncounter((err, result) => {
            //success:
            callback(null, {main: null, encounter: 'ENCOUNTER', battle: null});
            //error:
            //callback(err, {main: null, encounter: null, battle: null});
        //});
    }

    function execParty(callback) {
        //success:
        if (true) {
            callback(null, {main: 'PARTY', encounter: null, battle: null});

        //error:
        } else {
            callback(err, {main: null, encounter: null, battle: null});
        }
    }

    function execViewCaught(callback) {
        callback(null, {main: 'CAUGHT', encounter: null, battle: null});
    }

    function execView(callback) {
        callback(null, {main: this.pokemon, encounter: null, battle: null});

    }

    function execRemove(callback) {
        callback(null, {main: 'REMOVE', encounter: null, battle: null});

    }

    function execAdd(callback) {
        callback(null, {main: 'ADD', encounter: null, battle: null});

    }

    function execRelease(callback) {
        callback(null, {main: 'RELEASE', encounter: null, battle: null});

    }

    function execThrow(callback) {
        callback(null, {main: null, encounter: 'THROW', battle: null});

    }

    function execRun(callback) {
        callback(null, {main: null, encounter: 'RUN', battle: null});

    }
}
