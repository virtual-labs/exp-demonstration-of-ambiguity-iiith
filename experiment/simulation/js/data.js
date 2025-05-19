/****
 * Ambiguous CFG examples with multiple derivations
 *
 */

function step(result, rule, type = "") {
    return { result, rule, type };
}

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
            "string": "id + id * id",
            "derivations": [
                {
                    "description": "Leftmost Derivation 1 (E → E + E first)",
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
                    "description": "Leftmost Derivation 2 (E → E * E first)",
                    "type": "leftmost",
                    "steps": [
                        step("E", "Start Symbol", "leftmost"),
                        step("E * E", "E → E * E", "leftmost"),
                        step("E + E * E", "E → E + E", "leftmost"),
                        step("id + E * E", "E → id", "leftmost"),
                        step("id + id * E", "E → id", "leftmost"),
                        step("id + id * id", "E → id", "leftmost")
                    ]
                }
            ]
        }
    ]
};

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
                    "description": "Leftmost Derivation 1 (S → SS then first S → ab)",
                    "type": "leftmost",
                    "steps": [
                        step("S", "Start Symbol", "leftmost"),
                        step("SS", "S → SS", "leftmost"),
                        step("abS", "S → ab", "leftmost"),
                        step("abab", "S → ab", "leftmost")
                    ]
                },
                {
                    "description": "Leftmost Derivation 2 (S → SS then second S → ab)",
                    "type": "leftmost",
                    "steps": [
                        step("S", "Start Symbol", "leftmost"),
                        step("SS", "S → SS", "leftmost"),
                        step("Sab", "S → ab", "leftmost"),
                        step("abab", "S → ab", "leftmost")
                    ]
                }
            ]
        }
    ]
};

const ambiguousGrammar3 = {
    "description": "Ambiguous Grammar: if-then-else",
    "startSymbol": "S",
    "productions": [
        "S → if E then S",
        "S → if E then S else S",
        "S → other"
    ],
    "inputs": [
        {
            "string": "if E then if E then other else other",
            "derivations": [
                {
                    "description": "Derivation 1 (S -> if E then S else S first)",
                    "type": "leftmost",
                    "steps": [
                        step("S", "Start Symbol", "leftmost"),
                        step("if E then S else S", "S → if E then S else S", "leftmost"),
                        step("if E then if E then S else S", "S → if E then S", "leftmost"),
                        step("if E then if E then other else S", "S → other", "leftmost"),
                        step("if E then if E then other else other", "S → other", "leftmost")
                    ]
                },
                {
                    "description": "Derivation 2 (S -> if E then S first)",
                    "type": "leftmost",
                    "steps": [
                        step("S", "Start Symbol", "leftmost"),
                        step("if E then S", "S → if E then S", "leftmost"),
                        step("if E then if E then S else S", "S → if E then S else S", "leftmost"),
                        step("if E then if E then other else S", "S → other", "leftmost"),
                        step("if E then if E then other else other", "S → other", "leftmost")
                    ]
                }
            ]
        }
    ]
};

const cfgs = [ambiguousGrammar1, ambiguousGrammar2, ambiguousGrammar3];