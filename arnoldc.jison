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

"STICK AROUND"						return 'WHILE'
"CHILL"								return 'END_WHILE'

"LISTEN TO ME VERY CAREFULLY"			return 'METHOD_DECLARATION'
"I NEED YOUR CLOTHES YOUR BOOTS AND YOUR MOTORCYCLE"	return 'ARG_DECLARATION'
"GIVE THESE PEOPLE AIR"				return 'END_ARG_DECLARATION'
"HASTA LA VISTA, BABY"				return 'END_METHOD_DECLARATION'
"DO IT NOW"							return 'CALL_METHOD'


[a-zA-Z]+							return 'VARIABLE'

\"(?:[^"\\]|\\.)*\"					return 'STRING_LITTERAL'

<<EOF>> 							return 'EOF'

/lex

%start program
%% /* language grammar */

program
	: methods BEGIN_MAIN statements END_MAIN methods EOF
		{ return $1.concat($5).concat(new MainExpression($3)); }
	;

methods
	: methods method
		{ $$ = $1.concat($2); }
	|
		{ $$ = []; }
	;

method
	: METHOD_DECLARATION VARIABLE statements END_METHOD_DECLARATION
		{ $$ = new MethodDeclarationExpression($2, $3); }
	;

statements
	: statements statement
		{ $$ = $1.concat($2); }
	|
		{ $$ = []; }
	;

statement
	: PRINT integer
		{ $$ = new PrintExpression($2); }
	| PRINT STRING_LITTERAL
		{ $$ = new PrintExpression($2); }
	| DECLARE_INT VARIABLE SET_INITIAL_VALUE integer
		{ $$ = new IntDeclarationExpression($2, $4); }
	| BEGIN_ASSIGN VARIABLE SET_VALUE integer ops END_ASSIGN
		{ $$ = new AssignementExpression($2, $4, $5);}
	| IF integer statements END_IF
		{ $$ = new IfExpression($2, $3); }
	| IF integer statements ELSE statements END_IF
		{ $$ = new IfExpression($2, $3, $5); }
	| WHILE VARIABLE statements END_WHILE
		{ $$ = new WhileExpression($2, $3); }
	| CALL_METHOD VARIABLE
		{ $$ = new CallExpression($2); }
	;

ops
	: ops op
		{ $$ = $1.concat($2); }
	| op
		{ $$ = [$1]; }
	;

integer
	: NUMBER
	| VARIABLE
	;

op
	: PLUS integer
		{ $$ = ' + ' + $2; }
	| MINUS integer
		{ $$ = ' - ' + $2; }
	| MULTIPLY integer
		{ $$ = ' * ' + $2; }
	| DIVIDE integer
		{ $$ = ' / ' + $2; }
	| MODULO integer
		{ $$ = ' % ' + $2; }
	| EQUAL integer
		{ $$ = ' == ' + $2; }
	| GREATER integer
		{ $$ = ' > ' + $2; }
	| OR integer
		{ $$ = ' || ' + $2; }
	| AND integer
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

function WhileExpression (predicate, whileStatements) {
	this.type = 'WhileExpression';
	this.predicate = predicate;
	this.whileStatements = whileStatements;
}

function MethodDeclarationExpression (name, innerStatements) {
	this.type = 'MethodDeclarationExpression';
	this.name = name;
	this.innerStatements = innerStatements;
}

function CallExpression (name) {
	this.type = 'CallExpression';
	this.name = name;
}