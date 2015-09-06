%lex
%%

\s+                                /* skip whitespaces */
"IT'S SHOWTIME"                    return 'BEGIN_MAIN'
"YOU HAVE BEEN TERMINATED"         return 'END_MAIN'
\-?[0-9]+                          return 'NUMBER'
"TALK TO THE HAND"                 return 'PRINT'
"@I LIED"                          return 'FALSE'
"@NO PROBLEMO"                     return 'TRUE'
"HEY CHRISTMAS TREE"               return 'DECLARE_INT'
"YOU SET US UP"                    return 'SET_INITIAL_VALUE'
"GET TO THE CHOPPER"               return 'BEGIN_ASSIGN'
"ENOUGH TALK"                      return 'END_ASSIGN'
"HERE IS MY INVITATION"            return 'SET_VALUE'
"GET UP"                           return 'PLUS'
"GET DOWN"                         return 'MINUS'
"YOU'RE FIRED"                     return 'MULTIPLY'
"HE HAD TO SPLIT"                  return 'DIVIDE'
"I LET HIM GO"                     return 'MODULO'
"YOU ARE NOT YOU YOU ARE ME"       return 'EQUAL'
"LET OFF SOME STEAM BENNET"        return 'GREATER'
"CONSIDER THAT A DIVORCE"          return 'OR'
"KNOCK KNOCK"                      return 'AND'

"BECAUSE I'M GOING TO SAY PLEASE"  return 'IF'
"BULLSHIT"                         return 'ELSE'
"YOU HAVE NO RESPECT FOR LOGIC"    return 'END_IF'

"STICK AROUND"                     return 'WHILE'
"CHILL"                            return 'END_WHILE'

"LISTEN TO ME VERY CAREFULLY"      return 'METHOD_DECLARATION'
"I NEED YOUR CLOTHES YOUR BOOTS AND YOUR MOTORCYCLE" return 'ARG_DECLARATION'
"GIVE THESE PEOPLE AIR"            return 'NON_VOID_METHOD'
"HASTA LA VISTA, BABY"             return 'END_METHOD_DECLARATION'
"DO IT NOW"                        return 'CALL_METHOD'
"I'LL BE BACK"                     return 'RETURN'

"GET YOUR ASS TO MARS"             return 'ASSIGN_FROM_CALL'

[a-zA-Z0-9_][a-zA-Z0-9_\.]*        return 'VARIABLE'

\"(?:[^"\\]|\\.)*\"                return 'STRING_LITTERAL'

<<EOF>>                            return 'EOF'

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
	: METHOD_DECLARATION variable arguments_declared non_void statements END_METHOD_DECLARATION
		{ $$ = new yy.MethodDeclarationExpression(@1.first_line, @1.first_column, $2, $3, $5, @6.first_line, @6.first_column); }
	;

arguments_declared
	: arguments_declared argument_declared
		{ $$ = $1.concat($2) }
	|
		{ $$ = []; }
	;

argument_declared
	: ARG_DECLARATION variable
    { $$ = new yy.ArgumentDeclarationExpression(@1.first_line, @1.first_column, $2); }
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
	| DECLARE_INT variable SET_INITIAL_VALUE integer
		{ $$ = new yy.IntDeclarationExpression(@1.first_line, @1.first_column, $2, $4); }
	| BEGIN_ASSIGN variable SET_VALUE integer END_ASSIGN
		{ $$ = new yy.AssignementExpression(@1.first_line, @1.first_column, $2, $4, []);}

	| BEGIN_ASSIGN variable SET_VALUE integer ops END_ASSIGN
		{ $$ = new yy.AssignementExpression(@1.first_line, @1.first_column, $2, $4, $5);}
	| IF integer statements END_IF
		{ $$ = new yy.IfExpression(@1.first_line, @1.first_column, $2, $3, [], @4.first_line, @4.first_column); }
	| IF integer statements else statements END_IF
		{ $$ = new yy.IfExpression(@1.first_line, @1.first_column, $2, $3, $5, @6.first_line, @6.first_column, $4); }
	| WHILE variable statements END_WHILE
		{ $$ = new yy.WhileExpression(@1.first_line, @1.first_column, $2, $3, @4.first_line, @4.first_column); }
	| method_call
		{ $$ = $1; }
	| ASSIGN_FROM_CALL variable method_call
		{ $$ = new yy.AssignementFromCallExpression(@1.first_line, @1.first_column, $2, $3); }
	| RETURN integer
		{ $$ = new yy.ReturnExpression(@1.first_line, @1.first_column, $2); }
	;

method_call
	: CALL_METHOD variable arguments
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
		{ $$ = new yy.IntegerLike(@1.first_line, @1.first_column, $1); }
	| variable
	| boolean
  | string
	;

variable
  : VARIABLE
		{ $$ = new yy.IntegerLike(@1.first_line, @1.first_column, $1); }
  ;

boolean
	: FALSE
		{ $$ = new yy.IntegerLike(@1.first_line, @1.first_column, 'false'); }
	| TRUE
		{ $$ = new yy.IntegerLike(@1.first_line, @1.first_column, 'true'); }
	;

string
  : STRING_LITTERAL
		{ $$ = new yy.IntegerLike(@1.first_line, @1.first_column, $1); }
  ;

ops
	: ops op
		{ $$ = $1.concat($2); }
	| op
		{ $$ = [$1]; }
	;

op
	: PLUS integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' + ', $2); }
	| MINUS integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' - ', $2); }
	| MULTIPLY integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' * ', $2); }
	| DIVIDE integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' / ', $2); }
	| MODULO integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' % ', $2); }
	| EQUAL integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' == ', $2); }
	| GREATER integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' > ', $2); }
	| OR integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' || ', $2); }
	| AND integer
    { $$ = new yy.Operation(@1.first_line, @1.first_column, ' && ', $2); }
	;

%%


