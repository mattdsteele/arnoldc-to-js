%lex
%%

\s+ 													/* skip whitespaces */
"IT'S SHOWTIME"											return 'BEGIN_MAIN'
"YOU HAVE BEEN TERMINATED"								return 'END_MAIN'
\-?[0-9]+ 												return 'NUMBER'
"TALK TO THE HAND"										return 'PRINT'
"@I LIED"												return 'FALSE'
"@NO PROBLEMO"											return 'TRUE'
"HEY CHRISTMAS TREE"									return 'DECLARE_INT'
"YOU SET US UP"											return 'SET_INITIAL_VALUE'
"GET TO THE CHOPPER"									return 'BEGIN_ASSIGN'
"ENOUGH TALK"											return 'END_ASSIGN'
"HERE IS MY INVITATION"									return 'SET_VALUE'
"GET UP"												return 'PLUS'
"GET DOWN"												return 'MINUS'
"YOU'RE FIRED"											return 'MULTIPLY'
"HE HAD TO SPLIT"										return 'DIVIDE'
"I LET HIM GO"											return 'MODULO'
"YOU ARE NOT YOU YOU ARE ME"							return 'EQUAL'
"LET OFF SOME STEAM BENNET" 							return 'GREATER'
"CONSIDER THAT A DIVORCE"								return 'OR'
"KNOCK KNOCK"											return 'AND'

"BECAUSE I'M GOING TO SAY PLEASE"						return 'IF'
"BULLSHIT"												return 'ELSE'
"YOU HAVE NO RESPECT FOR LOGIC"							return 'END_IF'

"STICK AROUND"											return 'WHILE'
"CHILL"													return 'END_WHILE'

"LISTEN TO ME VERY CAREFULLY"							return 'METHOD_DECLARATION'
"I NEED YOUR CLOTHES YOUR BOOTS AND YOUR MOTORCYCLE"	return 'ARG_DECLARATION'
"GIVE THESE PEOPLE AIR"									return 'NON_VOID_METHOD'
"HASTA LA VISTA, BABY"									return 'END_METHOD_DECLARATION'
"DO IT NOW"												return 'CALL_METHOD'
"I'LL BE BACK"											return 'RETURN'

"GET YOUR ASS TO MARS"									return 'ASSIGN_FROM_CALL'

[a-zA-Z0-9_]+											return 'VARIABLE'

\"(?:[^"\\]|\\.)*\"										return 'STRING_LITTERAL'

<<EOF>> 												return 'EOF'

/lex

%start program
%% /* language grammar */

program
	: methods BEGIN_MAIN statements END_MAIN methods EOF
		{ return $1.concat($5).concat(new yy.MainExpression($3, @2.first_line, @2.first_column, @4.first_line, @4.first_column)); }
	;

methods
	: methods method
		{ $$ = $1.concat($2); }
	|
		{ $$ = []; }
	;

method
	: METHOD_DECLARATION VARIABLE arguments_declared non_void statements END_METHOD_DECLARATION
		{ $$ = new yy.MethodDeclarationExpression(@1.first_line, @1.first_column, $2, $3, $5); }
	;

arguments_declared
	: arguments_declared argument_declared
		{ $$ = $1.concat($2) }
	|
		{ $$ = []; }
	;

argument_declared
	: ARG_DECLARATION VARIABLE
		{ $$ = $2; }
	;

non_void
	: NON_VOID_METHOD
	|
	;

statements
	: statements statement
		{ $$ = $1.concat($2); }
	|
		{ $$ = []; }
	;

statement
	: PRINT integer
		{ $$ = new yy.PrintExpression(@1.first_line, @1.first_column, $2); }
	| PRINT STRING_LITTERAL
		{ $$ = new yy.PrintExpression(@1.first_line, @1.first_column, $2); }
	| DECLARE_INT VARIABLE SET_INITIAL_VALUE integer
		{ $$ = new yy.IntDeclarationExpression(@1.first_line, @1.first_column, $2, $4); }
	| BEGIN_ASSIGN VARIABLE SET_VALUE integer END_ASSIGN
		{ $$ = new yy.AssignementExpression(@1.first_line, @1.first_column, $2, $4, []);}

	| BEGIN_ASSIGN VARIABLE SET_VALUE integer ops END_ASSIGN
		{ $$ = new yy.AssignementExpression(@1.first_line, @1.first_column, $2, $4, $5);}
	| IF integer statements END_IF
		{ $$ = new yy.IfExpression(@1.first_line, @1.first_column, $2, $3, [], @4.first_line, @4.first_column); }
	| IF integer statements else statements END_IF
		{ $$ = new yy.IfExpression(@1.first_line, @1.first_column, $2, $3, $5, @6.first_line, @6.first_column, $4); }
	| WHILE VARIABLE statements END_WHILE
		{ $$ = new yy.WhileExpression(@1.first_line, @1.first_column, $2, $3); }
	| method_call
		{ $$ = $1; }
	| ASSIGN_FROM_CALL VARIABLE method_call
		{ $$ = new yy.AssignementFromCallExpression(@1.first_line, @1.first_column, $2, $3); }
	| RETURN integer
		{ $$ = new yy.ReturnExpression($2); }
	;

method_call
	: CALL_METHOD VARIABLE arguments
		{ $$ = new yy.CallExpression(@1.first_line, @1.first_column, $2, $3); }
	;

arguments
	: arguments integer
		{ $$ = $1.concat($2); }
	|
		{ $$ = []; }
	;

else
  : ELSE
    { $$ = new yy.ElseNode(@1.first_line, @1.first_column); }
  ;

integer
	: NUMBER
	| VARIABLE
	| boolean
	;

boolean
	: FALSE
		{ $$ = new yy.Bool(@1.first_line, @1.first_column, 'false'); }
	| TRUE
		{ $$ = new yy.Bool(@1.first_line, @1.first_column, 'true'); }
	;

ops
	: ops op
		{ $$ = $1.concat($2); }
	| op
		{ $$ = [$1]; }
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


