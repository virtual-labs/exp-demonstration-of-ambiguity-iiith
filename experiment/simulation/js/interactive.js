/**
 * Interactive Derivation Mode for Ambiguity in CFGs
 * Allows users to interactively choose production rules for derivation steps
 */

// Interactive mode state
let showingHint = false;
let attemptCount = 0;
let expectedRule = "";

/**
 * Initializes interactive mode UI components
 */
function initializeInteractiveMode() {
    // Check if interactive mode container already exists
    if (document.getElementById("interactive_controls")) {
        return;
    }
    
    // Create interactive mode container
    const interactiveContainer = document.createElement("div");
    interactiveContainer.id = "interactive_controls";
    interactiveContainer.className = "interactive-controls";
    
    // Create UI elements
    interactiveContainer.innerHTML = `
        <div class="rule-selection-container">
            <div class="instruction-text">Select production rule to apply:</div>
            <div id="rule_buttons_container" class="rule-buttons-container">
                <!-- Production rule buttons will be inserted here -->
            </div>
        </div>
        <div class="button-row" style="margin-top: 5px;">
            <button id="show_hint" class="button blue" style="margin: 0;">Hint</button>
            <button id="auto_step" class="button purple" style="margin: 0;">Auto</button>
        </div>
        <div id="current_step_info" class="current-step-info" style="margin-top: 5px;">
            <!-- Will be populated dynamically -->
        </div>
    `;
    
    // Insert after production rules
    const productionRulesSection = document.querySelector(".production-rules-section");
    productionRulesSection.parentNode.insertBefore(interactiveContainer, productionRulesSection.nextSibling);
    
    // Add event listeners for static buttons
    document.getElementById("show_hint").addEventListener("click", showHint);
    document.getElementById("auto_step").addEventListener("click", autoStep);
    
    // Initialize rule selection
    updateRuleSelection();
}

/**
 * Updates the rule selection by creating buttons for each production rule
 */
function updateRuleSelection() {
    const ruleButtonsContainer = document.getElementById("rule_buttons_container");
    if (!ruleButtonsContainer) return;
    
    // Clear existing buttons
    ruleButtonsContainer.innerHTML = "";
    
    // Get current CFG and derivation
    const currentCfg = cfgs[currentCfgIndex];
    
    // Add a button for each production rule
    currentCfg.productions.forEach((rule) => {
        const button = document.createElement("button");
        button.className = "rule-button";
        button.textContent = rule;
        button.addEventListener("click", function() {
            applyRule(rule);
        });
        ruleButtonsContainer.appendChild(button);
    });
    
    // Show the current step info
    updateCurrentStepInfo();
    
    // Determine expected rule for current step
    setExpectedRuleForCurrentStep();
}

/**
 * Updates the current step info area with what we're trying to derive
 */
function updateCurrentStepInfo() {
    const currentStepInfo = document.getElementById("current_step_info");
    if (!currentStepInfo) return;
    
    const currentCfg = cfgs[currentCfgIndex];
    const currentInput = currentCfg.inputs[currentInputIndex];
    const derivation = currentInput.derivations[currentDerivationIndex];
    
    if (currentStepIndex < derivation.steps.length - 1) {
        const currentStep = derivation.steps[currentStepIndex];
        
        // Highlight the non-terminal to be replaced
        const highlightedString = highlightNonTerminal(currentStep.result, derivation.type);
        
        // Create compact HTML for current step
        currentStepInfo.innerHTML = `
            <div class="current-string">${highlightedString}</div>
            <div class="direction-text">${derivation.type === "leftmost" ? "Leftmost" : "Rightmost"} derivation</div>
        `;
    } else {
        currentStepInfo.innerHTML = `
            <div class="current-string">${derivation.steps[currentStepIndex].result}</div>
            <div class="direction-text">Derivation complete</div>
        `;
    }
}

/**
 * Applies the selected production rule
 */
function applyRule(selectedRule) {
    // Check if this is the correct rule for the current step
    if (selectedRule === expectedRule || expectedRule.includes(selectedRule)) {
        // Success! Move to next step
        showSuccessMessage("Correct! That's the right production rule.");
        
        // Use the main script's nextStep function to advance
        nextStep();
        
        // Reset attempt count for next step
        attemptCount = 0;
    } else {
        // Wrong rule
        attemptCount++;
        
        // Get current step info for better error message
        const currentCfg = cfgs[currentCfgIndex];
        const currentInput = currentCfg.inputs[currentInputIndex];
        const derivation = currentInput.derivations[currentDerivationIndex];
        
        if (attemptCount <= 1) {
            showErrorMessage(`That's not the correct rule for this step. Try again!`);
        } else if (attemptCount === 2) {
            showErrorMessage(`Not quite right. Remember, in a ${derivation.type} derivation, we always replace the ${derivation.type === "leftmost" ? "leftmost" : "rightmost"} non-terminal first.`);
        } else {
            showErrorMessage(`Still not correct. Consider using the "Hint" button for help.`);
        }
    }
}

/**
 * Highlights the non-terminal to be replaced based on derivation type
 */
function highlightNonTerminal(str, derivationType) {
    let result = "";
    let found = false;
    
    if (derivationType === "leftmost") {
        // For leftmost derivation, find the first uppercase letter (non-terminal)
        for (let i = 0; i < str.length; i++) {
            if (!found && str[i] >= 'A' && str[i] <= 'Z') {
                result += `<span style="background-color: #fef3c7; color: #92400e; padding: 0 4px; border-radius: 4px; font-weight: bold;">${str[i]}</span>`;
                found = true;
            } else {
                result += str[i];
            }
        }
    } else {
        // For rightmost derivation, find the last uppercase letter (non-terminal)
        for (let i = str.length - 1; i >= 0; i--) {
            if (!found && str[i] >= 'A' && str[i] <= 'Z') {
                // Remember the position
                const pos = i;
                found = true;
                
                // Build the string normally
                result = "";
                for (let j = 0; j < str.length; j++) {
                    if (j === pos) {
                        result += `<span style="background-color: #fef3c7; color: #92400e; padding: 0 4px; border-radius: 4px; font-weight: bold;">${str[j]}</span>`;
                    } else {
                        result += str[j];
                    }
                }
                break;
            }
        }
    }
    
    return found ? result : str;
}

/**
 * Sets the expected rule for the current step
 */
function setExpectedRuleForCurrentStep() {
    const currentCfg = cfgs[currentCfgIndex];
    const currentInput = currentCfg.inputs[currentInputIndex];
    const derivation = currentInput.derivations[currentDerivationIndex];
    
    if (currentStepIndex < derivation.steps.length - 1) {
        expectedRule = derivation.steps[currentStepIndex + 1].rule;
    } else {
        expectedRule = ""; // No more rules to apply
    }
}

/**
 * Applies the selected production rule
 */
/**
 * Shows a hint for the current step
 */
function showHint() {
    if (showingHint) return;
    showingHint = true;
    
    let hintText = "";
    let hintTitle = "Hint";
    const currentCfg = cfgs[currentCfgIndex];
    const currentInput = currentCfg.inputs[currentInputIndex];
    const derivation = currentInput.derivations[currentDerivationIndex];
    
    if (currentStepIndex < derivation.steps.length - 1) {
        const currentStep = derivation.steps[currentStepIndex];
        const nextStep = derivation.steps[currentStepIndex + 1];
        
        if (attemptCount === 0) {
            // Basic hint
            hintTitle = "Basic Hint";
            if (derivation.type === "leftmost") {
                hintText = `In a leftmost derivation, we always replace the leftmost non-terminal symbol first.
                            Look for the leftmost non-terminal symbol in "${currentStep.result}" and find a production rule that can replace it.`;
            } else {
                hintText = `In a rightmost derivation, we always replace the rightmost non-terminal symbol first.
                            Look for the rightmost non-terminal symbol in "${currentStep.result}" and find a production rule that can replace it.`;
            }
        } else if (attemptCount === 1) {
            // More specific hint
            hintTitle = "More Specific Hint";
            const nonTerminal = derivation.type === "leftmost" ? 
                findLeftmostNonTerminal(currentStep.result, currentCfg.startSymbol) : 
                findRightmostNonTerminal(currentStep.result, currentCfg.startSymbol);
                
            hintText = `You need to apply a rule that replaces the ${derivation.type === "leftmost" ? "leftmost" : "rightmost"} "${nonTerminal}" with something else.
                        Look at the production rules and find one that starts with "${nonTerminal} →".`;
        } else {
            // Direct hint showing exact rule
            hintTitle = "Direct Answer";
            hintText = `The correct rule to apply is: ${nextStep.rule}
                        This will transform the current string "${currentStep.result}" into "${nextStep.result}".`;
        }
    } else {
        hintText = "Derivation is complete! You've reached the final step.";
    }
    
    // Display hint
    swal({
        title: hintTitle,
        icon: "info",
        content: {
            element: "div",
            attributes: {
                innerHTML: hintText
            }
        },
        button: {
            text: "Got it!",
            className: "swal-button--confirm"
        }
    }).then(() => {
        showingHint = false;
    });
}

/**
 * Automatically applies the correct production rule
 */
function autoStep() {
    if (currentStepIndex < cfgs[currentCfgIndex].inputs[currentInputIndex].derivations[currentDerivationIndex].steps.length - 1) {
        // Just apply the next step without showing a popup
        nextStep();
    }
}

/**
 * Finds the leftmost non-terminal symbol in a string
 */
function findLeftmostNonTerminal(str, startSymbol) {
    // In this simple implementation, we assume uppercase letters are non-terminals
    // This should be improved for real-world use with proper CFG parsing
    for (let i = 0; i < str.length; i++) {
        if (str[i] >= 'A' && str[i] <= 'Z') {
            return str[i];
        }
    }
    return null;
}

/**
 * Finds the rightmost non-terminal symbol in a string
 */
function findRightmostNonTerminal(str, startSymbol) {
    // In this simple implementation, we assume uppercase letters are non-terminals
    for (let i = str.length - 1; i >= 0; i--) {
        if (str[i] >= 'A' && str[i] <= 'Z') {
            return str[i];
        }
    }
    return null;
}

/**
 * Shows an error message using SweetAlert
 */
function showErrorMessage(message) {
    swal({
        title: "Incorrect",
        text: message,
        icon: "error",
        button: {
            text: "Try Again",
            className: "swal-button--confirm"
        }
    });
}

/**
 * Shows a success message using SweetAlert
 */
function showSuccessMessage(message) {
    swal({
        title: "Correct!",
        text: message,
        icon: "success",
        timer: 1500,
        buttons: false
    });
}

/**
 * Shows an info message using SweetAlert
 */
function showInfoMessage(message) {
    swal({
        title: "Info",
        text: message,
        icon: "info",
        timer: 1500,
        buttons: false
    });
}

/**
 * Toggles interactive mode on/off
 */
function toggleInteractiveMode() {
    const interactiveControls = document.getElementById("interactive_controls");
    
    if (interactiveModeEnabled) {
        // Initialize or show interactive controls
        if (!interactiveControls) {
            initializeInteractiveMode();
        } else {
            interactiveControls.style.display = "block";
        }
        
        // Reset attempt count when toggling on
        attemptCount = 0;
        updateRuleSelection();
        
        // Show welcome message
        swal({
            title: "Interactive Mode Enabled",
            text: "Now you can choose which production rules to apply at each step. Try to derive the string yourself!",
            icon: "info",
            buttons: {
                confirm: {
                    text: "Let's Start!",
                    value: true,
                    visible: true,
                    className: "swal-button--confirm"
                }
            }
        });
    } else {
        // Hide interactive controls
        if (interactiveControls) {
            interactiveControls.style.display = "none";
        }
    }
}
