// Global variables
let currentCfgIndex = 0;
let currentInputIndex = 0;
let currentDerivationIndex = 0;
let currentStepIndex = 0;
let interactiveModeEnabled = true; // Always enabled by default

// New variables for parallel derivations with alternating steps
let leftStepIndex = 0;
let rightStepIndex = 0;
let currentDerivationType = 'left'; // 'left' or 'right' - indicates which derivation should take the next step

// Helper functions for SVG and DOM manipulation
function newElementNS(tag, attr) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attr && Array.isArray(attr)) {
        attr.forEach(function (item) {
            elem.setAttribute(item[0], item[1]);
        });
    }
    return elem;
}

function newElement(tag, attr) {
    const elem = document.createElement(tag);
    if (attr) {
        attr.forEach(function (item) {
            elem.setAttribute(item[0], item[1]);
        });
    }
    return elem;
}

function clearElem(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }
}

// Function to initialize the UI
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing UI...');
    
    // Set up event listeners for buttons
    document.getElementById('change_grammar').addEventListener('click', changeGrammar);
    document.getElementById('toggle_derivation').addEventListener('click', toggleDerivation);
    document.getElementById('prev_step').addEventListener('click', prevStep);
    document.getElementById('next_step').addEventListener('click', nextStep);
    
    // Set up interactive helper buttons
    document.getElementById('show_hint').addEventListener('click', showHint);
    // Remove auto_step button since we're using the original next_step button
    
    // Initialize display
    console.log('Initial state:', {
        leftStepIndex,
        rightStepIndex,
        currentDerivationType
    });
    refreshDisplay();
});

// Function to change to the next grammar
function changeGrammar() {
    currentCfgIndex = (currentCfgIndex + 1) % cfgs.length;
    currentInputIndex = 0;
    currentDerivationIndex = 0;
    currentStepIndex = 0;
    
    // Reset parallel derivation state
    leftStepIndex = 0;
    rightStepIndex = 0;
    currentDerivationType = 'left';
    
    refreshDisplay();
}

// Function to toggle between leftmost and rightmost derivations
function toggleDerivation() {
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    currentDerivationIndex = (currentDerivationIndex + 1) % input.derivations.length;
    currentStepIndex = 0;
    refreshDisplay();
}

// Function to move to the next derivation step
function nextStep() {
    console.log('Next step called:', {
        currentDerivationType,
        leftStepIndex,
        rightStepIndex
    });
    
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const leftDerivation = input.derivations[0]; // Leftmost derivation
    const rightDerivation = input.derivations[1]; // Rightmost derivation
    
    // Check if we can make a step for the current derivation type
    let canProceed = false;
    
    if (currentDerivationType === 'left' && leftStepIndex < leftDerivation.steps.length - 1) {
        leftStepIndex++;
        currentDerivationType = 'right'; // Switch to right derivation for next step
        canProceed = true;
        console.log('Advanced left derivation, switching to right');
    } else if (currentDerivationType === 'right' && rightStepIndex < rightDerivation.steps.length - 1) {
        rightStepIndex++;
        currentDerivationType = 'left'; // Switch to left derivation for next step
        canProceed = true;
        console.log('Advanced right derivation, switching to left');
    }
    
    if (canProceed) {
        refreshDisplay();
    } else {
        // Check if both derivations are complete
        const leftComplete = leftStepIndex >= leftDerivation.steps.length - 1;
        const rightComplete = rightStepIndex >= rightDerivation.steps.length - 1;
        
        console.log('Cannot proceed normally:', {
            leftComplete,
            rightComplete,
            leftStepIndex,
            rightStepIndex,
            leftSteps: leftDerivation.steps.length,
            rightSteps: rightDerivation.steps.length
        });
        
        if (leftComplete && rightComplete) {
            // Both derivations are complete, show comparison
            console.log('Both derivations complete, showing comparison');
            showDerivationComparisonTable();
        } else {
            // Try to advance the other derivation if current one is complete
            if (currentDerivationType === 'left' && leftStepIndex >= leftDerivation.steps.length - 1) {
                // Left is complete, try right
                if (rightStepIndex < rightDerivation.steps.length - 1) {
                    rightStepIndex++;
                    currentDerivationType = 'left'; // Keep alternating pattern
                    console.log('Left complete, advancing right');
                    refreshDisplay();
                }
            } else if (currentDerivationType === 'right' && rightStepIndex >= rightDerivation.steps.length - 1) {
                // Right is complete, try left
                if (leftStepIndex < leftDerivation.steps.length - 1) {
                    leftStepIndex++;
                    currentDerivationType = 'right'; // Keep alternating pattern
                    console.log('Right complete, advancing left');
                    refreshDisplay();
                }
            }
        }
    }
}

// Function to move to the previous derivation step
function prevStep() {
    // Find which derivation was advanced last and reverse it
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const leftDerivation = input.derivations[0];
    const rightDerivation = input.derivations[1];
    
    let canGoBack = false;
    
    // If we're currently supposed to step right, it means left was advanced last
    if (currentDerivationType === 'right' && leftStepIndex > 0) {
        leftStepIndex--;
        currentDerivationType = 'left';
        canGoBack = true;
    } 
    // If we're currently supposed to step left, it means right was advanced last
    else if (currentDerivationType === 'left' && rightStepIndex > 0) {
        rightStepIndex--;
        currentDerivationType = 'right';
        canGoBack = true;
    }
    // Handle the case where we're at the beginning but still have steps to go back
    else if (leftStepIndex > 0 || rightStepIndex > 0) {
        if (leftStepIndex > rightStepIndex) {
            leftStepIndex--;
            currentDerivationType = 'right';
            canGoBack = true;
        } else if (rightStepIndex > leftStepIndex) {
            rightStepIndex--;
            currentDerivationType = 'left';
            canGoBack = true;
        }
    }
    
    if (canGoBack) {
        refreshDisplay();
    }
}

// Function to update the entire display based on current state
function refreshDisplay() {
    console.log('Refreshing display with state:', {
        currentCfgIndex,
        leftStepIndex,
        rightStepIndex,
        currentDerivationType
    });
    
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const leftDerivation = input.derivations[0]; // Leftmost derivation
    const rightDerivation = input.derivations[1]; // Rightmost derivation

    // Grammar description container removed - description now only shows in derivation types
    
    // Update derivation types
    const leftTypeContainer = document.getElementById("derivation_type_left");
    const rightTypeContainer = document.getElementById("derivation_type_right");
    if (leftTypeContainer) leftTypeContainer.textContent = leftDerivation.description;
    if (rightTypeContainer) rightTypeContainer.textContent = rightDerivation.description;

    // Update input strings for both sides
    const sharedInputContainer = document.getElementById("input_container_shared");
    const leftInputContainer = document.getElementById("input_container_left");
    const rightInputContainer = document.getElementById("input_container_right");
    
    if (sharedInputContainer) {
        clearElem(sharedInputContainer);
        const sharedInputStr = document.createElement('div');
        sharedInputStr.className = "input-string";
        sharedInputStr.textContent = input.string;
        sharedInputContainer.appendChild(sharedInputStr);
    }
    
    // Legacy input containers (now unused but kept for compatibility)
    if (leftInputContainer) {
        clearElem(leftInputContainer);
    }
    
    if (rightInputContainer) {
        clearElem(rightInputContainer);
    }

    // Update production rules - make them interactive buttons but keep original layout
    const rulesContainer = document.getElementById("production_rules_container");
    clearElem(rulesContainer);
    
    cfg.productions.forEach((prod, index) => {
        const ruleButton = document.createElement('button');
        ruleButton.className = "rule production-rule-button";
        ruleButton.textContent = prod;
        ruleButton.setAttribute('data-rule-index', index);
        ruleButton.setAttribute('data-rule', prod);
        
        // Add click handler for interactive rule selection
        ruleButton.addEventListener('click', function() {
            handleRuleSelection(prod, index);
        });
        
        rulesContainer.appendChild(ruleButton);
    });

    // Update parse trees for both derivations
    drawParseTreeForDerivation('left', leftDerivation, leftStepIndex);
    drawParseTreeForDerivation('right', rightDerivation, rightStepIndex);
    
    // Update derivation steps lists for both derivations
    updateDerivationStepsListForBoth(leftDerivation, rightDerivation);
    
    // Update current derivation indicator
    updateCurrentDerivationIndicator();
    
    // Update button states
    updateButtonStates();
    
    // Update interactive rule button states
    updateRuleButtonStates();
    
    // Update interactive mode if enabled
    /*
    if (interactiveModeEnabled) {
        // Check if interactive mode is initialized
        if (document.getElementById('interactive_controls')) {
            updateRuleSelection();
        } else {
            // Skip interactive mode initialization for now
            console.log('Skipping interactive mode initialization');
        }
    }
    */
    console.log('Display refresh complete');
}

// Function to update the derivation steps list for both derivations
function updateDerivationStepsListForBoth(leftDerivation, rightDerivation) {
    // Update left derivation steps
    const leftStepsList = document.getElementById("derivation_steps_list_left");
    if (leftStepsList) {
        clearElem(leftStepsList);
        
        for (let i = 0; i <= leftStepIndex && i < leftDerivation.steps.length; i++) {
            const step = leftDerivation.steps[i];
            const stepItem = document.createElement('li');
            stepItem.className = 'trace-item';
            
            if (i === leftStepIndex) {
                stepItem.classList.add('active');
            }
            
            const stepContent = document.createTextNode(step.result);
            stepItem.appendChild(stepContent);
            
            const ruleSpan = document.createElement('span');
            ruleSpan.className = 'rule-applied';
            ruleSpan.textContent = `[${step.rule}]`;
            stepItem.appendChild(ruleSpan);
            
            leftStepsList.appendChild(stepItem);
        }
    }
    
    // Update right derivation steps
    const rightStepsList = document.getElementById("derivation_steps_list_right");
    if (rightStepsList) {
        clearElem(rightStepsList);
        
        for (let i = 0; i <= rightStepIndex && i < rightDerivation.steps.length; i++) {
            const step = rightDerivation.steps[i];
            const stepItem = document.createElement('li');
            stepItem.className = 'trace-item';
            
            if (i === rightStepIndex) {
                stepItem.classList.add('active');
            }
            
            const stepContent = document.createTextNode(step.result);
            stepItem.appendChild(stepContent);
            
            const ruleSpan = document.createElement('span');
            ruleSpan.className = 'rule-applied';
            ruleSpan.textContent = `[${step.rule}]`;
            stepItem.appendChild(ruleSpan);
            
            rightStepsList.appendChild(stepItem);
        }
    }
}

// Function to update the current derivation indicator
function updateCurrentDerivationIndicator() {
    const indicator = document.getElementById("current_derivation_type");
    if (indicator) {
        const derivationName = currentDerivationType === 'left' ? 'Derivation A' : 'Derivation B';
        indicator.textContent = derivationName;
        
        // Add visual styling to indicate which is next
        const indicatorContainer = document.getElementById("current_derivation_info");
        if (indicatorContainer) {
            indicatorContainer.className = `current-derivation ${currentDerivationType}`;
        }
    }

    // Update the individual derivation indicators with parse tree style highlighting
    const leftContainer = document.getElementById("current_derivation_info_left");
    const rightContainer = document.getElementById("current_derivation_info_right");

    if (leftContainer && rightContainer) {
        if (currentDerivationType === 'left') {
            leftContainer.className = "current-derivation active";
            rightContainer.className = "current-derivation";
        } else {
            leftContainer.className = "current-derivation";
            rightContainer.className = "current-derivation active";
        }
    }
    
    // Highlight the active derivation's parse tree container
    updateDerivationHighlighting();
}

// Function to highlight the active derivation's parse tree container
function updateDerivationHighlighting() {
    const leftColumn = document.querySelector('.derivation-column:first-of-type');
    const rightColumn = document.querySelector('.derivation-column:last-of-type');
    
    // Remove existing highlighting classes
    if (leftColumn) {
        leftColumn.classList.remove('active-left', 'active-right');
    }
    if (rightColumn) {
        rightColumn.classList.remove('active-left', 'active-right');
    }
    
    // Add highlighting to the active derivation
    if (currentDerivationType === 'left' && leftColumn) {
        leftColumn.classList.add('active-left');
    } else if (currentDerivationType === 'right' && rightColumn) {
        rightColumn.classList.add('active-right');
    }
}

// Function to draw parse tree for a specific derivation
function drawParseTreeForDerivation(side, derivation, stepIndex) {
    const svgId = side === 'left' ? 'parse_tree_left' : 'parse_tree_right';
    const svg = document.getElementById(svgId);
    if (!svg) return;
    
    clearElem(svg);
    
    // Get the current derivation info
    const cfg = cfgs[currentCfgIndex];
    
    // Set compact viewBox that will be scaled up to fit container
    let viewBoxWidth, viewBoxHeight;
    if (cfg === cfgs[2]) {
        // Grammar 3: if-then-else statements - needs larger viewBox (30% increase)
        viewBoxWidth = 460; // was 600, but making it smaller increases the scale
        viewBoxHeight = 310; // was 400, but making it smaller increases the scale
    } else if (cfg === cfgs[1]) {
        // Grammar 2: abab - needs very slightly larger viewBox to reduce scale
        viewBoxWidth = 420; // was 400, slightly larger to reduce scale
        viewBoxHeight = 280;
    } else {
        // Grammar 1: id+id*id - standard viewBox (perfect as is)
        viewBoxWidth = 400;
        viewBoxHeight = 280;
    }
    
    // Set viewBox for scaling and let CSS handle the sizing
    svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.maxWidth = '100%';
    svg.style.maxHeight = '100%';
    
    const rootY = 40;
    
    // Save current global state
    const originalStepIndex = currentStepIndex;
    const originalDerivationIndex = currentDerivationIndex;
    
    // Set the step index for the tree drawing function
    currentStepIndex = stepIndex;
    
    // Set derivation index based on side
    if (side === 'left') {
        currentDerivationIndex = 0; // Leftmost derivation
    } else {
        currentDerivationIndex = 1; // Rightmost derivation
    }
    
    // Check which grammar we're dealing with and draw appropriate tree
    if (cfg === cfgs[0]) {
        // Grammar 1: id+id*id expression
        drawExpressionTreeToSvg(svg, viewBoxWidth, viewBoxHeight, rootY);
    } else if (cfg === cfgs[1]) {
        // Grammar 2: abab string
        drawAbabTreeToSvg(svg, viewBoxWidth, viewBoxHeight, rootY);
    } else if (cfg === cfgs[2]) {
        // Grammar 3: if-then-else statements
        drawIfThenElseTreeToSvg(svg, viewBoxWidth, viewBoxHeight, rootY);
    }
    
    // Restore original global state
    currentStepIndex = originalStepIndex;
    currentDerivationIndex = originalDerivationIndex;
}

// Function to update the derivation steps list (legacy function for backward compatibility)
function updateDerivationStepsList(derivation) {
    const stepsList = document.getElementById("derivation_steps_list");
    if (!stepsList) return;
    
    clearElem(stepsList);
    
    for (let i = 0; i <= currentStepIndex && i < derivation.steps.length; i++) {
        const step = derivation.steps[i];
        const stepItem = document.createElement('li');
        stepItem.className = 'trace-item';
        
        if (i === currentStepIndex) {
            stepItem.classList.add('active');
        }
        
        const stepContent = document.createTextNode(step.result);
        stepItem.appendChild(stepContent);
        
        const ruleSpan = document.createElement('span');
        ruleSpan.className = 'rule-applied';
        ruleSpan.textContent = `[${step.rule}]`;
        stepItem.appendChild(ruleSpan);
        
        stepsList.appendChild(stepItem);
    }
}

// Draw a parse tree (top-down tree visualization) - legacy function
function drawParseTree(parseTree) {
    const svg = document.getElementById('parse_tree');
    if (!svg) return;
    
    clearElem(svg);
    
    // Set viewBox to enable responsive scaling
    // Adjust viewBox based on grammar type
    const cfg = cfgs[currentCfgIndex];
    let viewBoxWidth, viewBoxHeight;
    if (cfg === cfgs[2]) {
        // Grammar 3: if-then-else statements - needs larger size (30% increase)
        viewBoxWidth = 615; // smaller viewBox = bigger scale
        viewBoxHeight = 270; // smaller viewBox = bigger scale
    } else if (cfg === cfgs[1]) {
        // Grammar 2: abab - needs very slightly smaller scale
        viewBoxWidth = 820; // slightly larger viewBox = smaller scale
        viewBoxHeight = 350;
    } else {
        // Grammar 1: id+id*id - standard viewBox
        viewBoxWidth = 800;
        viewBoxHeight = 350;
    }
    svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
    
    const width = viewBoxWidth;
    const height = viewBoxHeight;
    const rootY = 40;
    
    drawTreeToSvg(svg, width, height, rootY);
}

// Helper function to draw tree to any SVG element
function drawTreeToSvg(svg, width, height, rootY) {
    // Get the current derivation info
    const cfg = cfgs[currentCfgIndex];
    
    // Check which grammar we're dealing with
    if (cfg === cfgs[0]) {
        // Grammar 1: id+id*id expression
        drawExpressionTreeToSvg(svg, width, height, rootY);
    } else if (cfg === cfgs[1]) {
        // Grammar 2: abab string
        drawAbabTreeToSvg(svg, width, height, rootY);
    } else if (cfg === cfgs[2]) {
        // Grammar 3: if-then-else statements
        drawIfThenElseTreeToSvg(svg, width, height, rootY);
    }
}

// Function to draw the expression tree for "id+id*id" to a specific SVG
function drawExpressionTreeToSvg(svg, width, height, rootY) {
    const nodeRadius = 22; // Match the radius used in drawCircleWithText
    const levelGap = 50; // Standard spacing
    
    // Create a group for the entire tree
    const treeGroup = newElementNS('g', [
        ['transform', `translate(${width/2}, ${rootY})`]
    ]);
    
    // Get derivation type
    const derivation = cfgs[currentCfgIndex].inputs[currentInputIndex].derivations[currentDerivationIndex];
    const isLeftmost = derivation.type === "leftmost";
    
    // Define node positions - standard spacing that will be scaled
    const rootX = 0;
    const rootY0 = 0;
    
    // Level 1 nodes for both derivations
    const level1Y = rootY0 + levelGap;
    const leftChildX = -100;
    const middleChildX = 0;  // For operators + and *
    const rightChildX = 100;
    
    // Level 2 nodes
    const level2Y = level1Y + levelGap;
    const leftGrandchildX = leftChildX - 50;
    const rightGrandchildX = leftChildX + 50;
    const rightGrandchildLeftX = rightChildX - 50;
    const rightGrandchildRightX = rightChildX + 50;
    
    // Level 3 nodes (for rightmost derivation especially)
    const level3Y = level2Y + levelGap;
    
    if (isLeftmost) {
        // Leftmost derivation steps
        // Step 0: Draw root node E
        if (currentStepIndex >= 0) {
            drawCircleWithText(treeGroup, rootX, rootY0, "E", currentStepIndex === 0 ? "green" : "blue");
        }
        
        // Step 1: Draw E → E + E
        if (currentStepIndex >= 1) {
            drawCircleWithText(treeGroup, leftChildX, level1Y, "E", currentStepIndex === 1 ? "green" : "blue");
            // If this is the final step, make terminal nodes yellow
            const opColor = currentStepIndex === 5 ? "yellow" : "normal";
            drawCircleWithText(treeGroup, middleChildX, level1Y, "+", opColor);
            drawCircleWithText(treeGroup, rightChildX, level1Y, "E", currentStepIndex === 1 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, leftChildX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, middleChildX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, rightChildX, level1Y - nodeRadius);
        }
        
        // Step 2: Draw id under left E
        if (currentStepIndex >= 2) {
            // If this is the final step, make leaf nodes yellow, otherwise use appropriate color
            const leafColor = currentStepIndex === 5 ? "yellow" : (currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, leftChildX, level2Y, "id", leafColor);
            drawEdge(treeGroup, leftChildX, level1Y + nodeRadius, leftChildX, level2Y - nodeRadius);
        }
        
        // Step 3: Draw E * E under right E
        if (currentStepIndex >= 3) {
            drawCircleWithText(treeGroup, rightGrandchildLeftX, level2Y, "E", currentStepIndex === 3 ? "green" : "blue");
            // If this is the final step, make terminal nodes yellow
            const opColor = currentStepIndex === 5 ? "yellow" : "normal";
            drawCircleWithText(treeGroup, rightChildX, level2Y, "*", opColor);
            drawCircleWithText(treeGroup, rightGrandchildRightX, level2Y, "E", currentStepIndex === 3 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, rightChildX, level1Y + nodeRadius, rightGrandchildLeftX, level2Y - nodeRadius);
            drawEdge(treeGroup, rightChildX, level1Y + nodeRadius, rightChildX, level2Y - nodeRadius);
            drawEdge(treeGroup, rightChildX, level1Y + nodeRadius, rightGrandchildRightX, level2Y - nodeRadius);
        }
        
        // Step 4: Draw id under left E*E
        if (currentStepIndex >= 4) {
            // If this is the final step, make leaf nodes yellow, otherwise use appropriate color
            const leafColor = currentStepIndex === 5 ? "yellow" : (currentStepIndex === 4 ? "green" : "blue");
            drawCircleWithText(treeGroup, rightGrandchildLeftX, level3Y, "id", leafColor);
            drawEdge(treeGroup, rightGrandchildLeftX, level2Y + nodeRadius, rightGrandchildLeftX, level3Y - nodeRadius);
        }
        
        // Step 5: Draw id under right E*E
        if (currentStepIndex >= 5) {
            drawCircleWithText(treeGroup, rightGrandchildRightX, level3Y, "id", currentStepIndex === 5 ? "yellow" : "green");
            drawEdge(treeGroup, rightGrandchildRightX, level2Y + nodeRadius, rightGrandchildRightX, level3Y - nodeRadius);
        }
    } else {
        // Rightmost derivation steps
        // Step 0: Draw root node E
        if (currentStepIndex >= 0) {
            drawCircleWithText(treeGroup, rootX, rootY0, "E", currentStepIndex === 0 ? "green" : "blue");
        }
        
        // Step 1: Draw E → E * E
        if (currentStepIndex >= 1) {
            drawCircleWithText(treeGroup, leftChildX, level1Y, "E", currentStepIndex === 1 ? "green" : "blue");
            // If this is the final step, make terminal nodes yellow
            const opColor = currentStepIndex === 5 ? "yellow" : "normal";
            drawCircleWithText(treeGroup, middleChildX, level1Y, "*", opColor);
            drawCircleWithText(treeGroup, rightChildX, level1Y, "E", currentStepIndex === 1 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, leftChildX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, middleChildX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, rightChildX, level1Y - nodeRadius);
        }
        
        // Step 2: Draw E + E under left E
        if (currentStepIndex >= 2) {
            drawCircleWithText(treeGroup, leftGrandchildX, level2Y, "E", currentStepIndex === 2 ? "green" : "blue");
            // If this is the final step, make terminal nodes yellow
            const opColor = currentStepIndex === 5 ? "yellow" : "normal";
            drawCircleWithText(treeGroup, leftChildX, level2Y, "+", opColor);
            drawCircleWithText(treeGroup, rightGrandchildX, level2Y, "E", currentStepIndex === 2 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, leftChildX, level1Y + nodeRadius, leftGrandchildX, level2Y - nodeRadius);
            drawEdge(treeGroup, leftChildX, level1Y + nodeRadius, leftChildX, level2Y - nodeRadius);
            drawEdge(treeGroup, leftChildX, level1Y + nodeRadius, rightGrandchildX, level2Y - nodeRadius);
        }
        
        // Step 3: Draw id under right E
        if (currentStepIndex >= 3) {
            // If this is the final step, make leaf nodes yellow, otherwise use appropriate color
            const leafColor = currentStepIndex === 5 ? "yellow" : (currentStepIndex === 3 ? "green" : "blue");
            drawCircleWithText(treeGroup, rightChildX, level2Y, "id", leafColor);
            drawEdge(treeGroup, rightChildX, level1Y + nodeRadius, rightChildX, level2Y - nodeRadius);
        }
        
        // Step 4: Draw id under right E+E
        if (currentStepIndex >= 4) {
            // If this is the final step, make leaf nodes yellow, otherwise use appropriate color
            const leafColor = currentStepIndex === 5 ? "yellow" : (currentStepIndex === 4 ? "green" : "blue");
            drawCircleWithText(treeGroup, rightGrandchildX, level3Y, "id", leafColor);
            drawEdge(treeGroup, rightGrandchildX, level2Y + nodeRadius, rightGrandchildX, level3Y - nodeRadius);
        }
        
        // Step 5: Draw id under left E+E
        if (currentStepIndex >= 5) {
            drawCircleWithText(treeGroup, leftGrandchildX, level3Y, "id", currentStepIndex === 5 ? "yellow" : "green");
            drawEdge(treeGroup, leftGrandchildX, level2Y + nodeRadius, leftGrandchildX, level3Y - nodeRadius);
        }
    }
    
    svg.appendChild(treeGroup);
}

// Function to draw the abab parse tree step by step to a specific SVG
function drawAbabTreeToSvg(svg, width, height, rootY) {
    const nodeRadius = 22; // Larger nodes
    const verticalSpacing = 80; // Increased spacing
    const horizontalSpacing = 120; // Increased spacing
    
    // Create a group for the entire tree
    const treeGroup = newElementNS('g', [
        ['transform', `translate(${width/2}, ${rootY})`]
    ]);
    
    // Get derivation type
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const derivation = input.derivations[currentDerivationIndex];
    const isLeftmost = derivation.type === "leftmost";
    
    // Define node positions - increased spacing for larger canvas
    const rootX = 0;
    const rootY0 = 0;
    const leftChildX = -horizontalSpacing;
    const rightChildX = horizontalSpacing;
    const childY = rootY0 + verticalSpacing;
    const leftGrandchildX1 = leftChildX - 60; // Increased from 50
    const leftGrandchildX2 = leftChildX + 60; // Increased from 50
    const rightGrandchildX1 = rightChildX - 60; // Increased from 50
    const rightGrandchildX2 = rightChildX + 60; // Increased from 50
    const grandchildY = childY + verticalSpacing;
    
    // Step 0: Draw root node S
    if (currentStepIndex >= 0) {
        drawCircleWithText(treeGroup, rootX, rootY0, "S", currentStepIndex === 0 ? "green" : "blue");
    }
    
    // Step 1: Draw S -> SS (both child S nodes)
    if (currentStepIndex >= 1) {
        drawCircleWithText(treeGroup, leftChildX, childY, "S", currentStepIndex === 1 ? "green" : "blue");
        drawCircleWithText(treeGroup, rightChildX, childY, "S", currentStepIndex === 1 ? "green" : "blue");
        
        // Draw edges from root to children
        drawEdge(treeGroup, rootX, rootY0 + nodeRadius, leftChildX, childY - nodeRadius);
        drawEdge(treeGroup, rootX, rootY0 + nodeRadius, rightChildX, childY - nodeRadius);
    }
    
    // Step 2: Draw S -> ab for leftmost derivation or rightmost derivation
    if (currentStepIndex >= 2) {
        if (isLeftmost) {
            // For leftmost: Draw a, b under left S
            // If this is the final step, make leaf nodes yellow
            const leafColor = currentStepIndex === 3 ? "yellow" : (currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, leftGrandchildX1, grandchildY, "a", leafColor);
            drawCircleWithText(treeGroup, leftGrandchildX2, grandchildY, "b", leafColor);
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX2, grandchildY - nodeRadius);
        } else {
            // For rightmost: Draw a, b under right S
            // If this is the final step, make leaf nodes yellow
            const leafColor = currentStepIndex === 3 ? "yellow" : (currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, rightGrandchildX1, grandchildY, "a", leafColor);
            drawCircleWithText(treeGroup, rightGrandchildX2, grandchildY, "b", leafColor);
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX2, grandchildY - nodeRadius);
        }
    }
    
    // Step 3: Draw the final a, b for completing the tree
    if (currentStepIndex >= 3) {
        if (isLeftmost) {
            // For leftmost: Draw a, b under right S
            drawCircleWithText(treeGroup, rightGrandchildX1, grandchildY, "a", "yellow");
            drawCircleWithText(treeGroup, rightGrandchildX2, grandchildY, "b", "yellow");
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX2, grandchildY - nodeRadius);
        } else {
            // For rightmost: Draw a, b under left S
            drawCircleWithText(treeGroup, leftGrandchildX1, grandchildY, "a", "yellow");
            drawCircleWithText(treeGroup, leftGrandchildX2, grandchildY, "b", "yellow");
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX2, grandchildY - nodeRadius);
        }
    }
    
    svg.appendChild(treeGroup);
}

// Function to draw the if-then-else tree to a specific SVG
function drawIfThenElseTreeToSvg(svg, width, height, rootY) {
    const nodeRadius = 22; // Match the radius used in drawCircleWithText
    const levelGap = 70; // Further increased vertical spacing
    
    // Create a group for the entire tree
    const treeGroup = newElementNS('g', [
        ['transform', `translate(${width/2}, ${rootY})`]
    ]);
    
    // Get derivation type
    const derivation = cfgs[currentCfgIndex].inputs[currentInputIndex].derivations[currentDerivationIndex];
    const isFirstDerivation = derivation.type === "leftmost"; // Derivation 1 (else associates with first if)
    
    // Define node positions - shifted right for better centering
    const rootX = 0;
    const rootY0 = 0;
    
    // First level nodes common for both trees - significantly increased horizontal spacing
    const level1Y = rootY0 + levelGap;
    const ifX = -170;  // shifted right from -200
    const EX = -120;   // shifted right from -150
    const thenX = -60;  // shifted right from -90
    const SX = 0;      // shifted right from -30
    
    // For derivation 1 (first derivation)
    const elseX = 90;   // shifted right from 60
    const rightSX = 150; // shifted right from 120
    
    // Level 2 nodes - significantly adjusted positioning to prevent overlap
    const level2Y = level1Y + levelGap;
    const nestedIfX = SX - 90;
    const nestedEX = SX - 45;
    const nestedThenX = SX;
    const nestedSX = SX + 45;
    
    // Level 3 nodes
    const level3Y = level2Y + levelGap;
    const otherXLeft = nestedSX;
    
    // For derivation 1, the nested else is at level 2
    const nestedElseX = SX + 120; // shifted right from SX + 90
    const nestedRightSX = SX + 165; // shifted right from SX + 135
    
    // For derivation 2, the nested else is under the nested S
    const nestedElseX2 = nestedSX + 65;
    const nestedRightSX2 = nestedSX + 110;
    
    if (isFirstDerivation) {
        // Derivation 1: else associates with first if
        
        // Step 1: Draw root S
        if (currentStepIndex >= 0) {
            drawCircleWithText(treeGroup, rootX, rootY0, "S", currentStepIndex === 0 ? "green" : "blue");
        }
        
        // Step 2: Draw if E then S else S
        if (currentStepIndex >= 1) {
            // If this is the final step, make terminal nodes yellow
            const terminalColor = currentStepIndex === 4 ? "yellow" : (currentStepIndex === 1 ? "green" : "blue");
            const keywordColor = currentStepIndex === 4 ? "yellow" : "normal";
            
            drawCircleWithText(treeGroup, ifX, level1Y, "if", terminalColor);
            drawCircleWithText(treeGroup, EX, level1Y, "E", terminalColor);
            drawCircleWithText(treeGroup, thenX, level1Y, "then", keywordColor);
            drawCircleWithText(treeGroup, SX, level1Y, "S", currentStepIndex === 1 ? "green" : "blue");
            drawCircleWithText(treeGroup, elseX, level1Y, "else", keywordColor);
            drawCircleWithText(treeGroup, rightSX, level1Y, "S", currentStepIndex === 1 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, ifX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, EX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, thenX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, SX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, elseX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, rightSX, level1Y - nodeRadius);
        }
        
        // Step 3: Draw the nested if E then S within first S (the expanded part should be under S, not under if)
        if (currentStepIndex >= 2) {
            // If this is the final step, make terminal nodes yellow
            const terminalColor = currentStepIndex === 4 ? "yellow" : (currentStepIndex === 2 ? "green" : "blue");
            const keywordColor = currentStepIndex === 4 ? "yellow" : "normal";
            
            // Draw nested if E then S under the first S (S node is at SX)
            drawCircleWithText(treeGroup, nestedIfX, level2Y, "if", terminalColor);
            drawCircleWithText(treeGroup, nestedEX, level2Y, "E", terminalColor);
            drawCircleWithText(treeGroup, nestedThenX, level2Y, "then", keywordColor);
            drawCircleWithText(treeGroup, nestedSX, level2Y, "S", currentStepIndex === 2 ? "green" : "blue");
            
            // Draw edges connecting to the first S only (not to the rest of level1 nodes)
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedIfX, level2Y - nodeRadius);
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedEX, level2Y - nodeRadius);
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedThenX, level2Y - nodeRadius);
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedSX, level2Y - nodeRadius);
            
            // We don't connect else/S at this step - that's part of the original production from step 1
        }
        
        // Step 4: Replace nested S with "other"
        if (currentStepIndex >= 3) {
            // If this is the final step, make leaf nodes yellow
            const leafColor = currentStepIndex === 4 ? "yellow" : (currentStepIndex === 3 ? "green" : "blue");
            drawCircleWithText(treeGroup, nestedSX, level3Y, "other", leafColor);
            drawEdge(treeGroup, nestedSX, level2Y + nodeRadius, nestedSX, level3Y - nodeRadius);
        }
        
        // Step 5: Replace rightmost S (from original if-then-else) with "other"
        if (currentStepIndex >= 4) {
            // This is the original S at level 1, which is the rightmost in "if E then S else S"
            drawCircleWithText(treeGroup, rightSX, level3Y, "other", "yellow");
            drawEdge(treeGroup, rightSX, level1Y + nodeRadius, rightSX, level3Y - nodeRadius);
        }
    } else {
        // Derivation 2: else associates with closest if
        
        // Step 1: Draw root S
        if (currentStepIndex >= 0) {
            drawCircleWithText(treeGroup, rootX, rootY0, "S", currentStepIndex === 0 ? "green" : "blue");
        }
        
        // Step 2: Draw if E then S
        if (currentStepIndex >= 1) {
            // If this is the final step, make terminal nodes yellow
            const terminalColor = currentStepIndex === 4 ? "yellow" : (currentStepIndex === 1 ? "green" : "blue");
            const keywordColor = currentStepIndex === 4 ? "yellow" : "normal";
            
            drawCircleWithText(treeGroup, ifX, level1Y, "if", terminalColor);
            drawCircleWithText(treeGroup, EX, level1Y, "E", terminalColor);
            drawCircleWithText(treeGroup, thenX, level1Y, "then", keywordColor);
            drawCircleWithText(treeGroup, SX, level1Y, "S", currentStepIndex === 1 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, ifX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, EX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, thenX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY0 + nodeRadius, SX, level1Y - nodeRadius);
        }
        
        // Step 3: Draw the nested if E then S else S within first S
        if (currentStepIndex >= 2) {
            // If this is the final step, make terminal nodes yellow
            const terminalColor = currentStepIndex === 4 ? "yellow" : (currentStepIndex === 2 ? "green" : "blue");
            const keywordColor = currentStepIndex === 4 ? "yellow" : "normal";
            
            drawCircleWithText(treeGroup, nestedIfX, level2Y, "if", terminalColor);
            drawCircleWithText(treeGroup, nestedEX, level2Y, "E", terminalColor);
            drawCircleWithText(treeGroup, nestedThenX, level2Y, "then", keywordColor);
            drawCircleWithText(treeGroup, nestedSX, level2Y, "S", currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, nestedElseX2, level2Y, "else", keywordColor); 
            drawCircleWithText(treeGroup, nestedRightSX2, level2Y, "S", currentStepIndex === 2 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedIfX, level2Y - nodeRadius);
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedEX, level2Y - nodeRadius);
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedThenX, level2Y - nodeRadius);
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedSX, level2Y - nodeRadius);
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedElseX2, level2Y - nodeRadius);
            drawEdge(treeGroup, SX, level1Y + nodeRadius, nestedRightSX2, level2Y - nodeRadius);
        }
        
        // Step 4: Replace nested S with "other"
        if (currentStepIndex >= 3) {
            // If this is the final step, make leaf nodes yellow
            const leafColor = currentStepIndex === 4 ? "yellow" : (currentStepIndex === 3 ? "green" : "blue");
            drawCircleWithText(treeGroup, nestedSX, level3Y, "other", leafColor);
            drawEdge(treeGroup, nestedSX, level2Y + nodeRadius, nestedSX, level3Y - nodeRadius);
        }
        
        // Step 5: Replace rightmost S with "other"
        if (currentStepIndex >= 4) {
            drawCircleWithText(treeGroup, nestedRightSX2, level3Y, "other", "yellow");
            drawEdge(treeGroup, nestedRightSX2, level2Y + nodeRadius, nestedRightSX2, level3Y - nodeRadius);
        }
    }
    
    svg.appendChild(treeGroup);
}

// Function to draw a circle with text inside
function drawCircleWithText(parent, x, y, text, color = "normal") {
    // Create the circle with larger radius
    const circle = newElementNS('circle', [
        ['cx', x],
        ['cy', y],
        ['r', 22], // Increased from 20
        ['fill', getNodeColor(color)],
        ['stroke', '#333'],
        ['stroke-width', '1.5']
    ]);
    
    // Create the text with larger font size
    const textElem = newElementNS('text', [
        ['x', x],
        ['y', y],
        ['text-anchor', 'middle'],
        ['dominant-baseline', 'middle'],
        ['font-size', '15px'], // Increased from 14px
        ['fill', '#333'],
        ['font-weight', 'bold']
    ]);
    textElem.textContent = text;
    
    // Add elements to parent
    parent.appendChild(circle);
    parent.appendChild(textElem);
}

// Function to draw an edge between two nodes
function drawEdge(parent, x1, y1, x2, y2) {
    const line = newElementNS('line', [
        ['x1', x1],
        ['y1', y1],
        ['x2', x2],
        ['y2', y2],
        ['stroke', '#555'],
        ['stroke-width', '1.5']
    ]);
    
    parent.appendChild(line);
}

// Function to get the color for a node based on its state
function getNodeColor(color) {
    switch(color) {
        case "green": return '#4ade80'; // Current node being processed
        case "blue": return '#93c5fd';  // Already processed node
        case "yellow": return '#fcd34d'; // Terminal node in final step
        default: return '#f0f0f0';      // Normal node
    }
}

// Function to show the ambiguity comparison between derivations
function showAmbiguityComparison() {
    showDerivationComparisonTable();
}

// Function to show the derivation comparison in a table format
function showDerivationComparisonTable() {
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const derivations = input.derivations;
    
    console.log("Showing comparison for grammar:", currentCfgIndex);
    
    // For if-then-else grammar (Grammar 3), use a card-based layout
    if (currentCfgIndex === 2) {
        console.log("Using card-based layout for if-then-else grammar");
        showIfThenElseDerivationComparison(cfg, input, derivations);
        return;
    }
    
    // For other grammars, use the table format
    // Find the maximum number of steps between the two derivations
    const maxSteps = Math.max(derivations[0].steps.length, derivations[1].steps.length);
    
    // Create table rows for the comparison
    let tableRows = '';
    
    for (let i = 0; i < maxSteps; i++) {
        tableRows += '<tr>';
        
        // Step number
        tableRows += `<td class="step-number-cell">${i+1}</td>`;
        
        // Derivation 1
        if (i < derivations[0].steps.length) {
            tableRows += `<td class="derivation-result-cell">${derivations[0].steps[i].result}</td>
                         <td class="derivation-rule-cell">${derivations[0].steps[i].rule}</td>`;
        } else {
            tableRows += '<td></td><td></td>';
        }
        
        // Derivation 2
        if (i < derivations[1].steps.length) {
            tableRows += `<td class="derivation-result-cell">${derivations[1].steps[i].result}</td>
                         <td class="derivation-rule-cell">${derivations[1].steps[i].rule}</td>`;
        } else {
            tableRows += '<td></td><td></td>';
        }
        
        tableRows += '</tr>';
    }
    
    // Create HTML content for the comparison
    let content = `
        <div class="comparison-container">
            <h2 style="text-align: center; color: #5b21b6; margin-bottom: 10px; font-size: 18px;">
                Grammar Ambiguity Demonstrated
            </h2>
            
            <table class="derivation-comparison-table">
                <colgroup>
                    <col class="step-col">
                    <col class="result-col">
                    <col class="rule-col">
                    <col class="result-col">
                    <col class="rule-col">
                </colgroup>
                <thead>
                    <tr>
                        <th class="step-header">Step</th>
                        <th class="derivation-header" colspan="2">${derivations[0].description}</th>
                        <th class="derivation-header" colspan="2">${derivations[1].description}</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>Derivation</th>
                        <th>Rule Applied</th>
                        <th>Derivation</th>
                        <th>Rule Applied</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            
            <div style="text-align: center; margin-top: 10px; font-size: 0.85rem; color: #6b7280;">
                Note: Both derivations produce the same string but with different parse trees.
            </div>
        </div>
    `;
    
    // Use SweetAlert to show the comparison
    swal({
        title: "Derivation Comparison",
        content: {
            element: "div",
            attributes: {
                innerHTML: content
            }
        },
        className: "derivation-comparison-alert",
        customClass: {
            container: "standard-comparison-alert"
        },
        button: {
            text: "Close",
            className: "swal-button--close"
        }
    });
}

// Function to show if-then-else derivation comparison with a card-based layout
function showIfThenElseDerivationComparison(cfg, input, derivations) {
    console.log("showIfThenElseDerivationComparison called");
    console.log("Derivations:", derivations);
    
    try {
        // Create step elements for each derivation
        let derivation1Steps = '';
        let derivation2Steps = '';
        
        // Generate HTML for derivation 1
        for (let i = 0; i < derivations[0].steps.length; i++) {
            const step = derivations[0].steps[i];
            derivation1Steps += `
                <div class="derivation-step">
                    <div class="step-number">${i + 1}</div>
                    <div class="step-content">
                        <div class="step-result">${step.result}</div>
                        <div class="step-rule">${step.rule}</div>
                    </div>
                </div>
            `;
        }
        
        // Generate HTML for derivation 2
        for (let i = 0; i < derivations[1].steps.length; i++) {
            const step = derivations[1].steps[i];
            derivation2Steps += `
                <div class="derivation-step">
                    <div class="step-number">${i + 1}</div>
                    <div class="step-content">
                        <div class="step-result">${step.result}</div>
                        <div class="step-rule">${step.rule}</div>
                    </div>
                </div>
            `;
        }        
        // Create HTML content for both derivations
        let content = `
            <div class="comparison-container if-then-else-comparison">
                <h2 style="text-align: center; color: #5b21b6; margin-bottom: 20px; font-size: 18px;">
                    Grammar Ambiguity Demonstrated: if-then-else
                </h2>
                
                <div class="derivation-cards-container">
                    <div class="derivation-card">
                        <h3 class="derivation-card-header">${derivations[0].description}</h3>
                        <div class="derivation-steps">
                            ${derivation1Steps}
                        </div>
                    </div>
                    
                    <div class="derivation-card">
                        <h3 class="derivation-card-header">${derivations[1].description}</h3>
                        <div class="derivation-steps">
                            ${derivation2Steps}
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 0.9rem; color: #6b7280;">
                    <p>Note: Both derivations produce the same string but with different parse trees.</p>
                    <p style="font-style: italic; margin-top: 5px;">
                        This is the classic if-then-else ambiguity: the "else" clause can be associated with either the inner or outer "if" statement.
                    </p>
                </div>
            </div>
        `;
        
        console.log("Content created, showing SweetAlert");
        
        // Use SweetAlert to show the comparison
        swal({
            title: "if-then-else Derivation Comparison",
            content: {
                element: "div",
                attributes: {
                    innerHTML: content
                }
            },
            className: "derivation-comparison-alert",
            customClass: {
                container: "if-then-else-alert"
            },
            button: {
                text: "Close",
                className: "swal-button--close"
            }
        });
        
        console.log("SweetAlert called");
    } catch (error) {
        console.error("Error in showIfThenElseDerivationComparison:", error);
        // Fallback to table view if there's an error
        alert("There was an error showing the card view. Please try again.");
    }
}

// Function to show completion alert
function showCompletionAlert(inputString, derivationDesc) {
    swal({
        title: "Derivation Complete!",
        text: `Completed: ${derivationDesc}\nString: "${inputString}"\n\nTry toggling to see the alternative derivation for this string.`,
        icon: "success",
        button: {
            text: "OK",
            className: "swal-button--green"
        }
    });
}

// Function to show notifications
function showNotification(title, message, type = 'info') {
    // Using SweetAlert for notifications
    swal({
        title: title,
        text: message,
        icon: type,
        button: "OK",
    });
}

// Function to update button states based on derivation progress
function updateButtonStates() {
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const leftDerivation = input.derivations[0];
    const rightDerivation = input.derivations[1];
    
    const nextButton = document.getElementById('next_step');
    const prevButton = document.getElementById('prev_step');
    
    // Check if we can go forward
    const leftComplete = leftStepIndex >= leftDerivation.steps.length - 1;
    const rightComplete = rightStepIndex >= rightDerivation.steps.length - 1;
    const canGoForward = !leftComplete || !rightComplete;
    
    // Check if we can go backward
    const canGoBackward = leftStepIndex > 0 || rightStepIndex > 0;
    
    if (nextButton) {
        nextButton.disabled = !canGoForward;
        nextButton.style.opacity = canGoForward ? '1' : '0.6';
    }
    
    if (prevButton) {
        prevButton.disabled = !canGoBackward;
        prevButton.style.opacity = canGoBackward ? '1' : '0.6';
    }
}

// Interactive Mode Functions

// Function to handle production rule selection
function handleRuleSelection(selectedRule, ruleIndex) {
    console.log('Rule selected:', selectedRule, 'for derivation:', currentDerivationType);
    
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const leftDerivation = input.derivations[0];
    const rightDerivation = input.derivations[1];
    
    // Determine which derivation we're working with and what the expected rule is
    let expectedRule = "";
    let currentDerivation, nextStepIndex;
    
    if (currentDerivationType === 'left') {
        currentDerivation = leftDerivation;
        nextStepIndex = leftStepIndex + 1;
    } else {
        currentDerivation = rightDerivation;
        nextStepIndex = rightStepIndex + 1;
    }
    
    // Check if there's a next step
    if (nextStepIndex >= currentDerivation.steps.length) {
        showNotification("Complete", "This derivation is already complete!", "info");
        return;
    }
    
    // Get the expected rule for the next step
    expectedRule = currentDerivation.steps[nextStepIndex].rule;
    
    console.log('Expected rule:', expectedRule, 'Selected rule:', selectedRule);
    
    // Check if the selected rule matches the expected rule
    if (selectedRule === expectedRule) {
        // Correct rule selected - advance the step
        if (currentDerivationType === 'left') {
            leftStepIndex++;
            currentDerivationType = 'right';
        } else {
            rightStepIndex++;
            currentDerivationType = 'left';
        }
        
        // Update visual feedback
        highlightCorrectRule(ruleIndex);
        showNotification("Correct!", "Good choice! Rule applied successfully.", "success");
        
        // Refresh display
        setTimeout(() => {
            refreshDisplay();
            updateRuleButtonStates();
        }, 500);
        
    } else {
        // Wrong rule selected - show feedback
        highlightIncorrectRule(ruleIndex);
        showNotification("Try Again", "That's not the correct rule for this step. Try again!", "error");
        
        // Reset highlight after a delay
        setTimeout(() => {
            updateRuleButtonStates();
        }, 1500);
    }
}

// Function to highlight correct rule selection
function highlightCorrectRule(ruleIndex) {
    const ruleButtons = document.querySelectorAll('.production-rule-button');
    ruleButtons[ruleIndex].style.backgroundColor = '#10b981';
    ruleButtons[ruleIndex].style.color = 'white';
    ruleButtons[ruleIndex].style.transform = 'scale(1.05)';
}

// Function to highlight incorrect rule selection
function highlightIncorrectRule(ruleIndex) {
    const ruleButtons = document.querySelectorAll('.production-rule-button');
    ruleButtons[ruleIndex].style.backgroundColor = '#ef4444';
    ruleButtons[ruleIndex].style.color = 'white';
    ruleButtons[ruleIndex].style.transform = 'scale(0.95)';
    
    // Add shake animation
    ruleButtons[ruleIndex].style.animation = 'shake 0.5s ease-in-out';
}

// Function to update rule button states
function updateRuleButtonStates() {
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const leftDerivation = input.derivations[0];
    const rightDerivation = input.derivations[1];
    
    // Reset all button styles
    const ruleButtons = document.querySelectorAll('.production-rule-button');
    ruleButtons.forEach(button => {
        button.style.backgroundColor = '';
        button.style.color = '';
        button.style.transform = '';
        button.style.animation = '';
        button.disabled = false;
        button.style.opacity = '1';
    });
    
    // Check if both derivations are complete
    const leftComplete = leftStepIndex >= leftDerivation.steps.length - 1;
    const rightComplete = rightStepIndex >= rightDerivation.steps.length - 1;
    
    if (leftComplete && rightComplete) {
        // Disable all buttons if both derivations are complete
        ruleButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.6';
        });
        
        // Show completion message
        setTimeout(() => {
            showDerivationComparisonTable();
        }, 1000);
    } else {
        // Don't pre-highlight any rules - let users discover the correct choice
        // This maintains the clean interactive experience without giving away answers
    }
}

// Function to show hint for current step
function showHint() {
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const leftDerivation = input.derivations[0];
    const rightDerivation = input.derivations[1];
    
    let expectedRule = "";
    let currentDerivation, nextStepIndex;
    
    if (currentDerivationType === 'left') {
        currentDerivation = leftDerivation;
        nextStepIndex = leftStepIndex + 1;
    } else {
        currentDerivation = rightDerivation;
        nextStepIndex = rightStepIndex + 1;
    }
    
    if (nextStepIndex < currentDerivation.steps.length) {
        expectedRule = currentDerivation.steps[nextStepIndex].rule;
        const derivationName = currentDerivationType === 'left' ? 'Left' : 'Right';
        showNotification("Hint", `For ${derivationName} derivation, the next rule should be: "${expectedRule}"`, "info");
        
        // Highlight the correct rule temporarily
        const ruleButtons = document.querySelectorAll('.production-rule-button');
        ruleButtons.forEach((button, index) => {
            if (button.textContent === expectedRule) {
                button.style.backgroundColor = '#fbbf24';
                button.style.color = 'white';
                button.style.transform = 'scale(1.02)';
                
                setTimeout(() => {
                    updateRuleButtonStates();
                }, 2000);
            }
        });
    }
}
