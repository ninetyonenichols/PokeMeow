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
app.use('/command/', authenticate);
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
    console.log(req.body);
    const cmd = parseCommand(req.body.command);
    res.json({main: cmd, encounter: null});
});


/*  Description: This function takes a string that contains a command, parses
 *      it, and returns an object representing the command. If the command is
 *      invalid, it returns null.
 *  Parameters:
 *      command - the user's command string
 */
function parseCommand(command) {
    command = command.split(' ');
    switch (command[0]) {
        case /random-encounter/:
            return 'Random Encounter';
            break;
        case /view-party/:
            return 'View Party';
            break;
        case /view-pokemon/:
            return 'View Pokemon';
            break;
        case /view/:
            if (command.length == 2) {
                return 'View ' + command[1];
                break;
            }
        case /remove/:
            if (command.length == 2) {
                return 'Remove ' + command[1] + ' from Party';
                break;
            }
        case /add/:
            if (command.length == 2) {
                return 'Add ' + command[1] + ' to Party';
                break;
            }
        default:
            return null;
    }
}


// Handle a post request that contains a random encounter command
app.post('/command/rand-enc/', (req, res) => {
    console.log(req.body);
    const cmd = parseRandEncCommand(req.body.command);
    res.json({main: null, encounter: cmd});
});


/*  Description: This function takes a string that contains a command specific
 *      to a random encounter, parses it, and returns an object representing
 *      the command. If the command is invalid, it returns null.
 *  Parameters:
 *      command - the user's command string
 */
function parseRandEncCommand(command) {
    command = command.split(' ');
    switch (command[0]) {
        case /throw-ball/:
            return 'Throw Ball';
            break;
        case /run/:
            return 'Run Away';
            break;
        default:
            return null;
    }
}
