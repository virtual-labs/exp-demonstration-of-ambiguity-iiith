/****
 * Helper functions for CFG and Ambiguity visualization
 *
 */

function newElementNS(tag, attr) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    attr.forEach(function (item) {
        elem.setAttribute(item[0], item[1]);
    });
    return elem;
}

function newElement(tag, attr) {
    const elem = document.createElement(tag);
    attr.forEach(function (item) {
        elem.setAttribute(item[0], item[1]);
    });
    return elem;
}

function clearElem(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.lastChild);
    }
}

function drawDerivationTree(canvas, derivationStep, width = 600, height = 300) {
    clearElem(canvas);

    const symbols = derivationStep.split(/\s+/);
    const centerX = width / 2;
    const startY = 30;
    const levelHeight = 80;
    const baseRadius = 20;
    const charWidth = 7;
    const padding = 8;

    // Calculate node positions and sizes
    const nodes = symbols.map((symbol, i) => {
        const level = Math.floor(Math.log2(i + 1));
        const posInLevel = i + 1 - Math.pow(2, level);
        const x = centerX + (posInLevel - (Math.pow(2, level) - 1) / 2) * (width / (Math.pow(2, level) + 1));
        const y = startY + level * levelHeight;
        const radius = Math.max(baseRadius, (symbol.length * charWidth) / 2 + padding);

        return { x, y, radius, symbol };
    });

    // Draw connections first (so nodes appear on top)
    nodes.forEach((node, i) => {
        if (i > 0) {
            const parent = nodes[Math.floor((i - 1) / 2)];
            const line = newElementNS("line", [
                ["x1", parent.x],
                ["y1", parent.y + parent.radius],
                ["x2", node.x],
                ["y2", node.y - node.radius],
                ["stroke", "#ccc"],
                ["stroke-width", "2"]
            ]);
            canvas.appendChild(line);
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        const circle = newElementNS("circle", [
            ["cx", node.x],
            ["cy", node.y],
            ["r", node.radius],
            ["fill", "#29e"],
            ["stroke", "#fff"],
            ["stroke-width", "2"],
            ["class", "tree-node"]
        ]);
        canvas.appendChild(circle);

        const text = newElementNS("text", [
            ["x", node.x],
            ["y", node.y + 5],
            ["text-anchor", "middle"],
            ["fill", "#fff"],
            ["font-size", "14px"],
            ["font-family", "monospace"],
            ["class", "tree-node-text"]
        ]);
        text.textContent = node.symbol;
        canvas.appendChild(text);
    });
}

function displayProductionRules(container, productions) {
    clearElem(container);

    const title = newElement("h3", [
        ["class", "is-size-5"],
        ["style", "margin-bottom: 10px;"]
    ]);
    title.textContent = "Production Rules:";
    container.appendChild(title);

    const rulesDiv = newElement("div", [
        ["class", "production-rules-box"]
    ]);

    productions.forEach(rule => {
        const ruleElem = newElement("div", [
            ["class", "production-rule"]
        ]);
        ruleElem.textContent = rule;
        rulesDiv.appendChild(ruleElem);
    });

    container.appendChild(rulesDiv);
}

function displayAmbiguityWarning(container, count) {
    const warning = newElement("div", [
        ["class", "ambiguous-grammar-warning"]
    ]);
    // warning.innerHTML = `⚠️ This grammar is ambiguous. Found ${count} different parse trees for this input.`;
    // container.appendChild(warning);
}

function displayDerivationType(container, type, description) {
    clearElem(container);

    const typeElem = newElement("div", [
        ["class", "derivation-type"]
    ]);
    typeElem.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Derivation: ${description}`;
    container.appendChild(typeElem);
}

function displayDerivationTabs(container, derivations, currentIndex, callback) {
    clearElem(container);

    const tabsContainer = newElement("div", [
        ["class", "derivation-tabs"]
    ]);

    derivations.forEach((derivation, index) => {
        const tab = newElement("div", [
            ["class", `derivation-tab ${index === currentIndex ? 'active' : ''}`]
        ]);
        tab.textContent = `Derivation ${index + 1}`;
        tab.onclick = () => callback(index);
        tabsContainer.appendChild(tab);
    });

    container.appendChild(tabsContainer);
}

function showCompletionAlert(inputString, finalDerivation) {
    const derivedString = finalDerivation.replace(/[A-Z]/g, '');
    const isCompleteDerivation = derivedString === inputString;

    swal({
        text: isCompleteDerivation
            ? "The Input String was successfully derived from the Grammar."
            : `The Derivation did not match the Input String.\n\nDerived: "${derivedString}"\nExpected: "${inputString}"`,
        icon: isCompleteDerivation ? "success" : "info",
        button: "OK"
    });
}