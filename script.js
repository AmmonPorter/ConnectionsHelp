let words = [];
let groups = [];
let selected = [];
let singleWordColors = {}; // To store colors for individual words

// Colors for assignments
const CATEGORY_COLORS = {
    yellow: "#f8df74",
    green: "#a1c35f",
    blue: "#b1c4ee",
    purple: "#ba82c3"
};

/**
 * Runs when the page first loads to automatically fetch the puzzle.
 */
window.onload = function() {
    fetchTodaysPuzzle();
};

/**
 * Fetches the puzzle data from a file in the repository.
 * This file would be updated daily by a separate GitHub Action script.
 */
async function fetchTodaysPuzzle() {
    const wordInput = document.getElementById('wordInput');
    
    try {
        wordInput.placeholder = 'Fetching...';
        
        // In a real scenario, you'd fetch from a URL.
        // For this example, we will simulate a fetch with a delay.
        await new Promise(resolve => setTimeout(resolve, 750));
        
        // This is where you would process the response from the fetch:
        // const response = await fetch('https://your-data-url/puzzle.json');
        // const data = await response.json();
        // const puzzleWords = data.words; 

        // SIMULATED DATA for demonstration:
        const puzzleWords = ["APPLE", "BANANA", "CHERRY", "DATE", "ELDERBERRY", "FIG", "GRAPE", "HONEYDEW", "KIWI", "LEMON", "MANGO", "NECTARINE", "ORANGE", "PAPAYA", "QUINCE", "RASPBERRY"];
        
        wordInput.value = puzzleWords.join(', ');
        startGame();

    } catch (error) {
        console.error('Failed to fetch puzzle:', error);
        wordInput.placeholder = 'Could not fetch puzzle. Enter words manually.';
    }
}


/**
 * Initializes the game with words from the input field.
 */
function startGame() {
    const input = document.getElementById('wordInput').value.trim();
    if (!input) return;
    words = input.split(',').map(w => w.trim().toUpperCase()).filter(w => w);
    groups = [];
    selected = [];
    singleWordColors = {};
    renderGrid();
}

/**
 * Renders the entire grid and updates the state of the control buttons.
 */
function renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    const groupedWordsSet = new Set(groups.flatMap(g => g.words));
    const unassigned = words.filter(w => !groupedWordsSet.has(w));

    // First, render the completed groups at the top
    groups.forEach((group) => {
        group.words.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'word grouped';
            wordDiv.style.backgroundColor = group.color;
            wordDiv.textContent = word;
            grid.appendChild(wordDiv);
            fitText(wordDiv);
        });
    });

    // Then, render the unassigned words
    unassigned.forEach(word => {
        const btn = document.createElement('div');
        btn.textContent = word;
        btn.className = 'word';
        
        const color = singleWordColors[word];
        if (color) {
            btn.style.background = color;
        }
        
        if (selected.includes(word)) {
            btn.classList.add('selected');
        }
        
        btn.onclick = () => toggleSelect(word);
        grid.appendChild(btn);
        fitText(btn);
    });
    
    // After rendering the grid, update the group buttons' text
    updateGroupButtons();
}

/**
 * Updates the text of the main grouping buttons based on which groups exist.
 */
function updateGroupButtons() {
    const colorNames = ['green', 'yellow', 'blue', 'purple'];
    colorNames.forEach(colorName => {
        const btn = document.getElementById(`groupBtn-${colorName}`);
        if (!btn) return;

        const groupExists = groups.some(g => g.colorName === colorName);
        if (groupExists) {
            btn.textContent = 'Unselect';
        } else {
            // Capitalize the first letter for the button text
            btn.textContent = colorName.charAt(0).toUpperCase() + colorName.slice(1);
        }
    });
}

/**
 * Dynamically scales text to fit its container.
 */
function fitText(element, maxFontSize = 16) {
    const minFontSize = 8;
    let fontSize = maxFontSize;
    element.style.fontSize = fontSize + "px";
    while (element.scrollWidth > element.clientWidth && fontSize > minFontSize) {
        fontSize--;
        element.style.fontSize = fontSize + "px";
    }
}

/**
 * Checks if a word is part of a completed group.
 */
function isWordInGroup(word) {
    return groups.some(g => g.words.includes(word));
}

/**
 * Handles the primary action for a color group button.
 * Either creates a group or unselects an existing one.
 * @param {string} colorName The color name ('green', 'yellow', etc.).
 */
function handleGroupAction(colorName) {
    const groupExists = groups.some(g => g.colorName === colorName);

    if (groupExists) {
        // This is an "Unselect" action
        const groupIndex = groups.findIndex(g => g.colorName === colorName);
        if (groupIndex > -1) {
            groups.splice(groupIndex, 1);
        }
    } else {
        // This is a "Group" action
        if (selected.length !== 4) return; // Guard clause
        const color = CATEGORY_COLORS[colorName];
        // Add colorName to the group object for tracking
        groups.push({ words: [...selected], color: color, colorName: colorName }); 
        
        selected.forEach(word => {
            delete singleWordColors[word];
        });
        
        selected = [];
    }
    
    renderGrid();
}

/**
 * Toggles the selection status of a word.
 */
function toggleSelect(word) {
    if (isWordInGroup(word)) return;

    const index = selected.indexOf(word);
    if (index > -1) {
        selected.splice(index, 1);
    } else if (selected.length < 4) {
        selected.push(word);
    }
    renderGrid();
}

/**
 * Assigns a temporary color to all currently selected words.
 */
function assignSingleColor(colorName) {
    if (selected.length === 0) return;
    const color = CATEGORY_COLORS[colorName];
    selected.forEach(word => {
        if (!isWordInGroup(word)) {
            if (singleWordColors[word] === color) {
                delete singleWordColors[word];
            } else {
                singleWordColors[word] = color;
            }
        }
    });
    selected = [];
    renderGrid();
}

/**
 * Shuffles the unassigned words in the grid.
 */
function shuffleUnassigned() {
    const groupedWords = new Set(groups.flatMap(g => g.words));
    let unassigned = words.filter(w => !groupedWords.has(w));
    shuffle(unassigned);
    
    const groupedWordsInOrder = groups.flatMap(g => g.words);
    words = [...groupedWordsInOrder, ...unassigned];

    renderGrid();
}

/**
 * Removes the last submitted group.
 */
function undoLastGroup() {
    if (!groups.length) return;
    groups.pop();
    renderGrid();
}

/**
 * Shuffles an array in place.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
