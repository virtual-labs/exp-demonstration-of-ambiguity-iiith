/**
 * Ambiguous CFG examples with multiple derivations for the same input string
 * Demonstrates how the same string can have multiple parse trees due to ambiguity
 */

function step(result, rule, type = "leftmost") {
    return { result, rule, type };
}

// Grammar 1: Arithmetic Expressions with addition and multiplication
const ambiguousGrammar1 = {
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

// Grammar 2: String generation with possible ambiguity
const ambiguousGrammar2 = {
    "description": "Ambiguous Grammar: S → SS | ab | ba",
    "startSymbol": "S",
    "productions": [
        "S → SS",
        "S → ab",
        "S → ba"
    ],
    "inputs": [
        {
            "string": "abab",
            "derivations": [
                {
                    "description": "Leftmost Derivation",
                    "type": "leftmost",
                    "steps": [
                        step("S", "Start Symbol", "leftmost"),
                        step("SS", "S → SS", "leftmost"),
                        step("abS", "S → ab", "leftmost"),
                        step("abab", "S → ab", "leftmost")
                    ]
                },
                {
                    "description": "Rightmost Derivation",
                    "type": "rightmost",
                    "steps": [
                        step("S", "Start Symbol", "rightmost"),
                        step("SS", "S → SS", "rightmost"),
                        step("Sab", "S → ab", "rightmost"),
                        step("abab", "S → ab", "rightmost")
                    ]
                }
            ]
        }
    ]
};

const cfgs = [ambiguousGrammar1, ambiguousGrammar2];
