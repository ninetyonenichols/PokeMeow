/* Filename: command.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file is for handling the game commands that are submitted
 *      to the server by the user. It consists of a Command object that can be
 *      used to parse the command and generate a JSON object for use by the
 *      client that represents the command's output.
 */


//NOTES:
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
function Command(cmdStr, database) {

}
