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
            "string": "id + id * id",
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
                    ],
                    "parseTree": {
                        "root": "E",
                        "children": [
                            {
                                "node": "E",
                                "children": [
                                    {
                                        "node": "id",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "node": "+",
                                "children": []
                            },
                            {
                                "node": "E",
                                "children": [
                                    {
                                        "node": "E",
                                        "children": [
                                            {
                                                "node": "id",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "node": "*",
                                        "children": []
                                    },
                                    {
                                        "node": "E",
                                        "children": [
                                            {
                                                "node": "id",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
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
                    ],
                    "parseTree": {
                        "root": "E",
                        "children": [
                            {
                                "node": "E",
                                "children": [
                                    {
                                        "node": "E",
                                        "children": [
                                            {
                                                "node": "id",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "node": "+",
                                        "children": []
                                    },
                                    {
                                        "node": "E",
                                        "children": [
                                            {
                                                "node": "id",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "node": "*",
                                "children": []
                            },
                            {
                                "node": "E",
                                "children": [
                                    {
                                        "node": "id",
                                        "children": []
                                    }
                                ]
                            }
                        ]
                    }
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
                    "description": "Leftmost Derivation (S → ab first)",
                    "type": "leftmost",
                    "steps": [
                        step("S", "Start Symbol", "leftmost"),
                        step("SS", "S → SS", "leftmost"),
                        step("abS", "S → ab", "leftmost"),
                        step("abab", "S → ab", "leftmost")
                    ],
                    "parseTree": {
                        "root": "S",
                        "children": [
                            {
                                "node": "S",
                                "children": [
                                    {
                                        "node": "a",
                                        "children": []
                                    },
                                    {
                                        "node": "b",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "node": "S",
                                "children": [
                                    {
                                        "node": "a",
                                        "children": []
                                    },
                                    {
                                        "node": "b",
                                        "children": []
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "description": "Rightmost Derivation (S → ab first)",
                    "type": "rightmost",
                    "steps": [
                        step("S", "Start Symbol", "rightmost"),
                        step("SS", "S → SS", "rightmost"),
                        step("Sab", "S → ab", "rightmost"),
                        step("abab", "S → ab", "rightmost")
                    ],
                    "parseTree": {
                        "root": "S",
                        "children": [
                            {
                                "node": "S",
                                "children": [
                                    {
                                        "node": "a",
                                        "children": []
                                    },
                                    {
                                        "node": "b",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "node": "S",
                                "children": [
                                    {
                                        "node": "a",
                                        "children": []
                                    },
                                    {
                                        "node": "b",
                                        "children": []
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};

// Grammar 3: The classic if-then-else ambiguity
const ambiguousGrammar3 = {
    "description": "Ambiguous Grammar: if-then-else statements",
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
                    "description": "Leftmost Derivation (else belongs to outer if)",
                    "type": "leftmost",
                    "steps": [
                        step("S", "Start Symbol", "leftmost"),
                        step("if E then S", "S → if E then S", "leftmost"),
                        step("if E then if E then S", "S → if E then S", "leftmost"),
                        step("if E then if E then other", "S → other", "leftmost")
                    ],
                    "parseTree": {
                        "root": "S",
                        "children": [
                            {
                                "node": "if",
                                "children": []
                            },
                            {
                                "node": "E",
                                "children": []
                            },
                            {
                                "node": "then",
                                "children": []
                            },
                            {
                                "node": "S",
                                "children": [
                                    {
                                        "node": "if",
                                        "children": []
                                    },
                                    {
                                        "node": "E",
                                        "children": []
                                    },
                                    {
                                        "node": "then",
                                        "children": []
                                    },
                                    {
                                        "node": "S",
                                        "children": [
                                            {
                                                "node": "other",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "node": "else",
                                        "children": []
                                    },
                                    {
                                        "node": "S",
                                        "children": [
                                            {
                                                "node": "other",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "description": "Rightmost Derivation (else belongs to inner if)",
                    "type": "rightmost",
                    "steps": [
                        step("S", "Start Symbol", "rightmost"),
                        step("if E then S else S", "S → if E then S else S", "rightmost"),
                        step("if E then if E then S else S", "S → if E then S", "rightmost"),
                        step("if E then if E then other else S", "S → other", "rightmost"),
                        step("if E then if E then other else other", "S → other", "rightmost")
                    ],
                    "parseTree": {
                        "root": "S",
                        "children": [
                            {
                                "node": "if",
                                "children": []
                            },
                            {
                                "node": "E",
                                "children": []
                            },
                            {
                                "node": "then",
                                "children": []
                            },
                            {
                                "node": "S",
                                "children": [
                                    {
                                        "node": "if",
                                        "children": []
                                    },
                                    {
                                        "node": "E",
                                        "children": []
                                    },
                                    {
                                        "node": "then",
                                        "children": []
                                    },
                                    {
                                        "node": "S",
                                        "children": [
                                            {
                                                "node": "other",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "node": "else",
                                "children": []
                            },
                            {
                                "node": "S",
                                "children": [
                                    {
                                        "node": "other",
                                        "children": []
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};

const cfgs = [ambiguousGrammar1, ambiguousGrammar2, ambiguousGrammar3];
