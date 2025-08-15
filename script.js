// --- State Management ---
let words = [];
let groups = [];
let selected = [];
let singleWordColors = {}; // Stores colors for individual words

// --- Constants ---
const CATEGORY_COLORS = {
    yellow: "#f8df74",
    green: "#a1c35f",
    blue: "#b1c4ee",
    purple: "#ba82c3"
};
const defaultWords = ["APPLE", "BANANA", "CHERRY", "DATE", "ELDERBERRY", "FIG", "GRAPE", "HONEYDEW", "KIWI", "LEMON", "MANGO", "NECTARINE", "ORANGE", "PAPAYA", "QUINCE", "RASPBERRY"];

/**
 * Runs when the page first loads to populate the default puzzle.
 */
window.onload = function() {
    // Initialize the grid with the default puzzle words
    words = [...defaultWords];
    groups = [];
    selected = [];
    singleWordColors = {};
    renderGrid();

    // Clear the input field to show the placeholder text
    document.getElementById('wordInput').value = '';
};

/**
 * Initializes or resets the game with words from the input field.
 */
function startGame() {
    const wordInput = document.getElementById('wordInput');
    let currentInput = wordInput.value.trim();

    if (!currentInput) {
        // If the user clears the box and hits start, clear the grid and the words data.
        words = [];
        groups = [];
        selected = [];
        singleWordColors = {};
        document.getElementById('grid').innerHTML = '';
        return;
    }
    
    // Sanitize input: split by comma, trim whitespace, convert to uppercase, and filter out empty strings.
    words = currentInput.split(',').map(w => w.trim().toUpperCase()).filter(w => w);
    groups = [];
    selected = [];
    singleWordColors = {};
    renderGrid();
}

/**
 * Renders the entire grid based on the current state (groups and unassigned words).
 */
function renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    const groupedWordsSet = new Set(groups.flatMap(g => g.words));
    const unassigned = words.filter(w => !groupedWordsSet.has(w));

    // 1. Render the completed groups at the top
    groups.forEach((group) => {
        group.words.forEach(word => {
            const wordDiv = createWordElement(word, true);
            wordDiv.style.backgroundColor = group.color;
            grid.appendChild(wordDiv);
        });
    });

    // 2. Render the unassigned words
    unassigned.forEach(word => {
        const btn = createWordElement(word, false);
        
        // Apply individual color if it exists
        const color = singleWordColors[word];
        if (color) {
            btn.style.background = color;
        }
        
        // Highlight if selected
        if (selected.includes(word)) {
            btn.classList.add('selected');
        }
        
        btn.onclick = () => toggleSelect(word);
        grid.appendChild(btn);
    });
    
    updateGroupButtons();
}

/**
 * Factory function to create a word element div.
 * @param {string} word - The text content of the word.
 * @param {boolean} isGrouped - If the word is part of a final group.
 * @returns {HTMLElement} The created div element.
 */
function createWordElement(word, isGrouped) {
    const element = document.createElement('div');
    element.textContent = word;
    element.className = isGrouped ? 'word grouped' : 'word';
    fitText(element);
    return element;
}

/**
 * Updates the text of the main grouping buttons (e.g., "Green" vs "Unselect").
 */
function updateGroupButtons() {
    Object.keys(CATEGORY_COLORS).forEach(colorName => {
        const btn = document.getElementById(`groupBtn-${colorName}`);
        if (!btn) return;

        const groupExists = groups.some(g => g.colorName === colorName);
        btn.textContent = groupExists ? 'Unselect' : colorName.charAt(0).toUpperCase() + colorName.slice(1);
    });
}

/**
 * Dynamically scales text to fit its container to prevent overflow.
 */
function fitText(element, maxFontSize = 16) {
    // This function needs to be called after the element is in the DOM to measure it.
    // A small timeout ensures rendering has occurred.
    setTimeout(() => {
        const minFontSize = 8;
        let fontSize = maxFontSize;
        element.style.fontSize = fontSize + "px";
        // Reduce font size until the text fits within the element's width
        while (element.scrollWidth > element.clientWidth && fontSize > minFontSize) {
            fontSize--;
            element.style.fontSize = fontSize + "px";
        }
    }, 0);
}

/**
 * Checks if a word is part of a completed group.
 * @param {string} word - The word to check.
 * @returns {boolean}
 */
function isWordInGroup(word) {
    return groups.some(g => g.words.includes(word));
}

/**
 * Handles the primary action for a color group button: either creates a new group or unselects an existing one.
 * @param {string} colorName - The name of the color group ('green', 'yellow', etc.).
 */
function handleGroupAction(colorName) {
    const groupIndex = groups.findIndex(g => g.colorName === colorName);

    if (groupIndex > -1) {
        // Action: Unselect the existing group
        groups.splice(groupIndex, 1);
    } else {
        // Action: Create a new group
        if (selected.length !== 4) return; // Guard clause: must have 4 words selected
        
        groups.push({ 
            words: [...selected], 
            color: CATEGORY_COLORS[colorName], 
            colorName: colorName 
        }); 
        
        // Clear any temporary single-word colors from the newly grouped words
        selected.forEach(word => delete singleWordColors[word]);
        selected = [];
    }
    
    renderGrid();
}

/**
 * Toggles the selection status of a word if it's not already in a final group.
 * @param {string} word - The word to select or deselect.
 */
function toggleSelect(word) {
    if (isWordInGroup(word)) return;

    const index = selected.indexOf(word);
    if (index > -1) {
        selected.splice(index, 1); // Deselect
    } else if (selected.length < 4) {
        selected.push(word); // Select
    }
    renderGrid();
}

/**
 * Assigns a temporary color to all currently selected words for brainstorming.
 * @param {string} colorName - The color to assign.
 */
function assignSingleColor(colorName) {
    if (selected.length === 0) return;
    const color = CATEGORY_COLORS[colorName];
    
    selected.forEach(word => {
        if (!isWordInGroup(word)) {
            // If the word already has this color, remove it. Otherwise, assign it.
            if (singleWordColors[word] === color) {
                delete singleWordColors[word];
            } else {
                singleWordColors[word] = color;
            }
        }
    });
    
    selected = []; // Deselect words after assigning color
    renderGrid();
}

/**
 * Shuffles the positions of only the unassigned words in the grid.
 */
function shuffleUnassigned() {
    const groupedWords = new Set(groups.flatMap(g => g.words));
    let unassigned = words.filter(w => !groupedWords.has(w));
    
    // Fisher-Yates shuffle algorithm
    for (let i = unassigned.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unassigned[i], unassigned[j]] = [unassigned[j], unassigned[i]];
    }
    
    // Reconstruct the main 'words' array to maintain the order for rendering
    const groupedWordsInOrder = words.filter(w => groupedWords.has(w));
    words = [...groupedWordsInOrder, ...unassigned];

    renderGrid();
}

/**
 * Removes the most recently created group.
 */
function undoLastGroup() {
    if (!groups.length) return;
    groups.pop();
    renderGrid();
}
