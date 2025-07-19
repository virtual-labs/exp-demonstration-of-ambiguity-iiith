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
    drawStepByStepTree();
    
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

// Function to draw the step-by-step tree for "abab"
function drawStepByStepTree() {
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
    const rootX = 0;
    const rootY = 0;
    const levelGap = 70;
    
    // Level 1 - Child nodes (two S nodes)
    const leftChildX = -100;
    const rightChildX = 100;
    const childY = rootY + levelGap;
    
    // Level 2 - Grandchild nodes (a and b terminals)
    const leftGrandchildX1 = leftChildX - 40;
    const leftGrandchildX2 = leftChildX + 40;
    const rightGrandchildX1 = rightChildX - 40;
    const rightGrandchildX2 = rightChildX + 40;
    const grandchildY = childY + levelGap;
    
    // Step 0: Draw root node S
    if (currentStepIndex >= 0) {
        drawCircleWithText(treeGroup, rootX, rootY, "S", currentStepIndex === 0 ? "green" : "blue");
    }
    
    // Step 1: Draw S → SS (both child S nodes)
    if (currentStepIndex >= 1) {
        // Draw left and right S nodes
        drawCircleWithText(treeGroup, leftChildX, childY, "S", currentStepIndex === 1 ? "green" : "blue");
        drawCircleWithText(treeGroup, rightChildX, childY, "S", currentStepIndex === 1 ? "green" : "blue");
        
        // Draw edges from root to children
        drawEdge(treeGroup, rootX, rootY + nodeRadius, leftChildX, childY - nodeRadius);
        drawEdge(treeGroup, rootX, rootY + nodeRadius, rightChildX, childY - nodeRadius);
    }
    
    // Step 2: Draw S → ab for leftmost or rightmost derivation
    if (currentStepIndex >= 2) {
        if (isLeftmost) {
            // For leftmost: Draw a, b under left S
            drawCircleWithText(treeGroup, leftGrandchildX1, grandchildY, "a", currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, leftGrandchildX2, grandchildY, "b", currentStepIndex === 2 ? "green" : "blue");
            
            // Draw edges from left S to a, b
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX2, grandchildY - nodeRadius);
        } else {
            // For rightmost: Draw a, b under right S
            drawCircleWithText(treeGroup, rightGrandchildX1, grandchildY, "a", currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, rightGrandchildX2, grandchildY, "b", currentStepIndex === 2 ? "green" : "blue");
            
            // Draw edges from right S to a, b
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX2, grandchildY - nodeRadius);
        }
    }
    
    // Step 3: Draw the final a, b for completing the tree
    if (currentStepIndex >= 3) {
        if (isLeftmost) {
            // For leftmost: Draw a, b under right S
            drawCircleWithText(treeGroup, rightGrandchildX1, grandchildY, "a", currentStepIndex === 3 ? "green" : "blue");
            drawCircleWithText(treeGroup, rightGrandchildX2, grandchildY, "b", currentStepIndex === 3 ? "green" : "blue");
            
            // Draw edges from right S to a, b
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX2, grandchildY - nodeRadius);
        } else {
            // For rightmost: Draw a, b under left S
            drawCircleWithText(treeGroup, leftGrandchildX1, grandchildY, "a", currentStepIndex === 3 ? "green" : "blue");
            drawCircleWithText(treeGroup, leftGrandchildX2, grandchildY, "b", currentStepIndex === 3 ? "green" : "blue");
            
            // Draw edges from left S to a, b
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX2, grandchildY - nodeRadius);
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
