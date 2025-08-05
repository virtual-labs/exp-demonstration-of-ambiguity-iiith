/**
 * Ambiguous Context-Free Grammar Visualization
 * 
 * This script visualizes the ambiguity in context-free grammars by showing
 * different derivations for the same input string, resulting in different parse trees.
 */

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
        elem.removeChild(elem.lastChild);
    }
}

// Global variables to track current state
let currentCfgIndex = 0;
let currentInputIndex = 0;
let currentDerivationIndex = 0;
let currentStepIndex = 0;

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for buttons
    document.getElementById('change_grammar').addEventListener('click', changeGrammar);
    document.getElementById('toggle_derivation').addEventListener('click', toggleDerivation);
    document.getElementById('next_step').addEventListener('click', nextStep);
    document.getElementById('prev_step').addEventListener('click', prevStep);
    document.getElementById('show_ambiguity').addEventListener('click', showAmbiguityComparison);
    
    // Initialize the view
    refreshDisplay();
});

// Function to change the current grammar
function changeGrammar() {
    currentCfgIndex = (currentCfgIndex + 1) % cfgs.length;
    currentInputIndex = 0;
    currentDerivationIndex = 0;
    currentStepIndex = 0;
    
    // Show notification
    showNotification('Grammar Changed', `Now showing: ${cfgs[currentCfgIndex].description}`);
    
    refreshDisplay();
}

// Function to toggle between derivation types (leftmost/rightmost)
function toggleDerivation() {
    const currentCfg = cfgs[currentCfgIndex];
    const currentInput = currentCfg.inputs[currentInputIndex];
    
    // Toggle between derivations
    currentDerivationIndex = (currentDerivationIndex + 1) % currentInput.derivations.length;
    currentStepIndex = 0;
    
    // Show notification
    showNotification('Derivation Changed', 
      `Now showing: ${currentInput.derivations[currentDerivationIndex].description}`);
    
    refreshDisplay();
}

// Function to move to the next derivation step
function nextStep() {
    const currentCfg = cfgs[currentCfgIndex];
    const currentInput = currentCfg.inputs[currentInputIndex];
    const currentDerivation = currentInput.derivations[currentDerivationIndex];
    
    if (currentStepIndex < currentDerivation.steps.length - 1) {
        currentStepIndex++;
        refreshDisplay();
        
        // If we've reached the end, show completion message
        if (currentStepIndex === currentDerivation.steps.length - 1) {
            setTimeout(() => {
                showCompletionAlert(currentInput.string, currentDerivation.description);
            }, 100);
        }
    } else {
        showNotification('Info', 'Already at the last step', 'info');
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
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const derivation = input.derivations[currentDerivationIndex];

    // Update grammar description
    const descContainer = document.getElementById("grammar_description_container");
    clearElem(descContainer);
    const desc = document.createElement('h3');
    desc.textContent = cfg.description;
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
    
    cfg.productions.forEach(prod => {
        const rule = document.createElement('div');
        rule.className = "rule";
        rule.textContent = prod;
        rulesContainer.appendChild(rule);
    });

    // Update parse tree - always show the full tree
    drawParseTree(derivation.parseTree);
    
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

// Draw a parse tree (top-down tree visualization)
function drawParseTree(parseTree) {
    const svg = document.getElementById('parse_tree');
    clearElem(svg);
    
    // Set viewBox to enable responsive scaling
    svg.setAttribute('viewBox', '0 0 600 300');
    
    const width = 600;
    const height = 300;
    const rootY = 40;
    
    // Get the current derivation info
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const derivation = input.derivations[currentDerivationIndex];
    
    // Special handling for "abab" string - draw the hardcoded tree step by step
    if (input.string === "abab") {
        drawAbabTree(svg, width, height, rootY);
    }
}

// Calculate the layout for the parse tree
function calculateTreeLayout(node, depth = 0) {
    if (!node.children || node.children.length === 0) {
        return { width: 50, height: 40, centerX: 25 };
    }
    
    const childLayouts = node.children.map(child => calculateTreeLayout(child, depth + 1));
    
    let totalWidth = 0;
    childLayouts.forEach(layout => {
        totalWidth += layout.width;
    });
    
    // Add some spacing between children
    const spacing = 15;
    totalWidth += spacing * (childLayouts.length - 1);
    
    // Make sure the node is at least as wide as all children
    const width = Math.max(60, totalWidth);
    
    // Calculate center position based on children
    let centerX = 0;
    if (childLayouts.length > 0) {
        const firstChildX = 0;
        const lastChildX = totalWidth - childLayouts[childLayouts.length - 1].width;
        centerX = (firstChildX + lastChildX) / 2 + childLayouts[childLayouts.length - 1].width / 2;
    } else {
        centerX = width / 2;
    }
    
    return {
        width,
        height: 50,
        centerX,
        childLayouts,
        totalChildWidth: totalWidth,
        spacing
    };
}

// Draw a node and its children recursively
function drawNode(parent, node, x, y, layout, currentStep, prevStep, level, childIndex = 0, parentNode = null) {
    const nodeRadius = 20;
    const verticalSpacing = 60;
    
    // Always show all nodes in the tree
    const nodeFill = '#ede9fe';
    const nodeStroke = '#7c3aed';
    const strokeWidth = '2';
    
    // Draw this node
    const circle = newElementNS('circle', [
        ['cx', layout.centerX],
        ['cy', y],
        ['r', nodeRadius],
        ['fill', nodeFill],
        ['stroke', nodeStroke],
        ['stroke-width', strokeWidth],
        ['class', 'node-circle']
    );
    parent.appendChild(circle);
    
    // Add text label
    const label = newElementNS('text', [
        ['x', layout.centerX],
        ['y', y],
        ['text-anchor', 'middle'],
        ['dy', '0.3em'],
        ['font-size', '0.9rem'],
        ['font-weight', '500'],
        ['fill', '#5b21b6']
    ]);
    label.textContent = node.node || node.root;
    parent.appendChild(label);
    
    // Draw children and edges for all children
    if (node.children && node.children.length > 0) {
        let childX = 0;
        
        node.children.forEach((child, i) => {
            const childLayout = layout.childLayouts[i];
            
            // Draw edge to child
            const edge = newElementNS('path', [
                ['d', `M ${layout.centerX} ${y + nodeRadius} L ${childX + childLayout.centerX} ${y + verticalSpacing - nodeRadius}`],
                ['stroke', '#7c3aed'],
                ['stroke-width', '1.5'],
                ['fill', 'none']
            ]);
            parent.appendChild(edge);
            
            // Draw child recursively
            drawNode(parent, child, childX, y + verticalSpacing, childLayout, currentStep, prevStep, level + 1, i, node);
            
            // Update x position for next child
            childX += childLayout.width + layout.spacing;
        });
    }
}

// Helper function to determine if a node should be shown based on the current step
// This function is now handled directly in drawNode
// function shouldShowNode(node, level, currentStep) {
//     return level <= currentStepIndex;
// }

// Helper functions for node coloring also integrated into drawNode
// function isNodeAddedInCurrentStep(node, level, currentStep, prevStep) {
//     return level === currentStepIndex;
// }

// function isNodeAddedInPrevStep(node, level, prevStep) {
//     return level === (currentStepIndex - 1) && currentStepIndex > 0;
// }

// Helper function to determine if a node was added in the current step
function isNodeAddedInCurrentStep(node, level, currentStep, prevStep) {
    // If this is the first step, only the root is new
    if (currentStepIndex === 0) return level === 0;
    
    // For other steps, a node is added in the current step if its level equals the current step index
    return level === currentStepIndex;
}

// Helper function to determine if a node was added in the previous step
function isNodeAddedInPrevStep(node, level, prevStep) {
    // A node is from the previous step if its level matches the previous step index
    return level === (currentStepIndex - 1) && currentStepIndex > 0;
}

// Function to show the ambiguity comparison between derivations
function showAmbiguityComparison() {
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
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
                    <div style="text-align: center; margin-top: 15px; font-size: 0.9rem; color: #6b7280;">
                        Different parse trees lead to different interpretations
                    </div>
                </div>
                <div class="derivation-card">
                    <h3>${derivations[1].description}</h3>
                    <p style="text-align: center; margin: 10px 0;">${derivations[1].steps.map(step => step.result).join(' → ')}</p>
                    <div style="text-align: center; margin-top: 15px; font-size: 0.9rem; color: #6b7280;">
                        Same string, different structure
                    </div>
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

// Helper function to get the parent node of a given node
function getParentNode(node, tree) {
    if (!tree || !tree.children) return null;
    
    for (let i = 0; i < tree.children.length; i++) {
        if (tree.children[i] === node) {
            return tree;
        }
    }
    
    for (let i = 0; i < tree.children.length; i++) {
        const found = getParentNode(node, tree.children[i]);
        if (found) return found;
    }
    
    return null;
}

// Helper function to get the index of a node in the tree
function getNodeIndex(node, tree) {
    if (!tree || !tree.children) return -1;
    
    for (let i = 0; i < tree.children.length; i++) {
        if (tree.children[i] === node) {
            return i;
        }
    }
    
    return -1;
}

// Function to draw the abab parse tree step by step
function drawAbabTree(svg, width, height, rootY) {
    const nodeRadius = 20;
    const verticalSpacing = 70;
    const horizontalSpacing = 100;
    
    // Create a group for the entire tree
    const treeGroup = newElementNS('g', [
        ['transform', `translate(${width/2}, ${rootY})`]
    ]);
    
    // Get derivation type
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const derivation = input.derivations[currentDerivationIndex];
    const isLeftmost = derivation.type === "leftmost";
    
    // Define node positions
    const rootX = 0;
    const rootY0 = 0;
    const leftChildX = -horizontalSpacing;
    const rightChildX = horizontalSpacing;
    const childY = rootY0 + verticalSpacing;
    const leftGrandchildX1 = leftChildX - 50;
    const leftGrandchildX2 = leftChildX + 50;
    const rightGrandchildX1 = rightChildX - 50;
    const rightGrandchildX2 = rightChildX + 50;
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
            drawCircleWithText(treeGroup, leftGrandchildX1, grandchildY, "a", currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, leftGrandchildX2, grandchildY, "b", currentStepIndex === 2 ? "green" : "blue");
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, leftChildX, childY + nodeRadius, leftGrandchildX2, grandchildY - nodeRadius);
        } else {
            // For rightmost: Draw a, b under right S
            drawCircleWithText(treeGroup, rightGrandchildX1, grandchildY, "a", currentStepIndex === 2 ? "green" : "blue");
            drawCircleWithText(treeGroup, rightGrandchildX2, grandchildY, "b", currentStepIndex === 2 ? "green" : "blue");
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX2, grandchildY - nodeRadius);
        }
    }
    
    // Step 3: Draw the final a, b for completing the tree
    if (currentStepIndex >= 3) {
        if (isLeftmost) {
            // For leftmost: Draw a, b under right S
            drawCircleWithText(treeGroup, rightGrandchildX1, grandchildY, "a", currentStepIndex === 3 ? "green" : "purple");
            drawCircleWithText(treeGroup, rightGrandchildX2, grandchildY, "b", currentStepIndex === 3 ? "green" : "purple");
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX1, grandchildY - nodeRadius);
            drawEdge(treeGroup, rightChildX, childY + nodeRadius, rightGrandchildX2, grandchildY - nodeRadius);
        } else {
            // For rightmost: Draw a, b under left S
            drawCircleWithText(treeGroup, leftGrandchildX1, grandchildY, "a", currentStepIndex === 3 ? "green" : "purple");
            drawCircleWithText(treeGroup, leftGrandchildX2, grandchildY, "b", currentStepIndex === 3 ? "green" : "purple");
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
