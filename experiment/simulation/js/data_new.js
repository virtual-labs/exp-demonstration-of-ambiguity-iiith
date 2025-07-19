/**
 * Ambiguity in CFG example with multiple derivations for the "abab" string
 * Demonstrates how the same string can have multiple parse trees due to ambiguity
 */

function step(result, rule, type = "leftmost") {
    return { result, rule, type };
}

// Grammar for "abab" string with S → SS | ab | ba
const ambiguousGrammar = {
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

const cfgs = [ambiguousGrammar];
