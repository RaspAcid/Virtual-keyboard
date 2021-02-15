const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false,
        enRu: false
    },

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });
    },

    
    keyLayoutEn: [
        "`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
        "q", "w", "e", "r", "t", "y", "u", "i", "o", "p","[", "]",
        "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter",
        "done", "shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?",
        "🕨", "eng", " ", "<", ">"
    ],

    keyLayoutRu: [
        "ё", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
        "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ",
        "caps", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "enter",
        "done", "shift", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ".",
        "🕨", "rus", " ", "<", ">"
    ],

    _createKeys(keyLayout = this.keyLayoutEn) {
        const fragment = document.createDocumentFragment();

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["backspace", "]", "enter", "?"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    keyElement.addEventListener("click", () => {
                        var input = document.getElementById("focus");
                        input.focus();
                        var selectedTextArea = document.activeElement;
                        var cursorSelect = selectedTextArea.selectionStart;
                        this.properties.value = this.properties.value.substring(0, cursorSelect - 1) +
                            this.properties.value.substring(cursorSelect, this.properties.value.length);
                        this._triggerEvent("oninput");
                        input.setSelectionRange(cursorSelect - 1, cursorSelect - 1);
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");

                    keyElement.addEventListener("click", () => {
                        var input = document.getElementById("focus");
                        input.focus();
                        var selectedTextArea = document.activeElement;
                        var cursorSelect = selectedTextArea.selectionStart;
                        this.properties.value = this.properties.value.substring(0, cursorSelect) + "\n" + this.properties.value.substring(cursorSelect, this.properties.value.length);
                        this._triggerEvent("oninput");
                        input.setSelectionRange(cursorSelect + 1, cursorSelect + 1);
                    });

                    break;

                case "eng" || "rus":
                    keyElement.classList.add("keyboard__key", "keyboard__key--toggle");
                    keyElement.innerHTML = "eng";

                    keyElement.addEventListener("click", () => {
                        this._toggleEnRu();
                        keyElement.classList.toggle("keyboard__key--shift", this.properties.enRu, keyElement.innerHTML = this.properties.enRu ? "rus" : "eng");

                    });

                    break;

                case "shift":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--toggle");
                    keyElement.innerHTML = "shift";
                    break;

                case " ":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += " ";
                        this._triggerEvent("oninput");
                    });

                    break;

                case "<":
                    keyElement.classList.add("keyboard__key");
                    keyElement.innerHTML = createIconHTML("arrow_left");

                    keyElement.addEventListener("click", () => {
                        this._selectTextLeft();
                    });
                    break;

                case ">":
                    keyElement.classList.add("keyboard__key");
                    keyElement.innerHTML = createIconHTML("arrow_right");

                    keyElement.addEventListener("click", () => {
                        this._selectTextRight();
                    });
                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("check_circle");

                    keyElement.addEventListener("click", () => {
                        this.close();
                        this._triggerEvent("onclose");
                    });

                    break;

                case "🕨":
                    keyElement.classList.add("keyboard__key");
                    keyElement.innerHTML = "🕨";
                    break

                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        var input = document.getElementById("focus");
                        input.focus();
                        this.properties.value += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                        this._triggerEvent("oninput");
                    });

                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    _selectTextLeft() {
        var input = document.getElementById("focus");
        input.focus();
        var selectedTextArea = document.activeElement;
        if (selectedTextArea.selectionStart != 0) {
            input.setSelectionRange(selectedTextArea.selectionStart - 1, selectedTextArea.selectionEnd - 1);
        }
    },

    _selectTextRight() {
        var input = document.getElementById("focus");
        input.focus();
        var selectedTextArea = document.activeElement;
        input.setSelectionRange(selectedTextArea.selectionStart + 1, selectedTextArea.selectionEnd + 1);
        input.focus();
    },

    _toggleEnRu() {
        this.properties.enRu = !this.properties.enRu;

        for (i in this.elements.keys) {
            /*if (this.elements.keys[i].childElementCount === 0 && (i != 0 || i < 13)) {
                if (!this.properties.enRu) {

                    this.elements.keys[i].textContent = this.properties.shift ? this.keyLayoutShiftEn[i].toUpperCase() :
                        this.keyLayoutEn[i];
                } else {
                    this.elements.keys[i].textContent = this.properties.shift ? this.keyLayoutShiftRu[i].toUpperCase() :
                        this.keyLayoutRu[i];
                }
            }*/

            if (this.elements.keys[i].childElementCount === 0 && (i == 0 || i >= 13)) {
                this.elements.keys[i].textContent = !this.properties.shift ?
                    this.properties.enRu ?
                    (this.properties.capsLock ? this.keyLayoutRu[i].toUpperCase() :
                        this.keyLayoutRu[i]) :
                    (this.properties.capsLock ? this.keyLayoutEn[i].toUpperCase() :
                        this.keyLayoutEn[i]) :
                    this.properties.enRu ?
                    (this.properties.capsLock ? this.keyLayoutRu[i] :
                        this.keyLayoutRu[i].toUpperCase()) :
                    (this.properties.capsLock ? this.keyLayoutEn[i] :
                        this.keyLayoutEn[i].toUpperCase())
            }
        }
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    }
};

let keyCaps = false;
document.onkeydown = function (event) {
        let press = document.querySelectorAll(`button`).forEach(btn => {
        console.log(event.key +' == ' + 'Enter')
        if (event.key.toLowerCase() == btn.innerText.toLowerCase()) { 
            btn.classList.add('keyboard__key--active');
        }
    });
}

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});