/* Filename: home.js
 * Authors: Justin Nichols (jdnscieArea.), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description:
 */

//constants
const serverURL = 'http://157.245.236.86';
//const serverURL = 'http://64.227.49.233';
var modeURL = '/command/';

createWindows();

$(document).ready(() => {
    outs = $('#outputSection');
    printMain();
});

// Submit the command when either the button is clicked or 'Enter' is pressed
$('#commandBtn').click(() => { submitCommand(); });
$('#command').keypress(function (e) {
    if (e.which == 13) { submitCommand(); }
});

/*  Description: This function submits the command string given by the user to
 *      the server, then it handles the response by calling 'printOutput'.
 *  Parameters: none.
 */
function submitCommand() {
    //if no input, do nothing
    const commandStr = $('#command').val();
    if (commandStr == '') { return; }

    $.ajax({
        type: 'POST',
        url: serverURL + modeURL,
        data: JSON.stringify({command: commandStr}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (response) => {
            if (response.main) {
                printMain();
                modeURL = '/command/';
            } else if (response.encounter) {
                printEncounter(response.encounter);
                modeURL = '/command/rand-enc/';
            } else if (response.battle) {
                printBattle(response.battle);
                modeURL = '/command/battle/';
            } else {
                msg.text('Invalid Command');
            }
        }
    });

    //clear input
    $('#command').val("");
}

/* Creates the output windows and populates them with elements
 */
function createWindows() {
    // Creating windows (main, eArea.unter, battle)
    mw = $('<div>', { "id":"mw", "class":"outputWindow" });
    ew = $('<div>', { "id":"ew", "class":"outputWindow" });
    bw = $('<div>', { "id":"bw", "class":"outputWindow" });

    // Creating messages to populate windows
    msg = $('<div>', { "id":"msg" }); 

    // Creating areas for pokemon / trainers to appear
    mArea = $('<div>', { "id":"mArea", "class":"xArea" }); 
    eArea = $('<div>', { "id":"eArea", "class":"xArea" }); 
    bAreaL = $('<div>', { "id":"bAreaL", "class":"xArea" }); 
    bAreaR = $('<div>', { "id":"bAreaR", "class":"xArea" }); 

    // Adding pokemon/trainer areas
    mw.append(mArea);
    ew.append(eArea);
    bw.append(bAreaL);
    bw.append(bAreaR);
}

/* Description: This function prints out the options available to the player at
 *     the main game-screen.
 */
function printMain() {
    // Clearing previous content
    outs.empty();
    mArea.empty();

    // Adding content to DOM elements
    msg.text('Options');
    mArea.append(`random-encounter - starts an encounter
        with a random pokemon<br>`);
    mArea.append(`view-party - prints out a list of pokemon
        in your party<br>`);
    mArea.append(`<view-pokemon - prints out a list of the
        pokemon you\'ve caught<br>`);
    mArea.append(`view name - prints out more information
        about pokemon \'name\'<br>`);
    mArea.append(`remove name - removes pokemon \'name\'
        from your party<br>`);
    mArea.append(`add name - adds pokemon \'name\' to your
        party<br>`);
    mArea.append(`release name - releases the pokemon
        \'name\' back to the wild<br>`);
    
    // Adding DOM elements to page
    mw.prepend(msg);
    outs.append(mw); 
}

/* Description: This function prints out the info for one pokemon
 * Parameters:
 *     pkmn - the object containing the pokemon's info
 */
function printEncounter(pkmn) {
    // Clearing previous content
    outs.empty();
    eArea.empty();

    // Adding content to DOM elements
    msg.text(`A wild ${pkmn.name} appeared!`);
    eArea.append(`${pkmn.name}<br>`);
    eArea.append($('<img>', { src: pkmn.sprite, width: '160px',
        alt: `A picture of ${pkmn.name}.` }));
    eArea.append('<br>');
    let type2 = pkmn.pType2 ? ` / ${pkmn.pType2}<br>` : '<br>';
    eArea.append(`Type: ${pkmn.pType1}${type2}`);
    
    // Appending DOM elements to page
    ew.prepend(msg);
    outs.append(ew);
}

function printBattle(output) {
    // Clearing previous content
    outs.empty();
    bAreaL.empty();
    bAreaR.empty();

    outs.append(bw);
    if (output.trainer1) {
        const user = output.trainer1;
        const userPoke = user.party[user.active];
        const ai = output.trainer2;
        const aiPoke = ai.party[ai.active];

        eArea.html(ai.name
            + '<br>'
            + aiPoke.name + ' ' + aiPoke.currHp + '/' + aiPoke.maxHp
            + '<br><br>'
            + user.name
            + '<br>'
            + userPoke.name + ' ' + userPoke.currHp + '/' + userPoke.maxHp
            + '<br>Moves: ' + userPoke.moves[0] + ', ' + userPoke.moves[1]);

    } else {
        bArea.text(output);
    }
}
