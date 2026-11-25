const NUMBER_OF_LETTERS = 12;

// Weights are letter frequencies (as found in texts, not the dicitonary) found on Wikipedia: https://en.wikipedia.org/wiki/Letter_frequency
const letter_weights = {A: 0.082, B: 0.015, C: 0.028, D: 0.043, E: 0.127, F: 0.022, G: 0.02, H: 0.061, I: 0.07, J: 0.0016, K: 0.0077, L: 0.04, M: 0.024, N: 0.067, O: 0.075, P: 0.019, Q: 0.0012, R: 0.06, S: 0.063, T: 0.091, U: 0.028, V: 0.0098, W: 0.024, X: 0.0015, Y: 0.02, Z: 0.00074};

// Create function get_rand() using today's date as the seed.
// This should deterministically produce each day's unique set of letters.
const todays_date = new Date().toISOString().slice(0,10);
const seed = cyrb128(todays_date);
const get_rand = sfc32(...seed);

const letter_container = document.querySelector("#letter-container");
const submit_button    = document.querySelector("#submit-word");
const backspace_button = document.querySelector("#backspace");
const clear_button     = document.querySelector("#clear-word");
const typing_area      = document.querySelector("#typing-area");
const debug_print_area = document.querySelector("#debug-print");
const word_list        = document.querySelector("#word-list-container ul");

const date_spans       = document.querySelectorAll(".todays-date");

// Trying out a "HTML prototype" pattern for the wonk effects.
// The prototype element in the HTML has attribute `hidden=""`
// The script will copy from the prototype in order to generate more at runtime.
const wonk_effect = document.querySelector(".wonk-effect");

let letter_nodes; // Array
let used_words = [];

init();

function init() {
    used_words = [];

    for (let i = 0; i < NUMBER_OF_LETTERS; ++i) {
        const letter_button = document.createElement("button");
        letter_button.classList.add("letter");
    
        const random_letter = random_weighted_selection(letter_weights);
        letter_button.textContent = random_letter;
    
        letter_button.addEventListener("click", (e) => activate_letter_node(e.target) );
        letter_container.appendChild(letter_button);
    }
    letter_nodes = [...document.querySelectorAll(".letter")];

    date_spans.forEach( (node) => node.textContent = todays_date );

    submit_button   .addEventListener("click", (e) => submit_word() );
    backspace_button.addEventListener("click", (e) => backspace() );
    clear_button    .addEventListener("click", (e) => clear_word() );

    document.addEventListener("keydown", (e) => {
        debug_print(`Pressed key, e.key === ${e.key}`);

        if (e.key === "Enter") {
            submit_word();
            return;
        }
        else if (e.key === "Escape") {
            clear_word();
            return;
        }
        else if (e.key === "Backspace") {
            backspace();
            return;
        }
        
        try_use_letter(e.key);
    });
}

function try_use_letter(letter) {
    console.assert(typeof letter === "string");

    /*
    Since there can be more than one button with the same letter, we use a priority system to make the best strategic choice:
    
    Do any unbanked of this letter exist?
        Do any unbanked untyped of this letter exist? Choose the first one.
        Else, choose the first unbanked of this letter.
    Else, do any banked of this letter exist?
        Do any banked untyped of this letter exist? choose the first one.
        Else, choose the first banked of this letter.
    Else, do nothing.
    */
    const letter_matches = letter_nodes.filter( (node) => node.textContent.toUpperCase() === letter.toUpperCase());

    const first_unbanked = letter_matches.find( (node) => !node.classList.contains("banked-letter"));
    if (first_unbanked) {
        const first_unbanked_untyped = letter_matches.find( (node) => !node.classList.contains("banked-letter") && !node.classList.contains("typed-letter") );
        if (first_unbanked_untyped)
            activate_letter_node(first_unbanked_untyped);
        else
            activate_letter_node(first_unbanked);
    }
    else {
        const first_banked = letter_matches.find( (node) => node.classList.contains("banked-letter"));
        if (first_banked) {
            const first_banked_untyped = letter_matches.find( (node) => node.classList.contains("banked-letter") && !node.classList.contains("typed-letter") );
            if (first_banked_untyped)
                activate_letter_node(first_banked_untyped);
            else
                activate_letter_node(first_banked);
        }
    }
}

function activate_letter_node(letter_node) {
    console.assert(letter_node instanceof Node);
    
    typing_area.textContent += letter_node.textContent;
    letter_node.classList.add("typed-letter");
}

function submit_word() {
    const new_word = typing_area.textContent;
    typing_area.textContent = "";

    if (used_words.includes(new_word)) {
        debug_print(`${new_word} already used!`);
        letter_nodes.forEach( (letter) => letter.classList.remove("typed-letter") );
        
        return;
    }
    
    debug_print("word submitted: " + new_word);

    used_words.unshift(new_word);
    const new_li = document.createElement("li");
    new_li.textContent = new_word;
    const first_li = word_list.firstChild;
    if (first_li === null)
        word_list.appendChild(new_li);
    else
        word_list.insertBefore(new_li, first_li);

    for (const letter of letter_nodes) {
        if (letter.classList.contains("typed-letter"))
            letter.classList.replace("typed-letter", "banked-letter");        
    }

    if (letter_nodes.every( letter => letter.classList.contains("banked-letter"))) {
        debug_print("WONK!");
        const new_wonk_effect = wonk_effect.cloneNode(true);
        new_wonk_effect.removeAttribute("hidden");
        // @TODO: randomize appearance, especially positioning
        wonk_effect.after(new_wonk_effect);
        
        letter_nodes.forEach( letter => letter.classList.remove("banked-letter"));
    }
}

function clear_word() {
    typing_area.textContent = "";
    letter_nodes.forEach( (letter) => letter.classList.remove("typed-letter") );
}

function backspace() {
    if (typing_area.textContent === "")
        return;
    
    const last_letter = typing_area.textContent.at(-1);
    typing_area.textContent = typing_area.textContent.substring(0,typing_area.textContent.length - 1);

    // Clear the current word then "re-type" all but the last letter.
    letter_nodes.forEach( (node) => node.classList.remove("typed-letter") );
    const typed_word = typing_area.textContent;
    typing_area.textContent = "";
    typed_word.split("").forEach( (letter) => try_use_letter(letter) );
}

function debug_print(str) {
    console.log("debug_print:", str);
    debug_print_area.textContent = str.toString();
}



// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// Functions below this line are written to be re-useable.
// Early in the next course, TOP will teach how to import/export with modules.
// Until then, I will just include everything in one file.
// ------------------------------------------------------------------------------

function random_weighted_selection(weights) {
    // The argument `weights` should be an object where all of the values are numbers.
    // Randomly return one of the keys, using the values as probabilistic weights.
    // The weight values need not add to 1, but they should be non-negative.
    
    total_weight = Object.values(weights).reduce( (sum, next) => sum += next, 0);
    rand = get_rand() * total_weight;
    for (const key of Object.keys(weights)) {
        if (rand < weights[key])
            return key;
        rand -= weights[key];
    }
}

/*
Hash generator function
Source: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
*/
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

/*
Seedable random number generator
Source: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
Use cyrb128(str) to generate the four seed numbers required.
*/
function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

function test_random(seed_string) {
    const seed = cyrb128(seed_string);
    const generate_random_number = sfc32(...seed);
    for (let i = 0; i < 10; ++i) {
        console.log(generate_random_number());
    }
}