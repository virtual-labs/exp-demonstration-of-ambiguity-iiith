/*****
 * Main Ambiguity demonstration logic
 *
 */

let currentCfgIndex = 0;
let currentInputIndex = 0;
let currentDerivationIndex = 0;
let currentStepIndex = 0;

function showAmbiguityAlert(inputString, derivations) {
    // Create comparison table HTML
    let comparisonHTML = `
        <div style="text-align: left; margin: 15px 0;">
            <h3 style="color: #d32f2f; margin-bottom: 10px;">Ambiguity Detected for "${inputString}"</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Step</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Derivation 1</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Derivation 2</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Find the maximum steps between both derivations
    const maxSteps = Math.max(derivations[0].steps.length, derivations[1].steps.length);

    // Add rows for each step
    for (let i = 0; i < maxSteps; i++) {
        const step1 = derivations[0].steps[i] || { result: "-", rule: "-" };
        const step2 = derivations[1].steps[i] || { result: "-", rule: "-" };

        comparisonHTML += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${i + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <div><strong>${step1.result}</strong></div>
                    <div style="font-size: 0.8em; color: #666;">${step1.rule}</div>
                </td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <div><strong>${step2.result}</strong></div>
                    <div style="font-size: 0.8em; color: #666;">${step2.rule}</div>
                </td>
            </tr>
        `;
    }

    comparisonHTML += `
                </tbody>
            </table>
            <p style="margin-top: 15px; color: #666;">
                Note: Both derivations produce the same string but with different parse trees.
            </p>
        </div>
    `;

    swal({
        title: "Grammar Ambiguity Demonstrated",
        content: {
            element: "div",
            attributes: {
                innerHTML: comparisonHTML
            }
        },
        className: "ambiguity-alert",
        buttons: {
            confirm: {
                text: "OK",
                value: true,
                visible: true
            }
        }
    });
}

function refreshDisplay() {
    const cfg = cfgs[currentCfgIndex];
    const input = cfg.inputs[currentInputIndex];
    const derivation = input.derivations[currentDerivationIndex];

    // Update grammar description
    const descContainer = document.getElementById("grammar_description_container");
    clearElem(descContainer);
    // const desc = document.createElement("div");
    const descWrapper = newElement("div", [
        ["style", "margin-bottom: 20px;"]
    ]);

    const desc = newElement("div", [
        ["class", "is-size-4"],
        ["style", "font-weight: bold; margin-bottom: 15px;"]
    ]);
    desc.textContent = cfg.description;
    descContainer.appendChild(desc);

    // Show ambiguity warning
    displayAmbiguityWarning(descContainer, input.derivations.length);

    // Update input string
    const inputContainer = document.getElementById("input_container");
    clearElem(inputContainer);
    const inputStr = document.createElement("div");
    inputStr.className = "input-string";
    inputStr.textContent = input.string;
    inputContainer.appendChild(inputStr);

    // Update production rules
    const rulesContainer = document.getElementById("production_rules_container");
    displayProductionRules(rulesContainer, cfg.productions);

    // Update derivation type and description
    const typeContainer = document.getElementById("derivation_type_container");
    displayDerivationType(typeContainer, derivation.type, derivation.description);

    // Update derivation tree
    const treeCanvas = document.getElementById("derivation_tree");
    drawDerivationTree(treeCanvas, derivation.steps[currentStepIndex].result);

    // Update derivation steps
    const stepsList = document.getElementById("derivation_steps_list");
    clearElem(stepsList);

    if (derivation.steps && derivation.steps.length > 0) {
        const fragment = document.createDocumentFragment();

        for (let i = currentStepIndex; i >= 0; i--) {
            const step = derivation.steps[i];
            const stepItem = document.createElement("li");
            stepItem.className = i === currentStepIndex ? "current-step" : "";

            const stepNumber = document.createElement("span");
            stepNumber.className = "step-number";
            stepNumber.textContent = `Step ${i + 1}: `;

            const stepResult = document.createElement("span");
            stepResult.className = "step-result";
            stepResult.textContent = step.result;

            const stepRule = document.createElement("div");
            stepRule.className = "step-rule";
            stepRule.textContent = `Using: ${step.rule}`;

            stepItem.appendChild(stepNumber);
            stepItem.appendChild(stepResult);
            stepItem.appendChild(stepRule);
            fragment.appendChild(stepItem);
        }

        stepsList.appendChild(fragment);
    }

    // Show derivation tabs
    const tabsContainer = newElement("div", [
        ["id", "derivation_tabs_container"],
        ["style", "margin-top: 20px;"]  // Add margin here
    ]);
    // const tabsContainer = document.createElement("div");
    // tabsContainer.id = "derivation_tabs_container";
    descContainer.appendChild(tabsContainer);
    descContainer.appendChild(descWrapper);

    displayDerivationTabs(tabsContainer, input.derivations, currentDerivationIndex, (index) => {
        currentDerivationIndex = index;
        currentStepIndex = 0;
        refreshDisplay();
    });

    // Show appropriate alert when at final step
    if (currentStepIndex === derivation.steps.length - 1) {
        if (input.derivations.length > 1) {
            // Show comparative alert for ambiguous grammars
            showAmbiguityAlert(input.string, input.derivations);
        } else {
            // Show standard completion alert for unambiguous cases
            const derivedString = derivation.steps[currentStepIndex].result.replace(/[A-Z]/g, '');
            const isComplete = derivedString === input.string;

            swal({
                title: isComplete ? "Derivation Complete" : "Mismatch Found",
                text: isComplete
                    ? `Successfully derived "${input.string}"`
                    : `Derived: "${derivedString}"\nExpected: "${input.string}"`,
                icon: isComplete ? "success" : "error",
                buttons: {
                    confirm: {
                        text: "OK",
                        className: "v-button"
                    }
                }
            });
        }
    }
}

window.addEventListener("load", function () {
    refreshDisplay();

    // Change Grammar button
    document.getElementById("change_grammar").addEventListener("click", function () {
        currentCfgIndex = (currentCfgIndex + 1) % cfgs.length;
        currentInputIndex = 0;
        currentDerivationIndex = 0;
        currentStepIndex = 0;
        refreshDisplay();
    });

    // Next Step button
    document.getElementById("next").addEventListener("click", function () {
        const cfg = cfgs[currentCfgIndex];
        const input = cfg.inputs[currentInputIndex];
        const derivation = input.derivations[currentDerivationIndex];

        if (currentStepIndex < derivation.steps.length - 1) {
            currentStepIndex++;
            refreshDisplay();
        }
    });

    // Previous Step button
    document.getElementById("prev").addEventListener("click", function () {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            refreshDisplay();
        }
    });
});