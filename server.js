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

// Set up the express server
const app = express();
const port = 5000;

app.use('/', express.static('public_html'));
// NOTE: I'm using a regular expression here, but '/' would probably work too?
app.use(/\/.*/, express.json()); //parse request body json into req.body

app.listen(port, () => {
    console.log('App listening');
});
