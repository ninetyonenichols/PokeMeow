/* Filename: home.js
 * Authors: Justin Nichols (jdnscience), Charles McLean (mcharlie)
 * Class: CSc 337 Summer 2020
 * Description: This file contains the functions need to submit a command to
 *      the server and properly display the output recieved into the output
 *      window in home.html.
 */

//constants
//const serverURL = 'http://157.245.236.86';
const serverURL = 'http://64.227.49.233';
var modeURL = '/command/';

createWindows();

// Printing welcome message / main menu, and saving some shortcuts
$(document).ready(() => {
    outs = $('#outputSection');
    cmdBox = $('#command');
    // Submit the command when either the button is clicked or 'Enter' is pressed
    $('#commandBtn').click(() => { submitCmd(cmdBox.val()); });
    $('#command').keypress(function (e) {
        if (e.which == 13) { submitCmd(cmdBox.val()); }
    });
    printMain();
});

/*  Description: This function submits the command string given by the user to
 *      the server, then it handles the response by possibly changing the
 *      'modeURL' and calling the appropriate functions to display the response.
 *  Parameters: 
 *      cmd - the name of the command
 */
function submitCmd(cmd) {
    if (cmd == '') { return; }

    $.ajax({
        type: 'POST',
        url: serverURL + modeURL,
        data: JSON.stringify({command: cmd}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (res) => {
            // res will have either main, encounter, or battle populated for any valid cmd
            // if none populated, cmd invalid
            if (res.main) {
                handleResMain(res.main);
                modeURL = '/command/';
            } else if (res.encounter) {
                handleResEnc(res.encounter);
                modeURL = '/command/rand-enc/';
            } else if (res.battle) {
                handleResBattle(res.battle);
                modeURL = '/command/battle/';
            } else {
                addMsg('Invalid Command');
            }
        }
    });

    $('#command').val("");
}

/* Description: Dispatches commands when in Main mode
 * Parameters: 
 *     rMain - the 'main' portion of the ajax return-data
 */
function handleResMain(rMain) {
    mw.empty();
    chwin('mw');
    printMain();
    if (isStr(rMain)) { addMsg(rMain); }
    else if (rMain.party || rMain.collection) { printPkmnArray(rMain); }
}

/* Description: Dispatches commands when in Encounter mode
 * Parameters: 
 *     rEnc - the 'encounter' portion of the ajax return-data
 */
function handleResEnc(rEnc) {
    chwin('ew');
    if (isStr(rEnc)) { addMsg(rEnc); }
    else { printEncounter(rEnc); }
}

/* Description: Dispatches commands when in Battle mode
 * Parameters: 
 *     rBtl - the 'battle' portion of the ajax return-data
 */
function handleResBattle(rBtl) {
    chwin('bw');
    if (rBtl.battleData) { printBattle(rBtl.battleData); }
    addMsg(rBtl.message);
}

/* Description: Adds a message to the msg bar
 * Parameters:
 *     message - the message to be displayed
 */
function addMsg(message) {
    msg.empty();
    msg.append(message);
}

/* Creates the output windows and populates them with elements
 */
function createWindows() {
    // Creating windows (main, eArea.unter, battle)
    mw = $('<div>', { "id":"mw", class:"outputWindow" });
    ew = $('<div>', { "id":"ew", class:"outputWindow" });
    bw = $('<div>', { "id":"bw", class:"outputWindow" });

    // Creating messages to populate windows
    msg = $('<div>', { "id":"msg" });

    // Creating areas for pokemon / trainers to appear
    mArea = $('<div>', { "id":"mArea", class:"xArea" });
    eArea = $('<div>', { "id":"eArea", class:"xArea" });
    bAreaL = $('<div>', { "id":"bAreaL", class:"xArea" });
    bAreaR = $('<div>', { "id":"bAreaR", class:"xArea" });

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
  return Object.prototype.toString.call(x) === "[object String]";
}

/* Description: This function prints out the options available to the player at
 *     the main game-screen.
 * Parameters: none.
 */
function printMain() {
    // Clearing previous content
    outs.empty();
    mw.empty();
    mArea.empty();

    // Adding content to DOM elements
    addMsg('Welcome to PokeMeow!');

    // Adding DOM elements to page
    addMMBtns();
    mw.prepend(msg);
    mw.append(mArea);
    outs.append(mw);
}

/* Description: Adds buttons to the main menu
 * Parameters: none.
 */
function addMMBtns() {
    var pBtn = $('<input type="button" value="Wild Pokemon">');
    pBtn.on('click', function() { submitCmd('p'); });
    mArea.append(pBtn);
    mArea.append('<br>');

    var partyBtn = $('<input type="button" value="View Party">');
    partyBtn.on('click', function() { submitCmd('party'); });
    mArea.append(partyBtn);
    mArea.append('<br>');
    
    var storageBtn = $('<input type="button" value="View Storage">');
    storageBtn.on('click', function() { submitCmd('storage'); });
    mArea.append(storageBtn);
    mArea.append('<br>');
    
    var battleBtn = $('<input type="button" value="Battle">');
    battleBtn.on('click', function() { submitCmd('battle'); });
    mArea.append(battleBtn);
    mArea.append('<br>');
}

/* Description: This function prints out the info for one pokemon
 * Parameters:
 *     rEnc - the encounter data from the ajax response 
 */
function printEncounter(rEnc) {
    var pkmn = rEnc.encPkmn;

    // Clearing previous content
    eArea.empty();

    // Adding content to DOM elements
    addMsg(rEnc.message);
    eArea.append(`<b>${pkmn.name}</b><br>`);
    eArea.append($('<img>', { src: pkmn.sprite, width: '200px',
        alt: `A picture of ${pkmn.name}.` }));
    eArea.append('<br>');
    eArea.append(`<u>Type:</u><br>`);
    eArea.append(`${pkmn.pType1}<br>`);
    if (pkmn.pType2) { eArea.append(`${pkmn.pType2}<br>`) };
    eArea.append('<br>');

    var pbBtn = $('<input type="button" value="Throw Pokeball">');
    pbBtn.on('click', function() { submitCmd('pb'); });
    eArea.append(pbBtn);
    eArea.append('<br>');

    var runBtn = $('<input type="button" value="Run">');
    runBtn.on('click', function() { submitCmd('run'); });
    eArea.append(runBtn);
    eArea.append('<br>');

    // Appending DOM elements to page
    ew.prepend(msg);
}

/* Description: Prints the current state of the battle
 * Parameters:
 *     battleData - the object containing the battle's info
 */
function printBattle(battleData) {
    // Clearing previous content
    outs.empty();
    bAreaL.empty();
    bAreaR.empty();

    outs.append(bw);

    const user = battleData.trainer1;
    const ai = battleData.trainer2;

    printBattleUser(user);
    printBattleAI(ai);

}

/* Description: This function prints the user's info in battle
 * Parameters:
 *     user - an object containing the user's data
 */
function printBattleUser(user){
    var party = user.party;
    var pkmn = party[user.active];

    // Player data
    bAreaL.append(`<b>${user.name}</b><br>`);
    bAreaL.append($('<img>', { src: user.photo, width: '110px',
        alt: `A picture of ${user.name}` }));
    bAreaL.append($('<img>', { src: pkmn.sprite, width: '110px',
        alt: `A picture of ${pkmn.name}.`, class: 'img-hor' }));
    bAreaL.append(`<br>`);
    bAreaL.append(`<b>${pkmn.name}</b><br>`);
    bAreaL.append(`HP: ${pkmn.currHp}/${pkmn.maxHp}<br>`);
    bAreaL.append(`<br>`);
    bAreaL.append(`<u>Moves:</u><br>`);

    var mv1 = pkmn.moves[0];
    var mv1Btn = $(`<input type="button" value=\"${mv1}\">`);
    mv1Btn.on('click', function() { submitCmd(`use ${mv1}`); });
    bAreaL.append(mv1Btn);
    bAreaL.append('<br>');

    var mv2 = pkmn.moves[1];
    var mv2Btn = $(`<input type="button" value=\"${mv2}\">`);
    mv2Btn.on('click', function() { submitCmd(`use ${mv2}`); });
    bAreaL.append(mv2Btn);
    bAreaL.append('<br>');

    bAreaL.append('<br>');
    bAreaL.append(`<u>Party:</u><br>`);
    if (party.length == 1) {
        bAreaL.append('none');
    } else {
        for (i in party) {
            if (i != user.active) { 
                let partyStr = `${party[i].name}`;
                var switchBtn = $(`<input type="button" value=\"${partyStr}\">`);
                switchBtn.on('click', function() { submitCmd(`switch ${partyStr}`); });
                bAreaL.append(switchBtn);
                bAreaL.append('<br>');
            }
        }
    }
    bAreaL.append('<br>');

    var runBtlBtn = pkmn.moves[1];
    var runBtlBtn = $(`<input type="button" value="Run">`);
    runBtlBtn.on('click', function() { submitCmd(`run`); });
    bAreaL.append(runBtlBtn);
    bAreaL.append('<br>');
}

/* Description: This function prints the AI's info in battle
 * Parameters:
 *     ai - an object containing the ai's data
 */
function printBattleAI(ai) {
    const pkmn = ai.party[ai.active];

    // AI data
    bAreaR.append(`<b>${ai.name}</b><br>`);
    bAreaR.append($('<img>', { src: pkmn.sprite, width: '110px',
        alt: `A picture of ${pkmn.name}.` }));
    bAreaR.append($('<img>', { src: ai.photo, width: '110px',
        alt: `A picture of ${ai.name}.` }));
    bAreaR.append(`<br>`);
    bAreaR.append(`<b>${pkmn.name}</b><br>`);
    bAreaR.append(`HP: ${pkmn.currHp}/${pkmn.maxHp}<br>`);
}

/* Description: This funciton prints out an array of pokemon
 * Parameters:
 *     rMain - the object containing the response.main object
 */
function printPkmnArray(rMain) {
    mw.empty();
    mw.prepend(msg);
    addMsg(rMain.message);
    
    var mainBtn = $(`<input type="button" value="Main Menu">`);
    mainBtn.on('click', function() { printMain(); });
    mw.append(mainBtn);
    mw.append('<br>');

    var pkmnArray;
    var party = rMain.party;
    var col = rMain.collection;
    var loc;
    if (party) {
        pkmnArray = party;
        loc = "party";
    } else if (col) {
        pkmnArray = col;
        loc = "storage";
    }

    for (i in pkmnArray) {
        printPkmn(pkmnArray[i], loc);
    }
}

/* Description: prints one pokemon owned by the player
 * Parameters:
 *     pkmn - the object containing the pokemon's info
 */
function printPkmn(pkmn, loc) {
    var pkmnContainer = $('<div>', {class:'pkmnContainer'});
    // lbox contains pkmn sprite + name
    var lbox = $('<div style="float:left; width:33%;"></div>');
    lbox.append(`<b>${pkmn.name}</b><br>`);
    lbox.append($('<img>', { src: pkmn.sprite, width: '160px',
        alt: `A picture of ${pkmn.name}.` }));
    // cbox contains pkmn stats + typing
    var cbox = $('<div style="float:left; width:26%;"></div>');
    cbox.append(`<u>Type:</u><br>`);
    cbox.append(`${pkmn.pType1}<br>`);
    if (pkmn.pType2) { cbox.append(`${pkmn.pType2}<br>`); }
    cbox.append(`<br>`);
    cbox.append(`<u>Stats:</u><br>`);
    cbox.append(`Atk: ${pkmn.atk}<br>`);
    cbox.append(`Def: ${pkmn.def}<br>`);
    cbox.append(`HP: ${pkmn.maxHp}<br>`);
    var rbox = $('<div style="float:left; width:41%;"></div>');
    rbox.append(`<u>Moves:</u><br>`);
    rbox.append(`${pkmn.moves[0]}<br>`);
    rbox.append(`${pkmn.moves[1]}<br>`);
    rbox.append('<br>');
    
    if (loc == "storage") {
        var addBtn = $(`<input type="button" value="Add to Party">`);
        addBtn.on('click', function() { submitCmd(`add ${pkmn.name}`); });
        rbox.append(addBtn);
        rbox.append('<br>');
    } else {
        var rmBtn = $(`<input type="button" value="Send to Storage">`);
        rmBtn.on('click', function() { submitCmd(`remove ${pkmn.name}`); });
        rbox.append(rmBtn);
        rbox.append('<br>');
    }

    var releaseBtn = $(`<input type="button" value="Release Pokemon">`);
    releaseBtn.on('click', function() { submitCmd(`release ${pkmn.name}`); });
    rbox.append(releaseBtn);
    rbox.append('<br>');

    // Adding everything to DOM
    pkmnContainer.append(lbox);
    pkmnContainer.append(cbox);
    pkmnContainer.append(rbox);
    mw.append(pkmnContainer);
}
