/**
 * Ambiguity in CFG example with multiple derivations for the "id+id*id" string
 * Demonstrates how the same string can have multiple parse trees due to ambiguity
 */

function step(result, rule, type = "leftmost") {
    return { result, rule, type };
}

// Grammar for arithmetic expressions with ambiguity
const ambiguousGrammar = {
    "description": "Ambiguous Grammar: E → E + E | E * E | (E) | id",
    "startSymbol": "E",
    "productions": [
        "E → E + E",
        "E → E * E",
        "E → (E)",
        "E → id"
    ],
    "inputs": [
        {
            "string": "id+id*id",
            "derivations": [
                {
                    "description": "Leftmost Derivation (+ has higher precedence)",
                    "type": "leftmost",
                    "steps": [
                        step("E", "Start Symbol", "leftmost"),
                        step("E + E", "E → E + E", "leftmost"),
                        step("id + E", "E → id", "leftmost"),
                        step("id + E * E", "E → E * E", "leftmost"),
                        step("id + id * E", "E → id", "leftmost"),
                        step("id + id * id", "E → id", "leftmost")
                    ]
                },
                {
                    "description": "Rightmost Derivation (* has higher precedence)",
                    "type": "rightmost",
                    "steps": [
                        step("E", "Start Symbol", "rightmost"),
                        step("E * E", "E → E * E", "rightmost"),
                        step("E + E * E", "E → E + E", "rightmost"),
                        step("E + id * E", "E → id", "rightmost"),
                        step("E + id * id", "E → id", "rightmost"),
                        step("id + id * id", "E → id", "rightmost")
                    ]
                }
            ]
        }
    ]
};

const cfgs = [ambiguousGrammar];
