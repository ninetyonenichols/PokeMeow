const mongoose = require('mongoose');
const mongoDBURL = 'mongodb://127.0.0.1/pokemeow';
mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const PokemonSchema = new Schema({
    name: { type: String, required: true },
    sprite: { type: String, default: '../../public_html/img/sprites/default.jpg' },
    pType1: {
        type: String,
        enum: [ 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
        'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal',
        'poison', 'psychic', 'rock', 'steel', 'water' ],
        default: 'normal'
    },
    pType2: {
        type: String,
        enum: [ 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
        'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal',
        'poison', 'psychic', 'rock', 'steel', 'water' ],
    },
    maxHp: { type: Number, default: 100 },
    currHp: { type: Number, default: 100 },
    atk: { type: Number, default: 100 },
    def: { type: Number, default: 100 },
    moves: [{ type: String, enum: [
        'bugBuzz', 'darkPulse', 'outrage', 'thunderbolt', 'moonblast',
        'closeCombat', 'flamethrower', 'skyAttack', 'shadowBall',
        'solarBeam', 'earthquake', 'iceBeam', 'hyperBeam', 'sludgeWave',
        'psychic', 'rockSlide', 'flashCannon', 'hydroCannon'
    ]}],
    catchRate: { type: Number, default: 0.6 },
    fleeRate: { type: Number, default: 0.1 },
});
const Pokemon = new mongoose.model('Pokemon', PokemonSchema);


const TrainerSchema = new Schema({
    name: { type: String, unique: true, required: true },
    photo: { type: String, default: '../../public_html/img/avatars/default.png' },
    pokemon: [ PokemonSchema ],
    party: [ PokemonSchema ],
    active: Number,
    battle: { type: ObjectId, ref: 'Battle' },
    encounter: PokemonSchema
});
const Trainer = new mongoose.model('Trainer', TrainerSchema);



const trainersAI = [
    {
        name: "Bug Catcher",
        photo: "../../public_html/img/avatars/bugCatcher.png",
        party: ["Beedrill","Scyther","Pinsir"]
    },
    {
        name: "Blue",
        photo: "../../public_html/img/avatars/blue.png",
        party: ["Arcanine","Exeggutor","Blastoise"]
    },
    {
        name: "Lorelei",
        photo: "../../public_html/img/avatars/lorelei.png",
        party: ["Slowbro","Vaporeon","Lapras"]
    },
    {
        name: "Giovanni",
        photo: "../../public_html/img/avatars/giovanni.png",
        party: ["Persian","Rhydon","Nidoking"]
    },
    {
        name: "Lance",
        photo: "../../public_html/img/avatars/lance.png",
        party: ["Gyarados","Charizard","Dragonite"]
    }
]

for (let t of trainersAI) {
    let newTrainer = new Trainer({name: t.name, photo: t.photo});
    for (let p of t.party) {
        Pokemon.findOne({name: p})
        .lean()
        .exec((err, pkmnObj) => {
            delete pkmnObj['_id'];
            if (pkmnObj['moves'].length != 2) { return; }
            let mv1 = pkmnObj['moves'][0];
            let mv2 = pkmnObj['moves'][1];
            pkmnObj['moves'] = [mv1, mv2];
            newTrainer.party.push(new Pokemon(pkmnObj));
            newTrainer.save();
        });
    }
}
