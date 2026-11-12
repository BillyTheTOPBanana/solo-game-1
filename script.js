const NUMBER_OF_LETTERS = 12;

const letter_container = document.querySelector("#letter-container");
const submit_button    = document.querySelector("#submit-word");
const typing_area      = document.querySelector("#typing-area");
const debug_print_area = document.querySelector("#debug-print");
const word_list        = document.querySelector("#word-list-container ul");
let letters; // Array

let used_words = [];

init();

function init() {
    used_words = [];

    for (let i = 0; i < NUMBER_OF_LETTERS; ++i) {
        const letter_button = document.createElement("button");
        letter_button.classList.add("letter");
    
        const random_ascii_capital = Math.floor(Math.random()*26) + 65; // ASCII 65 is A
        letter_button.textContent = String.fromCharCode(random_ascii_capital);
    
        letter_button.addEventListener("click", (e) => activate_letter(e.target) );
        letter_container.appendChild(letter_button);
    }
    letters = [...document.querySelectorAll(".letter")];

    submit_button.addEventListener("click", (e) => submit_word() );

    document.addEventListener("keydown", (e) => {
        
        if (e.key === "Enter") {
            submit_word();
            return;
        }
        
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
        const letter_matches = letters.filter( (node) => node.textContent.toUpperCase() === e.key.toUpperCase());

        const first_unbanked = letter_matches.find( (node) => !node.classList.contains("banked-letter"));
        if (first_unbanked) {
            const first_unbanked_untyped = letter_matches.find( (node) => !node.classList.contains("banked-letter") && !node.classList.contains("typed-letter") );
            if (first_unbanked_untyped)
                activate_letter(first_unbanked_untyped);
            else
                activate_letter(first_unbanked);
        }
        else {
            const first_banked = letter_matches.find( (node) => node.classList.contains("banked-letter"));
            if (first_banked) {
                const first_banked_untyped = letter_matches.find( (node) => node.classList.contains("banked-letter") && !node.classList.contains("typed-letter") );
                if (first_banked_untyped)
                    activate_letter(first_banked_untyped);
                else
                    activate_letter(first_banked);
            }
        }
    });

}

function activate_letter(letter) {
    console.assert(letter instanceof Node);
    
    typing_area.textContent += letter.textContent;
    letter.classList.add("typed-letter");
}

function submit_word() {
    const new_word = typing_area.textContent;
    typing_area.textContent = "";

    if (used_words.includes(new_word)) {
        debug_print(`${new_word} already used!`);
        letters.forEach( (letter) => letter.classList.remove("typed-letter") );
        
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

    for (const letter of letters) {
        if (letter.classList.contains("typed-letter"))
            letter.classList.replace("typed-letter", "banked-letter");        
    }

    if (letters.every( letter => letter.classList.contains("banked-letter"))) {
        debug_print("WONK!");
        letters.forEach( letter => letter.classList.remove("banked-letter"));
    }
}

function debug_print(str) {
    console.log("debug_print:", str);
    debug_print_area.textContent = str.toString();
}
