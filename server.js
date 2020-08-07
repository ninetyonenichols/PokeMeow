#!/usr/bin/env node
/* Filename: server.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file runs the server. As the project gets larger, we will
 *      likely have to split this up into smaller units while using this file
 *      as the main control/start the server from here. Most notably, the
 *      database schemas and access will be done from (posssibly multiple)
 *      other files.
 */

const express = require('express');
const database = require('./db/db.js');
const session = require('express-session');

// Set up the express server
const app = express();
const port = 80;
const sessionAge = 600000;


/*  Description: This function determines if a session exists in the request
 *      (the session middleware should have added it there if such a session
 *      existed on the server that matched the req's cookie). If it exists,
 *      next() is called.
 *  Parameters: Basic express middleware parameters: req, res, next.
 */
function authenticate(req, res, next) {
    if (req.session.user) {
        console.log(req.session.user);
        next();
    } else {
        res.send('NOT ALLOWED');
    }
}


// NOTE: I'm using a regular expression here, but '/' would probably work too?
app.use(/\/.*/, express.json()); //parse request body json into req.body
app.use(session({
    secret: 'unsecure secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: sessionAge,
        secure: false
    }
}));
app.use('/home.html', authenticate);
app.use('/account.html', authenticate);
app.use('/help.html', authenticate);
app.use(/\/command\/.*/, authenticate);
app.use('/', express.static('public_html'));


app.listen(port, () => {
    console.log('App listening');
});


// Handle a login request by authenticating and adding a session if valid
app.post('/login/', (req, res) => {
    const u = req.body.username;
    database.account.authenticate(u, req.body.password, (valid) => {
        if (valid) {
            req.session.user = u;
            res.json({validUser: true});
        } else {
            res.json({validUser: false});
        }
    });
});


// Handle a signup request by attempting to create an account, then if
// successful, add a session as well
app.post('/signup/', (req, res) => {
    const u = req.body.username;
    database.account.create(u, req.body.password, (success) => {
        if (success) {
            req.session.user = u;
            res.json({validUser: true});
        } else {
            res.json({validUser: false});
        }
    });
});


// Handle a request to log out by destroying the session and going to login page
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log('Problem logging out: ' + err);
        console.log('Logged out');
        res.redirect('/');
    });
});


// Handle a post request that contains a pokemeow command (req.body.command)
app.post('/command/', (req, res) => {
    console.log('/command/: ' + req.body);
    const c = new Command(req.body.command, database);
    c.parse();
    c.execute((err, output) => {
        if (err) console.log('ERROR: ' + err);
        res.json(output);
    });
});


// Handle a post request that contains a random encounter command
app.post('/command/rand-enc/', (req, res) => {
    console.log('/command/rand-enc/: ' + req.body);
    const c = new Command(req.body.command, database);
    c.parse();
    c.execute((err, output) => {
        if (err) console.log('ERROR: ' + err);
        res.json(output);
    });
});

function Command(cmdStr, database) {
    this.db = database;
    this.cmd = cmdStr.split(' ');
    console.log(cmdStr);
    console.log(cmdStr.split(' '));
    console.log(this.cmd);
    //Parse the command and set execute to appropriate function
    this.parse = function() {
        this.execute = parseMainCmd(parseEncCmd);
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

    function parseMainCmd(next) {
        const c = this.cmd;
        switch (c[0]) {
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
                if (command.length == 2) {
                    this.pokemon = command[1];
                    return execView;
                    break;
                }
            case 'remove':
                if (command.length == 2) {
                    this.pokemon = command[1];
                    return execRemove;
                    break;
                }
            case 'add':
                if (command.length == 2) {
                    this.pokemon = command[1];
                    return execAdd;
                    break;
                }
            case 'release':
                if (command.length == 2) {
                    this.pokemon = command[1];
                    return execRelease;
                    break;
                }
            default:
                return next(parseBattleCmd);
        }
    }

    function parseEncCmd(next) {
        const c = this.cmd;
        switch (c[0]) {
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

    function parseBattleCmd(next) {
        return null;
    }


    // Execute Helper Functions //

    function execEncounter(callback) {
        //execute command
        this.db.startEncounter((err, result) => {
            //success:
            callback(null, {main: null, encounter: 'ENCOUNTER', battle: null});
            //error:
            callback(err, {main: null, encounter: null, battle: null});
        });
    }

    function execParty(callback) {
        //success:
        callback(null, {main: 'PARTY', encounter: null, battle: null});
        //error:
        callback(err, {main: null, encounter: null, battle: null});
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
