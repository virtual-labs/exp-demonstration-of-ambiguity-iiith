## Step 1: Understanding the Interface

The simulation interface consists of three main sections:
- **CFG Controls**: Contains buttons to navigate through the experiment
- **Working Area**: Displays the current grammar, input string, derivation steps, and parse tree
- **Derivation Steps**: Shows the step-by-step derivation process

## Step 2: Exploring Different Grammars

1. **Start with the default grammar**: The simulation begins with an ambiguous arithmetic expression grammar:
   ```
   E → E + E | E * E | (E) | id
   ```

2. **Click "Change Grammar"** to cycle through different ambiguous grammar examples:
   - **Grammar 1**: Arithmetic expressions with ambiguous operator precedence
   - **Grammar 2**: String concatenation grammar (S → SS | ab | ba)
   - **Grammar 3**: Classic if-then-else ambiguity problem

## Step 3: Analyzing Derivations

1. **Observe the input string** displayed in the working area
2. **Use "Next Step"** to advance through the leftmost derivation
3. **Use "Previous Step"** to go back and review previous derivation steps
4. **Watch the parse tree** update dynamically as you progress through the derivation

## Step 4: Comparing Multiple Derivations

1. **Complete one derivation** by clicking "Next Step" until you reach the final string
2. **Change to the alternative derivation** (the simulation automatically switches between different possible derivations for the same string)
3. **Compare the different parse trees** generated for the same input string
4. **Note the differences** in the derivation steps and resulting tree structures

## Step 5: Understanding Ambiguity

1. **Identify why each grammar is ambiguous** by observing multiple valid derivations
2. **Analyze the practical implications** of each type of ambiguity:
   - **Arithmetic expressions**: Different operator precedence interpretations
   - **String concatenation**: Different grouping possibilities
   - **If-then-else**: Dangling else problem

## Step 6: Key Observations

While using the simulation, pay attention to:
- How the same input string can have multiple leftmost derivations
- How different derivations lead to different parse tree structures
- The step-by-step process of applying production rules
- The visual representation of ambiguity through parse trees

## Learning Outcomes

By completing this procedure, you will:
- Understand what makes a grammar ambiguous
- Visualize how ambiguity manifests in parse trees
- Recognize common patterns of ambiguity in programming languages
- Appreciate the importance of resolving ambiguity in compiler design