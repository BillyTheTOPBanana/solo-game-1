const NUMBER_OF_LETTERS = 12;

const letter_container = document.querySelector("#letter-container");
const submit_button    = document.querySelector("#submit-word");
const typing_area      = document.querySelector("#typing-area");
const debug_print_area = document.querySelector("#debug-print");
let letter_list; // NodeList
let letter_array; // Array
init();

function init() {
    for (let i = 0; i < NUMBER_OF_LETTERS; ++i) {
        const letter_button = document.createElement("button");
        letter_button.classList.add("letter");
    
        const random_ascii_capital = Math.floor(Math.random()*26) + 65; // ASCII 65 is A
        letter_button.textContent = String.fromCharCode(random_ascii_capital);
    
        letter_button.addEventListener("click", (e) => activate_letter(e.target) );
        letter_container.appendChild(letter_button);
    }
    letter_list = document.querySelectorAll(".letter");
    letter_array = Array.from(letter_list);

    submit_button.addEventListener("click", (e) => submit_word() );

    document.addEventListener("keydown", (e) => {
        /*
        cases:
        - no such letter: nothing happens. otherwise, type it.
        - else, any letters that are NEITHER "banked-letter" nor "typed-letter" exist: make the first one become "typed-letter"
        - else, any letters that are "banked-letter" but not "typed-letter" exist: make the first one become "typed-letter".
        
        pseudocode for priority:
        do any unbanked of this letter exist?
            do any unbanked untyped of this letter exist? choose the first one.
            else, choose the first unbanked of this letter.
        else, do any banked of this letter exist?
            do any banked untyped of this letter exist? choose the first one.
            else, choose the first banked of this letter.
        else, do nothing.

        */
        // const first_unbanked_letter = letter_array.find( (node) => node.textContent === e.key.toUpperCase() && !node.classList.contains("banked-letter"));
        // if (first_unbanked_letter !== undefined) {
        //     activate_letter(first_unbanked_letter);
        // }
        // else {
        //     const first_banked_letter   = letter_array.find( (node) => node.textContent === e.key.toUpperCase() && node.classList.contains("banked-letter"));
        //     if (first_banked_letter !== undefined) {
        //         activate_letter(first_banked_letter);
        //     }
        //     // else do nothing
        // }

        if (e.key === "Enter") {
            //click submit
            return;
        }

        const letter_matches = letter_array.filter( (node) => node.textContent === e.key.toUpperCase());

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
        // else an invalid letter was typed, so do nothing.

    });

}

function activate_letter(letter) {
    console.assert(letter instanceof Node);
    
    typing_area.textContent += letter.textContent;
    letter.classList.add("typed-letter");
}

function submit_word() {
    debug_print("word submitted: " + typing_area.textContent);
    
    letter_list.forEach( (letter) => {
        if (letter.classList.contains("typed-letter"))
            letter.classList.replace("typed-letter", "banked-letter");
    });

    if (letter_array.every( letter => letter.classList.contains("banked-letter"))) {
        debug_print("WONK!");
        letter_list.forEach( letter => letter.classList.remove("banked-letter"));
    }

    typing_area.textContent = "";
}

function debug_print(str) {
    console.log("debug_print:", str);
    debug_print_area.textContent = str.toString();
}
