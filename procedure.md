## Removal of Ambiguity

Ambiguity in CFGs can be removed by modifying the grammar as to ensure that each string has a unique parse tree. Ambiguity can be removed using properties such as precedence and associativity -

**Precedence and Associativity-** 

Precedence determines the order of operations in an expression, where as associativity determines the grouping direction for operations of the same precedence.  Precedence ensures that the expressions are evaluated in a predefined order, which eliminates ambiguity when there are multiple operators in the expression.

Let us consider an ambiguous grammar defined as - 

$$
E → E + E \ | \ E * E \  | \ (E) \ | \ id
$$

If we consider the expression ‘$1 + 3 * 5$’, the grammar may generate ambiguous parse trees, as it unclear which operation to perform first without precedence and associativity rules. If we introduce precedence and associativity rules, for example -

$$
E → E + T \ | \ T \\ T → T * K \ | \ K \\ K → (E) \ | \ id
$$

Here, the operator ‘*’ is given a higher precedence, and both the operators are left-associative. The introduction of these rules ensured that multiplication is performed first, which ultimately results in the production of an unambiguous parse tree.