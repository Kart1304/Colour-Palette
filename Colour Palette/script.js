document.addEventListener("DOMContentLoaded", function() {
    // Theme toggle functionality
    const themeSwitch = document.getElementById("theme-switch");
    const body = document.body;

    // Checkking for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem("palette-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Setting initial theme based on saved preference or system preference
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        body.classList.add("dark");
        themeSwitch.checked = true;
    }

    // Toggling theme when switch is clicked
    themeSwitch.addEventListener("change", function() {
        if (this.checked) {
            body.classList.add("dark");
            localStorage.setItem("palette-theme", "dark");
        } else {
            body.classList.remove("dark");
            localStorage.setItem("palette-theme", "light");
        }
    });

    // Colouring palette functionality
    const generateBtn = document.getElementById("generate-btn");
    const saveBtn = document.getElementById("save-btn");
    const currentPalette = document.getElementById("current-palette");
    const savedPalettes = document.getElementById("saved-palettes");
    const noSavedPalettes = document.getElementById("no-saved-palettes");
    const copyMessage = document.getElementById("copy-message");

    // Numbering of colors in a palette
    const colorCount = 5;
    
    // Generating random hex color
    function generateRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    // Generating a new color palette
    function generatePalette() {
        currentPalette.innerHTML = "";
        
        for (let i = 0; i < colorCount; i++) {
            const color = generateRandomColor();
            const colorBox = document.createElement("div");
            colorBox.classList.add("color-box");
            colorBox.style.backgroundColor = color;
            
            const colorCode = document.createElement("span");
            colorCode.classList.add("color-code");
            colorCode.textContent = color;
            
            colorBox.appendChild(colorCode);
            currentPalette.appendChild(colorBox);
            
            // Adding click event to copy color code
            colorBox.addEventListener("click", function() {
                copyToClipboard(color);
            });
        }
    }
    
    // Copying color code to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            // Showing copy message
            copyMessage.textContent = `Copied ${text} to clipboard!`;
            copyMessage.classList.add("show");
            
            // Hiding message after 2 seconds
            setTimeout(function() {
                copyMessage.classList.remove("show");
            }, 2000);
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }
    
    // Saving current palette
    function savePalette() {
        // Checking if there's a palette to save
        if (currentPalette.children.length === 0) {
            alert("Generate a palette first!");
            return;
        }
        
        // Getting colors from current palette
        const colors = [];
        Array.from(currentPalette.children).forEach(colorBox => {
            colors.push(colorBox.style.backgroundColor);
        });
        
        // Creating palette object
        const palette = {
            id: Date.now(),
            colors: colors,
            date: new Date().toLocaleDateString()
        };
        
        // Getting saved palettes from local storage
        let palettes = JSON.parse(localStorage.getItem("saved-palettes")) || [];
        
        // Adding new palette
        palettes.push(palette);
        
        // Saving to local storage
        localStorage.setItem("saved-palettes", JSON.stringify(palettes));
        
        // Updating display
        displaySavedPalettes();
    }
    
    // Displaying saved palettes
    function displaySavedPalettes() {
        // Getting saved palettes from local storage
        const palettes = JSON.parse(localStorage.getItem("saved-palettes")) || [];
        
        // Showing/hiding no saved palettes message
        if (palettes.length === 0) {
            noSavedPalettes.style.display = "block";
            savedPalettes.innerHTML = "";
            savedPalettes.appendChild(noSavedPalettes);
        } else {
            noSavedPalettes.style.display = "none";
            
            // Clearing current display
            savedPalettes.innerHTML = "";
            
            // Adding each palette
            palettes.forEach(palette => {
                const paletteElement = document.createElement("div");
                paletteElement.classList.add("saved-palette");
                paletteElement.dataset.id = palette.id;
                
                // Creating color display
                const colorsElement = document.createElement("div");
                colorsElement.classList.add("saved-palette-colors");
                
                palette.colors.forEach(color => {
                    const colorElement = document.createElement("div");
                    colorElement.classList.add("saved-palette-color");
                    colorElement.style.backgroundColor = color;
                    colorsElement.appendChild(colorElement);
                });
                
                // Creating info section
                const infoElement = document.createElement("div");
                infoElement.classList.add("saved-palette-info");
                
                const dateElement = document.createElement("span");
                dateElement.classList.add("saved-palette-date");
                dateElement.textContent = palette.date;
                
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete-palette");
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.addEventListener("click", function(e) {
                    e.stopPropagation();
                    deletePalette(palette.id);
                });
                
                infoElement.appendChild(dateElement);
                infoElement.appendChild(deleteButton);
                
                // Adding click event to load palette
                paletteElement.addEventListener("click", function() {
                    loadPalette(palette);
                });
                
                // Assembling palette element
                paletteElement.appendChild(colorsElement);
                paletteElement.appendChild(infoElement);
                
                // Adding to display
                savedPalettes.appendChild(paletteElement);
            });
        }
    }
    
    // Loading a saved palette
    function loadPalette(palette) {
        currentPalette.innerHTML = "";
        
        palette.colors.forEach(color => {
            const colorBox = document.createElement("div");
            colorBox.classList.add("color-box");
            colorBox.style.backgroundColor = color;
            
            const colorCode = document.createElement("span");
            colorCode.classList.add("color-code");
            
            // Converting RGB to HEX if needed
            if (color.startsWith("rgb")) {
                const hex = rgbToHex(color);
                colorCode.textContent = hex;
            } else {
                colorCode.textContent = color;
            }
            
            colorBox.appendChild(colorCode);
            currentPalette.appendChild(colorBox);
            
            // Adding click event to copy color code
            colorBox.addEventListener("click", function() {
                copyToClipboard(colorCode.textContent);
            });
        });
    }
    
    // Deleting a saved palette
    function deletePalette(id) {
        // Get saved palettes from local storage
        let palettes = JSON.parse(localStorage.getItem("saved-palettes")) || [];
        
        // Filtering out the palette to delete
        palettes = palettes.filter(palette => palette.id !== id);
        
        // Saving to local storage
        localStorage.setItem("saved-palettes", JSON.stringify(palettes));
        
        // Updating display
        displaySavedPalettes();
    }
    
    // Converting RGB to HEX
    function rgbToHex(rgb) {
        // Extract RGB values
        const rgbValues = rgb.match(/\d+/g);
        
        if (!rgbValues || rgbValues.length !== 3) {
            return rgb;
        }
        
        // Converting to hex
        const r = parseInt(rgbValues[0]);
        const g = parseInt(rgbValues[1]);
        const b = parseInt(rgbValues[2]);
        
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
    
    // Event listeners
    generateBtn.addEventListener("click", generatePalette);
    saveBtn.addEventListener("click", savePalette);
    
    // Initialise
    generatePalette();
    displaySavedPalettes();
});