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

const trainerAIs = ['Bug Catcher', 'Blue', 'Lorelei', 'Giovanni', 'Lance'];

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
    this.move = null;

    //Execute the command's function (maybe just remove this?)
    this.execute = function(callback) {
        callback('Command not parsed yet!',
        {main: null, encounter: null, battle: null});
    };

    //Parse the main command and set execute to appropriate function
    this.parseMain = function() {
        switch (this.cmd[0]) {
            case 'random-encounter':
                this.execute = this.execEncounter;
                break;
            case 'battle':
                this.execute = this.execBattle;
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

    //Parse the encounter command and set execute to appropriate function
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

    //Parse the battle command and set execute to appropriate function
    this.parseBattle = function() {
        switch (this.cmd[0]) {
            case 'switch':
                if (this.cmd.length == 2) {
                    this.pokemon = this.cmd[1];
                    this.execute = this.execSwitch;
                    break;
                }
            case 'moves':
                this.execute = this.execMoves;
                break;
            case 'use':
                if (this.cmd.length == 2) {
                    this.move = this.cmd[1];
                    this.execute = this.execUse;
                    break;
                }
            case 'run':
                this.execute = this.execBtlExit;
                break;
            default:
                this.execute = this.invalidCommand;
        }
    }


    // Database Access Helper Functions //

    // A helper function to somewhat simplify accessing the user's trainer
    this.getTrainer = function(callback) {
        this.db.account.getTrainer(this.user, (err, trainer) => {
            if (err) {
                console.log('Error getting trainer: ' + err);
                callback(null);
            } else if (trainer) {
                callback(trainer);
            } else {
                callback(null);
            }
        });
    }

    // A helper function to simplify getting the current battle
    this.getBattle = function(callback) {
        this.getTrainer((trainer) => {
            if (trainer) {
                this.db.battle.findOne({trainer1: trainer._id})
                .populate('trainer1')
                .populate('trainer2')
                .exec((err, battle) => {
                    if (err) {
                        console.log('Error getting battle: ' + err);
                        callback(null);
                    } else if (trainer) {
                        callback(battle);
                    } else {
                        callback(null);
                    }
                });
            } else {
                callback(null);
            }
        });
    }


    // Execute Helper Functions //

    // Represents an invalid command
    this.invalidCommand = (callback) => {
        callback('Invalid Command', this.output);
    }

    // The 'view-party' command
    this.execParty = (callback) => {
        this.getTrainer((trainer) => {
            if (trainer) {
                if (trainer.party.length == 0) {
                    this.output.main = 'No party pokemon';
                } else {
                    this.output.main = trainer.party;
                }
                callback(null, this.output);
            } else {
                callback('Could not find trainer.', this.output);
            }
        });
    }

    // The 'view-pokemon' command
    this.execViewCaught = (callback) => {
        this.getTrainer((trainer) => {
            if (trainer) {
                if (trainer.pokemon.length == 0) {
                    this.output.main = 'No caught pokemon';
                } else {
                    this.output.main = trainer.pokemon;
                }
                callback(null, this.output);
            } else {
                callback('Could not find trainer.', this.output);
            }
        });
    }

    // The 'view' command - displays info about a pokemon
    this.execView = (callback) => {
        this.db.pokemon.findOne({name: this.pokemon}, (err, result) => {
            if (err) {
                console.log('Error finding pokemon: ' + err);
                callback(err, this.output);
            } else if (result) {
                this.output.main = result;
                callback(null, this.output);
            } else {
                this.output.main = 'Could not find pokemon.';
                callback(null, this.output);
            }
        });
    }

    // The 'remove' command - removes a pokemon from the party
    this.execRemove = (callback) => {
        this.getTrainer((trainer) => {
            let error = null;

            if (trainer) {
                if (trainer.removeParty(this.pokemon)) {
                    this.output.main = 'REMOVED FROM PARTY: '
                                        + this.pokemon;
                } else {
                    this.output.main = 'Could not find pokemon';
                }
            } else {
                error = 'Could not find trainer.';
            }

            callback(error, this.output);
        });
    }

    // The 'add' command - adds a pokemon to the party
    this.execAdd = (callback) => {
        this.getTrainer((trainer) => {
            let error = null;

            if (trainer) {
                if (trainer.addParty(this.pokemon)) {
                    this.output.main = 'ADDED TO PARTY: '
                                        + this.pokemon;
                } else {
                    this.output.main = 'Could not add pokemon';
                }
            } else {
                error = 'Could not find trainer.';
            }

            callback(error, this.output);
        });
    }

    // The 'release' command - release a pokemon back to the wild
    this.execRelease = (callback) => {
        this.getTrainer((trainer) => {
            let error = null;

            if (trainer) {
                if (trainer.release(this.pokemon)) {
                    this.output.main = 'RELEASED: ' + this.pokemon;
                } else {
                    this.output.main = 'Could not find pokemon';
                }
            } else {
                error = 'Could not find trainer.';
            }

            callback(error, this.output);
        });
    }

    // The 'random-encounter' command
    this.execEncounter = (callback) => {
        this.db.pokemon.encounter((poke) => {
            this.getTrainer((trainer) => {
                if (trainer) {
                    trainer.encounter = poke;
                    trainer.save();
                    this.output.encounter = poke;
                    callback(null, this.output);
                } else {
                    callback('Could not find trainer.', this.output);
                }
            });
        });
    }

    // The 'throw-ball' command
    this.execThrow = (callback) => {
        //access the pokemon in the encounter (it is in trainer.encounter)
        this.getTrainer((trainer) => {
            if (trainer) {
                let error = null;

                //determine if caught or not
                switch (trainer.encounter.attemptCapture()) {
                    case "caught":
                        //caught, add pokemon to trainer
                        trainer.add();
                        this.output.main = 'CAUGHT: ' + trainer.encounter.name;
                        break;
                    case "missed":
                        this.output.encounter = 'POKEBALL MISSED';
                        break;
                    case "ran":
                        this.output.main = 'POKEMON ESCAPED';
                        break;
                    default:
                        error = 'Problem catching pokemon';
                }

                callback(error, this.output);
            } else {
                callback('Could not find trainer.', this.output);
            }
        });
    }

    // The 'run' command
    this.execRun = (callback) => {
        this.output.main = 'YOU RAN AWAY';
        callback(null, this.output);
    }

    // The 'battle' command
    this.execBattle = (callback) => {
        const i = Math.floor((Math.random() * 5));
        let battle = null;

        this.getTrainer((trainer) => {
            if (trainer) {
                if (trainer.party.length == 0) {
                    this.output.main = 'You have no pokemon in your party!';
                    callback(null, this.output);
                } else {
                    //find the AI trainer
                    this.db.trainer.findOne({name: trainerAIs[i]},
                    (err,result) => {
                        if (err) {
                            console.log('Error finding AI trainer: ' + err);
                            callback(err, this.output);
                        } else if (result) {
                            battle = this.db.battle.create(trainer._id,
                                result._id);
                            trainer.setBattle(battle);
                            result.setBattle(battle);
                            battle
                            .populate('trainer1')
                            .populate('trainer2', (err, btl) => {
                                if (err) {
                                    console.log('Error populating battle: ' + err);
                                    callback(err, this.output);
                                } else {
                                    this.output.battle = btl;
                                    callback(null, this.output);
                                }
                            });
                        } else {
                            callback('Could not find AI trainer', this.output);
                        }
                    });
                }
            } else {
                callback('Could not find trainer.', this.output);
            }
        });
    }

    // The 'switch' command
    this.execSwitch = (callback) => {
        this.getTrainer((trainer) => {
            if (trainer) {
                if (trainer.switchActive(this.pokemon)) {
                    this.getBattle((battle) => {
                        if (battle) {
                            this.output.battle = battle;
                            callback(null, this.output);
                        } else {
                            callback('Could not find battle.', this.output);
                        }
                    });
                } else {
                    this.output.battle = 'Could not find pokemon';
                    callback(null, this.output);
                }
            } else {
                callback('Could not find trainer.', this.output);
            }
        });
    }

    // The 'moves' command
    this.execMoves = (callback) => {
        this.getTrainer((trainer) => {
            if (trainer) {
                this.output.battle = trainer.party[trainer.active].moves;
                callback(null, this.output);
            } else {
                callback('Could not find trainer.', this.output);
            }
        });
    }

    // The 'use' command
    this.execUse = (callback) => {
        this.getBattle((battle) => {
            if (battle) {
                //check if this.move is valid
                console.log(battle);
                //use the move against opponent
                //check if opponent fainted (switch or end battle)
                //have opponent use move
                //check if we have fainted (switch or end battle)
                this.output.battle = battle;
                callback(null, this.output);
            } else {
                callback('Could not find battle.', this.output);
            }
        });
    }

    this.helperUse = function(battle, isAI, moveIdx) {

    }

    // The 'run' battle command
    this.execBtlExit = (callback) => {
        this.getTrainer((trainer) => {
            if (trainer) {
                trainer.resetAll();
                this.output.main = 'YOU RAN AWAY';
                callback(null, this.output);
            } else {
                callback('Could not find trainer.', this.output);
            }
        });
    }
}
