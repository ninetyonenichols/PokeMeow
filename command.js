/* Filename: command.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file is for handling the game commands that are submitted
 *      to the server by the user. It consists of a Command object that can be
 *      used to parse the command and then execute the command. The execution of the command generates a string or JSON object that represents the command's output for use by the client. The purpose of the Command object is to keep these actions from cluttering up server.js and
 *
 * Use in server.js:
 *      const cmd = new Command(req.body.command, req.session.user, database);
 *      cmd.parse[Main | Enc | Battle](); <-parse a main, enc, or battle command
 *      cmd.execute((err, output) => {
 *          if (err) console.log('ERROR: ' + err);
 *          res.json(output);
 *      });
 */

// A list of the preset trainers (used for trainer battles)
const trainerAIs = ['Bug Catcher', 'Blue', 'Lorelei', 'Giovanni', 'Lance'];

/*  Description: This object constructor creates an object that represents a
 *      pokemeow command.
 *  Parameters:
 *      cmdStr - the command in string form
 *      user - the name of the user to run the commands for
 *      database - the database that the command manipulates
 */
exports.command = function Command(cmdStr, user, database) {
    this.db = database;
    this.user = user;
    //grab the first word, and put the other words if they exist in cmd[1]
    this.cmd = (cmdStr) => {
        let tmp = cmdStr.split(' ');
        for (let i = 2; i < tmp.length; i++) {
            tmp[1] += ' ' tmp[i];
        }
        return [tmp[0], tmp[1]];
    }

    // This is the object that is populated with command output and ultimately
    // sent back to the client. Depending on which properties are populated,
    // the command scope can change (discussed more below).
    this.output = {main: null, encounter: null, battle: null};

    // These are set later on during parsing/execution
    this.pokemon = null;
    this.move = null;

    // This is set to the appropriate execution function during parsing.
    // Currently it has a placeholder function.
    this.execute = function(callback) {
        callback('Command not parsed yet!',
        {main: null, encounter: null, battle: null});
    };

    // Parse the commands that are valid at the top-most scope (here I'm
    // calling that 'main') and set execute to the appropriate function
    this.parseMain = function() {
        switch (this.cmd[0]) {
            case 'p':
                this.execute = this.execEncounter;
                break;
            case 'battle':
                this.execute = this.execBattle;
                break;
            case 'party':
                this.execute = this.execParty;
                break;
            case 'storage':
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

    // Parse the commands that are valid withing the 'encounter' scope (these
    // are the only valid commands when in a pokemon encounter) and set execute
    // to the appropriate function
    this.parseEnc = function() {
        switch (this.cmd[0]) {
            case 'pb':
                this.execute = this.execThrow;
                break;
            case 'run':
                this.execute = this.execRun;
                break;
            default:
                this.execute = this.invalidCommand;
        }
    }

    // Parse the commands that are valid within a 'battle' scope and set
    // execute to the appropriate function.
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

    /*  Description: A helper function to simplify getting the user's trainer
     *      object. If the trainer is found, it passes it along using the
     *      callback function 'cb'. If there's an error, it calls the callback
     *      (which should be a .execute function's callback) with an error.
     *  Parameters:
     *      callback - the callback function used by the .execute functions
     *      cb - this function's callback that returns the trainer to the caller
     */
    this.getTrainer = function(callback, cb) {
        this.db.account.getTrainer(this.user, (err, trainer) => {
            if (err) {
                console.log('Error getting trainer: ' + err);
                //did not find trainer, use 'callback' with an error msg
                callback('Could not find trainer.', this.output);
            } else if (trainer) {
                //found a trainer, call 'cb'
                cb(trainer);
            } else {
                //did not find trainer, use 'callback' with an error msg
                callback('Could not find trainer.', this.output);
            }
        });
    }

    /*  Description: A helper function to simplify getting the current battle.
     *      If it finds a battle, it populates the battle with the trainers'
     *      information before passing the battle along. If there's an error,
     *      it calls the callback (which should be a .execute function's
     *      callback) with an error.
     *  Parameters:
     *      callback - the callback function used by the .execute functions
     *      cb - this function's callback that returns the battle to the caller
     */
    this.getBattle = function(callback, cb) {
        //get the trainer
        this.getTrainer(callback, (trainer) => {

            //find the trainer's battle
            this.db.battle.findById(trainer.battle)
            .populate('trainer1')
            .exec((err, battle) => {
                if (err) {
                    console.log('Error getting battle: ' + err);
                    //did not find battle, use 'callback' with an error msg
                    callback('Could not find battle.', this.output);
                } else if (battle) {
                    //found a battle, call 'cb'
                    cb(battle);
                } else {
                    //did not find battle, use 'callback' with an error msg
                    callback('Could not find battle.', this.output);
                }
            });
        });
    }


    // Execution Functions //

    // All execution functions have a callback parameter that is executed when
    // they complete their task. It is passed in by server.js and is expected
    // to take err and output parameters: callback(err, output).

    // Represents an invalid command
    this.invalidCommand = (callback) => {
        callback('Invalid Command', this.output);
    }

    // The 'party' command - returns the user's party pokemon
    this.execParty = (callback) => {
        this.getTrainer(callback, (trainer) => {
            if (trainer.party.length == 0) {
                this.output.main = 'No Pokemon in party.';

            } else {
                this.output.main = {message:"Party", party: trainer.party, collection: null};
            }

            callback(null, this.output);
        });
    }

    // The 'storage' command - returns the user's other pokemon
    this.execViewCaught = (callback) => {
        this.getTrainer(callback, (trainer) => {
            if (trainer.pokemon.length == 0) {
                this.output.main = {message:'No Pokemon in storage.'};

            } else {
                this.output.main = {message:'Storage', collection:trainer.pokemon};
            }

            callback(null, this.output);
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
                this.output.main = {message:'Could not find pokemon.'};
                callback(null, this.output);
            }
        });
    }

    // The 'remove' command - removes a pokemon from the party
    this.execRemove = (callback) => {
        this.getTrainer(callback, (trainer) => {
            if (trainer.removeParty(this.pokemon)) {
                this.output.main = {message: `Removed ${this.pokemon} from party.`,
                    party: trainer.party};

            } else {
                this.output.main = {message:'Could not find pokemon'};
            }

            callback(null, this.output);
        });
    }

    // The 'add' command - adds a pokemon to the party
    this.execAdd = (callback) => {
        this.getTrainer(callback, (trainer) => {
            if (trainer.addParty(this.pokemon)) {
                this.output.main = {message:`Added ${this.pokemon} to party.`,
                    collection: trainer.pokemon};
            } else {
                this.output.main = {message:'Could not add pokemon', collection:trainer.pokemon};
            }

            callback(null, this.output);
        });
    }

    // The 'release' command - release a pokemon back to the wild
    this.execRelease = (callback) => {
        this.getTrainer(callback, (trainer) => {
            if (trainer.release(this.pokemon)) {
                this.output.main = {message:`Released ${this.pokemon}.`,
                    collection: trainer.pokemon};
            } else {
                this.output.main = {message:'Could not find pokemon'};
            }

            callback(null, this.output);
        });
    }

    // The 'p' command - starts a random encounter with a Pokemon
    this.execEncounter = (callback) => {
        //get a random pokemon from the database
        this.db.pokemon.encounter((poke) => {
            this.getTrainer(callback, (trainer) => {
                //have trainer save the pokemon in its 'encounter' property
                trainer.encounter = poke;
                trainer.save();

                //return the pokemon
                this.output.encounter = {message:`A wild ${poke.name} appeared!`, encPkmn:poke};
                callback(null, this.output);
            });
        });
    }

    // The 'pb' command - throws a PokeBall (in attempt to capture Pokemon).
    this.execThrow = (callback) => {
        //access the pokemon in the encounter (it is in trainer.encounter)
        this.getTrainer(callback, (trainer) => {
            let error = null;

            //determine if caught or not
            switch (trainer.encounter.attemptCapture()) {
                case "caught":
                    //caught, add pokemon to trainer
                    trainer.add();
                    //set output to 'main' to return to the 'Main' scope
                    this.output.main = `${trainer.encounter.name} was caught!`;
                    break;

                case "missed":
                    //pokeball missed, continue encounter
                    this.output.encounter = {message: 'The Pokemon broke free!', encPkmn:trainer.encounter};
                    break;

                case "ran":
                    //pokemon ran away, so end encounter
                    this.output.main = `${trainer.encounter.name} fled.`;
                    break;

                default:
                    error = 'Problem catching pokemon';
            }

            callback(error, this.output);
        });
    }

    // The 'run' command - run from an encountered pokemon
    this.execRun = (callback) => {
        this.output.main = 'Got away successfully!';
        callback(null, this.output);
    }

    // The 'battle' command - start a battle with a random ai trainer
    this.execBattle = (callback) => {
        this.getTrainer(callback, (trainer) => {
            //can't battle if there are no pokemon in the party
            if (trainer.party.length == 0) {
                this.output.main = 'You have no pokemon in your party!';
                callback(null, this.output);

            } else {
                //call helper function
                setupBattle(trainer, this.output, this.db, callback);
            }
        });
    }

    /*  Description: Helper function for 'this.execBattle' that creates a new
     *      battle and uses the callback function to pass on the battle object.
     *  Parameters:
     *      trainer - the user's trainer object
     *      output - the object that holds an empty output object
     *      DB - a reference to the database models
     *      callback - the callback function used by the .execute functions
     */
    function setupBattle(trainer, output, DB, callback) {
        //get a random number to select a random ai trainer name
        const i = Math.floor((Math.random() * 5));

        DB.battle.create(trainer._id, trainerAIs[i], (battle) => {
            //prepare the trainers for battle
            trainer.setBattle(battle);
            trainer.save();
            battle.trainer2.setBattle(battle);
            battle.save();

            //populate the battle with the two trainers before sending
            battle.trainer1 = trainer;

            //pass the new battle along
            output.battle = {message: `${battle.trainer2.name}
                wants to battle!`, battleData: battle};
            callback(null, output);
        });
    }

    // The 'switch' command - switch out the current pokemon with another in
    // the party. The opponent still gets to attack after you switch pokemon.
    this.execSwitch = (callback) => {
        this.getBattle(callback, (battle) => {
            //if the given pokemon name is valid (exists and isn't fainted)
            if (battle.trainer1.switchActive(this.pokemon)) {
                    const userPkmn = battle.trainer1.getActive();
                    const aiPkmn = battle.trainer2.getActive();

                    //have opponent attack then send the updated battle
                    const m = aiPkmn.moves[Math.floor((Math.random() * 2))];
                    this.db.move.damage(m, aiPkmn, userPkmn, (damage) => {
                        this.output = aiTrnrTurn(battle, m, damage, '',  this.output);
                        callback(null, this.output);
                    });
            } else {
                this.output.battle = {message:'Could not find pokemon.', battleData: battle};
                callback(null, this.output);
            }
        });
    }

    // The 'moves' command - returns a list of the current pokemon's moves
    this.execMoves = (callback) => {
        this.getTrainer(callback, (trainer) => {
            this.output.battle = trainer.party[trainer.active].moves;
            callback(null, this.output);
        });
    }

    // The 'use' command - uses a move to attack the opponent, then the
    // opponent attacks the user's pokemon
    this.execUse = (callback) => {
        this.getBattle(callback, (battle) => {
            const userPkmn = battle.trainer1.getActive();
            const aiTrnr = battle.trainer2;
            const aiPkmn = aiTrnr.getActive();

            //use the move against opponent
            this.db.move.damage(this.move, userPkmn, aiPkmn, (damage) => {
                if (damage != null) {
                    aiTrnr.subtractHp(damage);
                    let msg = `${userPkmn.name} used ${this.move}!\n`;

                    //if opponent is defeated end the battle
                    if (aiTrnr.defeated) {
                        this.output.main = `You defeated ${aiTrnr.name}!`;
                        callback(null, this.output);
                    } else {
                        battle.trainer2 = aiTrnr;
                        checkAI(battle, this.db, msg, this.output, callback);
                    }
                } else {
                    this.output.battle = {message:`Invalid move: ${this.move}`, battleData: null};
                    callback(null, this.output);
                }
            });
        });
    }

    /*  Description: Helper function to 'this.execUse' that handles checking if
     *      the opponent pokemon fainted and if not, having the opponent attack
     *      the user. Can end the battle by using the callback function.
     *  Parameters:
     *      battle - the battle object that holds the two trainer's objects
     *      DB - a reference to the database models
     *      msg - the message logging what damage was dealt
     *      output - the object that holds an empty output object
     *      callback - the callback function used by the .execute functions
     */
    function checkAI(battle, DB, msg, output, callback) {
        const aiTrnr = battle.trainer2;
        let aiPkmn = aiTrnr.getActive();
        const userPkmn = battle.trainer1.getActive();

        //check if opponent pokemon fainted
        if (aiPkmn.fainted) {
            msg += `${aiPkmn.name} fainted!\n`;
            //send out next pokemon
            aiPkmn = aiTrnr.nextPkmn();
            msg += `${aiTrnr.name} sent ${aiPkmn.name}!`;

            //update battle and send
            battle.trainer2 = aiTrnr;
            battle.save();
            output.battle = {message: msg, battleData: battle};
            callback(null, output);

        //if not, have opponent attack the user
        } else {
            battle.save();

            //have opponent attack
            const m = aiPkmn.moves[Math.floor((Math.random() * 2))];
            DB.move.damage(m, aiPkmn, userPkmn, (damage2) => {
                output = aiTrnrTurn(battle, m, damage2, msg, output);
                callback(null, output);
            });
        }
    }

    /*  Description: Helper function to that handles the ai attacking the user.
     *      Returns the output of the battle (i.e. an updated battle object
     *      within the output object).
     *  Parameters:
     *      battle - the battle object that holds the two trainer's objects
     *      move - the name of the move used against the ai pokemon
     *      DB - a reference to the database models
     *      msg - the message logging what damage was dealt
     *      output - the object that holds an empty output object
     */
    function aiTrnrTurn(battle, move, damage, msg, output) {
        const userTrnr = battle.trainer1;
        const aiTrnr = battle.trainer2;
        let userPkmn = userTrnr.getActive();
        const aiPkmn = aiTrnr.getActive();

        if (damage != null) {
            userTrnr.subtractHp(damage);
            msg += `Enemy ${aiPkmn.name} used ${move}!`;

            //if user is defeated end the battle
            if (userTrnr.defeated) {
                output.main =`You were defeated by ${aiTrnr.name}.`;
                return output;
            } else {
                //check if user's pokemon fainted
                if (userPkmn.fainted) {
                    msg += `${userPkmn.name} fainted!\n`;
                    //send out next pokemon
                    userPkmn = userTrnr.nextPkmn();
                    msg += `You sent out: ${userPkmn.name}`;
                }
                userTrnr.save();

                //update battle and send
                battle.trainer1 = userTrnr;
                output.battle = {message: msg, battleData: battle};
                return output;
            }
        } else {
            output.battle = {message: `Invalid move: ${move}`, battleData: battle}
            return output;
        }
    }

    // The 'run' battle command - used to exit from a battle
    this.execBtlExit = (callback) => {
        this.getTrainer(callback, (trainer) => {
            this.output.main = `Withdrew from battle.`;
            callback(null, this.output);
        });
    }
}
