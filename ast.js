function PrintExpression (line, column, value) {
	this.type = 'PrintExpression';
  this.line = line;
  this.column = column;
	this.value = value;
}

function IntDeclarationExpression (line, column, name, value) {
	this.type = 'IntDeclarationExpression';
	this.name = name;
	this.value = value;
  this.line = line;
  this.column = column;
  console.log('delcaring int', line, column, name, value);
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

function MethodDeclarationExpression (line, column, name, arguments, innerStatements) {
	this.type = 'MethodDeclarationExpression';
	this.name = name;
	this.arguments = arguments;
	this.innerStatements = innerStatements;
  this.line = line;
  this.column = column;
}

function CallExpression (name, arguments) {
	this.type = 'CallExpression';
	this.name = name;
	this.arguments = arguments;
}

function ReturnExpression (value) {
	this.type = 'ReturnExpression';
	this.value = value;
}

function False(line, column) {
  this.type = 'FalseKeyword';
  this.line = line;
  this.column = column;
}

function True(line, column) {
  this.type = 'TrueKeyword';
  this.line = line;
  this.column = column;
}

function AssignementFromCallExpression (name, functionCalled) {
	this.type = 'AssignementFromCallExpression';
	this.name = name;
	this.functionCalled = functionCalled;
}
function MainExpression (statements, startLine, startColumn, endLine, endColumn) {
	this.type = 'MainExpression';
	this.statements = statements;
  this.line = startLine;
  this.column = startColumn;
  this.endLine = endLine;
  this.endColumn = endColumn;
}
var yy = {
  PrintExpression: PrintExpression,
  IntDeclarationExpression: IntDeclarationExpression,
  AssignementExpression: AssignementExpression,
  IfExpression: IfExpression,
  WhileExpression: WhileExpression,
  MethodDeclarationExpression: MethodDeclarationExpression,
  CallExpression: CallExpression,
  ReturnExpression: ReturnExpression,
  AssignementFromCallExpression: AssignementFromCallExpression,
  False: False,
  True: True,
  MainExpression: MainExpression
};

module.exports = yy;
