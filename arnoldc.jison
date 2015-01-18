%lex
%%

\s+ 							/* skip whitespaces */
"IT'S SHOWTIME"						return 'BEGIN_MAIN'
"YOU HAVE BEEN TERMINATED"			return 'END_MAIN'
[0-9]+ 								return 'NUMBER'
"TALK TO THE HAND"					return 'PRINT'
"HEY CHRISTMAS TREE"				return 'DECLARE_INT'
"YOU SET US UP"						return 'SET_INITIAL_VALUE'
"GET TO THE CHOPPER"				return 'BEGIN_ASSIGN'
"ENOUGH TALK"						return 'END_ASSIGN'
"HERE IS MY INVITATION"				return 'SET_VALUE'
"GET UP"							return 'PLUS'
"GET DOWN"							return 'MINUS'
"YOU'RE FIRED"						return 'MULTIPLY'
"HE HAD TO SPLIT"					return 'DIVIDE'
"I LET HIM GO"						return 'MODULO'
"YOU ARE NOT YOU YOU ARE ME"		return 'EQUAL'
"LET OFF SOME STEAM BENNET" 		return 'GREATER'
"CONSIDER THAT A DIVORCE"			return 'OR'
"KNOCK KNOCK"						return 'AND'

"BECAUSE I'M GOING TO SAY PLEASE"	return 'IF'
"BULLSHIT"							return 'ELSE'
"YOU HAVE NO RESPECT FOR LOGIC"		return 'END_IF'

[a-zA-Z]+							return 'VARIABLE'

\"(?:[^"\\]|\\.)*\"					return 'STRING_LITTERAL'

<<EOF>> 							return 'EOF'

/lex

%start program
%% /* language grammar */

program
	: BEGIN_MAIN statements END_MAIN EOF
		{ return new MainExpression($2); }
	;

statements
	: statements statement
		{ $$ = $1.concat($2); }
	|
		{ $$ = []; }
	;

statement
	: PRINT NUMBER
		{ $$ = new PrintExpression($2); }
	| PRINT VARIABLE
		{ $$ = new PrintExpression($2); }
	| PRINT STRING_LITTERAL
		{ $$ = new PrintExpression($2); }
	| DECLARE_INT VARIABLE SET_INITIAL_VALUE NUMBER
		{ $$ = new IntDeclarationExpression($2, $4); }
	| BEGIN_ASSIGN VARIABLE SET_VALUE NUMBER ops END_ASSIGN
		{ $$ = new AssignementExpression($2, $4, $5);}
	| IF NUMBER statements END_IF
		{ $$ = new IfExpression($2, $3); }
	| IF NUMBER statements ELSE statements END_IF
		{ $$ = new IfExpression($2, $3, $5); }
	;

ops
	: ops op
		{ $$ = $1.concat($2); }
	| op
		{ $$ = [$1]; }
	;

op
	: PLUS NUMBER
		{ $$ = ' + ' + $2; }
	| MINUS NUMBER
		{ $$ = ' - ' + $2; }
	| MULTIPLY NUMBER
		{ $$ = ' * ' + $2; }
	| DIVIDE NUMBER
		{ $$ = ' / ' + $2; }
	| MODULO NUMBER
		{ $$ = ' % ' + $2; }
	| EQUAL NUMBER
		{ $$ = ' == ' + $2; }
	| GREATER NUMBER
		{ $$ = ' > ' + $2; }
	| OR NUMBER
		{ $$ = ' || ' + $2; }
	| AND NUMBER
		{ $$ = ' && ' + $2; }
	;

%%

function MainExpression (statements) {
	this.type = 'MainExpression';
	this.statements = statements;
}

function PrintExpression (value) {
	this.type = 'PrintExpression';
	this.value = value;
}

function IntDeclarationExpression (name, value) {
	this.type = 'IntDeclarationExpression';
	this.name = name;
	this.value = value;
}

function AssignementExpression (name, initialValue, operations) {
	this.type = 'AssignementExpression';
	this.name = name;
	this.initialValue = initialValue;
	this.operations = operations;
}

function IfExpression (predicate, ifStatements, elseStatements) {
	this.type = 'IfExpression';
	this.predicate = predicate;
	this.ifStatements = ifStatements;
	this.elseStatements = elseStatements;
}