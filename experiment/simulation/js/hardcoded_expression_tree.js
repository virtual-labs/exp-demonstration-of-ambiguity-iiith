// Global variables
let currentDerivationIndex = 0;
let currentStepIndex = 0;

// Helper functions for SVG and DOM manipulation
function newElementNS(tag, attr) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    attr.forEach(function (item) {
        elem.setAttribute(item[0], item[1]);
    });
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
    // Set up event listeners for buttons
    document.getElementById('toggle_derivation').addEventListener('click', toggleDerivation);
    document.getElementById('prev_step').addEventListener('click', prevStep);
    document.getElementById('next_step').addEventListener('click', nextStep);
    document.getElementById('show_ambiguity').addEventListener('click', showAmbiguityComparison);
    
    // Disable the "Change Grammar" button since we only have one grammar
    const changeGrammarBtn = document.getElementById('change_grammar');
    changeGrammarBtn.disabled = true;
    changeGrammarBtn.classList.add('disabled');
    
    // Initialize display
    refreshDisplay();
});

// Function to toggle between leftmost and rightmost derivations
function toggleDerivation() {
    const grammar = cfgs[0];
    const input = grammar.inputs[0];
    currentDerivationIndex = (currentDerivationIndex + 1) % input.derivations.length;
    currentStepIndex = 0;
    refreshDisplay();
}

// Function to move to the next derivation step
function nextStep() {
    const grammar = cfgs[0];
    const input = grammar.inputs[0];
    const derivation = input.derivations[currentDerivationIndex];
    
    if (currentStepIndex < derivation.steps.length - 1) {
        currentStepIndex++;
        refreshDisplay();
    } else {
        showCompletionAlert(input.string, derivation.description);
    }
}

// Function to move to the previous derivation step
function prevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        refreshDisplay();
    }
}

// Function to update the entire display based on current state
function refreshDisplay() {
    const grammar = cfgs[0];
    const input = grammar.inputs[0];
    const derivation = input.derivations[currentDerivationIndex];

    // Update grammar description
    const descContainer = document.getElementById("grammar_description_container");
    clearElem(descContainer);
    const desc = document.createElement('h3');
    desc.textContent = grammar.description;
    descContainer.appendChild(desc);
    
    // Update derivation type
    const typeContainer = document.getElementById("derivation_type");
    typeContainer.textContent = derivation.description;

    // Update input string
    const inputContainer = document.getElementById("input_container");
    clearElem(inputContainer);
    const inputStr = document.createElement('div');
    inputStr.className = "input-string";
    inputStr.textContent = input.string;
    inputContainer.appendChild(inputStr);

    // Update production rules
    const rulesContainer = document.getElementById("production_rules_container");
    clearElem(rulesContainer);
    
    grammar.productions.forEach(prod => {
        const rule = document.createElement('div');
        rule.className = "rule";
        rule.textContent = prod;
        rulesContainer.appendChild(rule);
    });

    // Draw the parse tree for the current step
    drawExpressionTree();
    
    // Update derivation steps list
    updateDerivationStepsList(derivation);
}

// Function to update the derivation steps list
function updateDerivationStepsList(derivation) {
    const stepsList = document.getElementById("derivation_steps_list");
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

// Function to draw the hardcoded expression tree for "id+id*id"
function drawExpressionTree() {
    const svg = document.getElementById('parse_tree');
    clearElem(svg);
    
    // Set viewBox to enable responsive scaling
    svg.setAttribute('viewBox', '0 0 600 300');
    
    const width = 600;
    const height = 300;
    
    // Create a group for the entire tree
    const treeGroup = newElementNS('g', [
        ['transform', `translate(${width/2}, 40)`]
    ]);
    
    // Get derivation type
    const derivation = cfgs[0].inputs[0].derivations[currentDerivationIndex];
    const isLeftmost = derivation.type === "leftmost";
    
    // Define node positions
    const nodeRadius = 20;
    const levelGap = 50;
    const rootY = 0;
    
    // Root node (E)
    const rootX = 0;
    
    // Level 1 nodes for both derivations
    const level1Y = rootY + levelGap;
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
            drawCircleWithText(treeGroup, rootX, rootY, "E", currentStepIndex === 0 ? "green" : "blue");
        }
        
        // Step 1: Draw E → E + E
        if (currentStepIndex >= 1) {
            drawCircleWithText(treeGroup, leftChildX, level1Y, "E", currentStepIndex === 1 ? "green" : "blue");
            drawCircleWithText(treeGroup, middleChildX, level1Y, "+", "normal");
            drawCircleWithText(treeGroup, rightChildX, level1Y, "E", currentStepIndex === 1 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, rootX, rootY + nodeRadius, leftChildX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY + nodeRadius, middleChildX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY + nodeRadius, rightChildX, level1Y - nodeRadius);
        }
        
        // Step 2: Draw id under left E
        if (currentStepIndex >= 2) {
            drawCircleWithText(treeGroup, leftChildX, level1Y, "E", "blue");
            drawCircleWithText(treeGroup, leftChildX, level2Y, "id", currentStepIndex === 2 ? "green" : "blue");
            drawEdge(treeGroup, leftChildX, level1Y + nodeRadius, leftChildX, level2Y - nodeRadius);
        }
        
        // Step 3: Draw E * E under right E
        if (currentStepIndex >= 3) {
            drawCircleWithText(treeGroup, rightGrandchildLeftX, level2Y, "E", currentStepIndex === 3 ? "green" : "blue");
            drawCircleWithText(treeGroup, rightChildX, level2Y, "*", "normal");
            drawCircleWithText(treeGroup, rightGrandchildRightX, level2Y, "E", currentStepIndex === 3 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, rightChildX, level1Y + nodeRadius, rightGrandchildLeftX, level2Y - nodeRadius);
            drawEdge(treeGroup, rightChildX, level1Y + nodeRadius, rightChildX, level2Y - nodeRadius);
            drawEdge(treeGroup, rightChildX, level1Y + nodeRadius, rightGrandchildRightX, level2Y - nodeRadius);
        }
        
        // Step 4: Draw id under left E*E
        if (currentStepIndex >= 4) {
            drawCircleWithText(treeGroup, rightGrandchildLeftX, level3Y, "id", currentStepIndex === 4 ? "green" : "blue");
            drawEdge(treeGroup, rightGrandchildLeftX, level2Y + nodeRadius, rightGrandchildLeftX, level3Y - nodeRadius);
        }
        
        // Step 5: Draw id under right E*E
        if (currentStepIndex >= 5) {
            drawCircleWithText(treeGroup, rightGrandchildRightX, level3Y, "id", currentStepIndex === 5 ? "green" : "blue");
            drawEdge(treeGroup, rightGrandchildRightX, level2Y + nodeRadius, rightGrandchildRightX, level3Y - nodeRadius);
        }
    } else {
        // Rightmost derivation steps
        // Step 0: Draw root node E
        if (currentStepIndex >= 0) {
            drawCircleWithText(treeGroup, rootX, rootY, "E", currentStepIndex === 0 ? "green" : "blue");
        }
        
        // Step 1: Draw E → E * E
        if (currentStepIndex >= 1) {
            drawCircleWithText(treeGroup, leftChildX, level1Y, "E", currentStepIndex === 1 ? "green" : "blue");
            drawCircleWithText(treeGroup, middleChildX, level1Y, "*", "normal");
            drawCircleWithText(treeGroup, rightChildX, level1Y, "E", currentStepIndex === 1 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, rootX, rootY + nodeRadius, leftChildX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY + nodeRadius, middleChildX, level1Y - nodeRadius);
            drawEdge(treeGroup, rootX, rootY + nodeRadius, rightChildX, level1Y - nodeRadius);
        }
        
        // Step 2: Draw E + E under left E
        if (currentStepIndex >= 2) {
            drawCircleWithText(treeGroup, leftGrandchildX, level2Y, "E", currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, leftChildX, level2Y, "+", "normal");
            drawCircleWithText(treeGroup, rightGrandchildX, level2Y, "E", currentStepIndex === 2 ? "green" : "blue");
            
            // Draw edges
            drawEdge(treeGroup, leftChildX, level1Y + nodeRadius, leftGrandchildX, level2Y - nodeRadius);
            drawEdge(treeGroup, leftChildX, level1Y + nodeRadius, leftChildX, level2Y - nodeRadius);
            drawEdge(treeGroup, leftChildX, level1Y + nodeRadius, rightGrandchildX, level2Y - nodeRadius);
        }
        
        // Step 3: Draw id under right E
        if (currentStepIndex >= 3) {
            drawCircleWithText(treeGroup, rightChildX, level2Y, "id", currentStepIndex === 3 ? "green" : "blue");
            drawEdge(treeGroup, rightChildX, level1Y + nodeRadius, rightChildX, level2Y - nodeRadius);
        }
        
        // Step 4: Draw id under right E+E
        if (currentStepIndex >= 4) {
            drawCircleWithText(treeGroup, rightGrandchildX, level3Y, "id", currentStepIndex === 4 ? "green" : "blue");
            drawEdge(treeGroup, rightGrandchildX, level2Y + nodeRadius, rightGrandchildX, level3Y - nodeRadius);
        }
        
        // Step 5: Draw id under left E+E
        if (currentStepIndex >= 5) {
            drawCircleWithText(treeGroup, leftGrandchildX, level3Y, "id", currentStepIndex === 5 ? "green" : "blue");
            drawEdge(treeGroup, leftGrandchildX, level2Y + nodeRadius, leftGrandchildX, level3Y - nodeRadius);
        }
    }
    
    svg.appendChild(treeGroup);
}

// Helper function to draw a circle with text
function drawCircleWithText(parent, x, y, text, color) {
    const nodeRadius = 20;
    let fillColor, strokeColor, textColor;
    
    switch (color) {
        case "green":
            fillColor = "#34d399";
            strokeColor = "#059669";
            textColor = "white";
            break;
        case "blue":
            fillColor = "#6366f1";
            strokeColor = "#3730a3";
            textColor = "white";
            break;
        default:
            fillColor = "#ede9fe";
            strokeColor = "#7c3aed";
            textColor = "#5b21b6";
    }
    
    // Draw circle
    const circle = newElementNS('circle', [
        ['cx', x],
        ['cy', y],
        ['r', nodeRadius],
        ['fill', fillColor],
        ['stroke', strokeColor],
        ['stroke-width', color === "green" ? '3' : '2'],
        ['class', 'node-circle']
    ]);
    parent.appendChild(circle);
    
    // Add text label
    const label = newElementNS('text', [
        ['x', x],
        ['y', y],
        ['text-anchor', 'middle'],
        ['dy', '0.3em'],
        ['font-size', '0.9rem'],
        ['font-weight', '500'],
        ['fill', textColor]
    ]);
    label.textContent = text;
    parent.appendChild(label);
}

// Helper function to draw an edge
function drawEdge(parent, x1, y1, x2, y2) {
    const edge = newElementNS('path', [
        ['d', `M ${x1} ${y1} L ${x2} ${y2}`],
        ['stroke', '#7c3aed'],
        ['stroke-width', '1.5'],
        ['fill', 'none']
    ]);
    parent.appendChild(edge);
}

// Function to show the ambiguity comparison between derivations
function showAmbiguityComparison() {
    const grammar = cfgs[0];
    const input = grammar.inputs[0];
    const derivations = input.derivations;
    
    // Create HTML content for the comparison
    let content = `
        <div class="ambiguity-container">
            <h2 style="text-align: center; color: #5b21b6; margin-bottom: 15px;">
                Ambiguity Demonstrated for "${input.string}"
            </h2>
            <p style="text-align: center; margin-bottom: 20px;">
                The same string can be derived in multiple ways, resulting in different parse trees.
                This demonstrates that the grammar is ambiguous.
            </p>
            <div class="derivation-comparison">
                <div class="derivation-card">
                    <h3>${derivations[0].description}</h3>
                    <p style="text-align: center; margin: 10px 0;">${derivations[0].steps.map(step => step.result).join(' → ')}</p>
                </div>
                <div class="derivation-card">
                    <h3>${derivations[1].description}</h3>
                    <p style="text-align: center; margin: 10px 0;">${derivations[1].steps.map(step => step.result).join(' → ')}</p>
                </div>
            </div>
        </div>
    `;
    
    // Use SweetAlert to show the comparison
    swal({
        title: "Ambiguity Comparison",
        content: {
            element: "div",
            attributes: {
                innerHTML: content
            }
        },
        className: "ambiguity-comparison-alert",
        button: "Close"
    });
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
