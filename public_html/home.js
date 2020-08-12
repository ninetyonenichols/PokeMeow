/* Filename: home.js
 * Authors: Justin Nichols (jdnscieArea.), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description:
 */

//constants
//const serverURL = 'http://157.245.236.86';
const serverURL = 'http://64.227.49.233';
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
        success: (res) => {
            if (res.main) {
                mw.empty();
                chwin('mw');
                if (isStr(res.main)) { msg.text(res.main); }
                else { printPkmnArray(res.main); }
                modeURL = '/command/';
            } else if (res.encounter) {
                chwin('ew');
                if (isStr(res.encounter)) { msg.text(res.encounter); }
                else { printEncounter(res.encounter); }
                modeURL = '/command/rand-enc/';
            } else if (res.battle) {
                chwin('bw');
                if (isStr(res.battle)) { msg.text(res.battle); }
                else { printBattle(res.battle); }
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

/* Changes the outputWindow
 */
function chwin(winName) {
    let win = eval(winName); 
    outs.empty();
    win.prepend(msg);
    outs.append(win);
}

/* Checks if an object is a string
 * DISCLAIMER: this function is from stack overflow.
 * I would rewrite it, but it is only one line, and I am not sure what can be rewritten.
 */
function isStr(x) {
  return Object.prototype.toString.call(x) === "[object String]"
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

/* Description: This funciton prints out an array of pokemon
 */
function printPkmnArray(rMain) {
    mw.empty();
    mw.prepend(msg);

    var pkmnArray; 
    var party = rMain.party;
    var col = rMain.collection;
    if (party) {
        msg.text('Party');
        pkmnArray = party;
    } else if (col) {
        msg.text('Collection');
        pkmnArray = col;
    }

    for (i in pkmnArray) {
        printPkmn(pkmnArray[i]);
    }
}

/* Description: prints one pokemon owned by the player
 * Parameters: none.
 */
function printPkmn(pkmn) {
    var pkmnContainer = $('<div></div>');
    // lbox contains pkmn sprite + name
    var lbox = $('<div style="float:left; width:33%;"></div>');
    lbox.append(`${pkmn.name}<br>`);
    lbox.append($('<img>', { src: pkmn.sprite, width: '160px',
        alt: `A picture of ${pkmn.name}.` }));
    // cbox contains pkmn stats + typing 
    var cbox = $('<div style="float:left; width:26%;"></div>');
    let type2 = pkmn.pType2 ? ` / ${pkmn.pType2}<br>` : '<br>';
    cbox.append(`Type: ${pkmn.pType1}${type2}<br>`);
    cbox.append(`Atk: ${pkmn.atk}<br>`);
    cbox.append(`Def: ${pkmn.def}<br>`);
    cbox.append(`HP: ${pkmn.maxHp}<br>`);
    var rbox = $('<div style="float:left; width:41%;"></div>');
    rbox.append(`Moves:<br>`);
    rbox.append(`${pkmn.moves[0]}<br>`);
    rbox.append(`${pkmn.moves[1]}<br>`);
    // Adding everything to DOM
    pkmnContainer.attr('class', 'pkmnContainer');
    pkmnContainer.append(lbox);
    pkmnContainer.append(cbox);
    pkmnContainer.append(rbox);
    mw.append(pkmnContainer);
}
