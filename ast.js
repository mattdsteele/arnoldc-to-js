var sourceMap = require('source-map'),
  SourceNode = sourceMap.SourceNode;

//Helper functions

function getIndentStr (level) {
	var indentStr = '';
	for (var i = 0; i < level; i++) {
		indentStr += '    ';
	}
	return indentStr;
}

function indentNode(level) {
  return new SourceNode(null, null, null, getIndentStr(level));
}

//Base 'class'

var AstNode = function(line, column) {
  this.line = line;
  this.column = column;
};

AstNode.prototype._sn = function(indent, fileName, chunk) {
  return new SourceNode(this.line, this.column, fileName, '')
    .add(indentNode(indent))
    .add(chunk)
};

//Keywords/Expressions

function PrintExpression (line, column, value) {
  AstNode.call(this, line, column);
	this.value = value;
}
PrintExpression.prototype = Object.create(AstNode.prototype);
PrintExpression.prototype.compile = function(indent, fileName) {
	var blob = 'console.log( '+ this.value + ' );\n';
  return this._sn(indent, fileName, blob);
};

function IntDeclarationExpression (line, column, name, value) {
  AstNode.call(this, line, column);
	this.name = name;
	this.value = value;
}
IntDeclarationExpression.prototype = Object.create(AstNode.prototype);
IntDeclarationExpression.prototype.compile = function(indent, fileName) {
  var node = this._sn(indent, fileName, '');
  var val = this.value.compile ? this.value.compile(0, fileName) : this.value;
  node.add('var ' + this.name + ' = ');
  node.add(val);
  return node.add(';\n');
};

//TODO nodeify this
function AssignementExpression (line, column, name, initialValue, operations) {
  AstNode.call(this, line, column);
	this.name = name;
	this.initialValue = initialValue;
	this.operations = operations;
}
AssignementExpression.prototype = Object.create(AstNode.prototype);
AssignementExpression.prototype.compile = function(indent, fileName) {
  var node = this._sn(indent, fileName, 'var ' + this.name + ' = parseInt(');

	if (this.operations && this.operations.length > 0) {
		var operationsStr = this.initialValue;

		this.operations.forEach(function (operation) {
			operationsStr = '(' + operationsStr + operation + ')';
		});

		node.add(operationsStr +');\n');
	} else {
		node.add(this.initialValue + ');\n');
	}

	return node;
};

function IfExpression (line, column, predicate, ifStatements, elseStatements) {
  AstNode.call(this, line, column);
	this.predicate = predicate;
	this.ifStatements = ifStatements;
	this.elseStatements = elseStatements;
}
IfExpression.prototype = Object.create(AstNode.prototype);
IfExpression.prototype.compile = function(indent, fileName) {
  var expr = this._sn(indent, fileName, 'if (' + this.predicate + ') { \n');
	//var code = getIndentStr(indent) + 'if ('+ this.predicate + ') { \n';

	expr.add(this.ifStatements.map(function (node) {
		return node.compile(indent + 1, fileName);
  }));

	expr.add(getIndentStr(indent) + '} \n');

	if (this.elseStatements && this.elseStatements.length > 0) {
		expr.add(getIndentStr(indent) + 'else { \n')
    .add(this.elseStatements.map(function (node) {
			return node.compile(indent+1, fileName);
    }));
		expr.add(getIndentStr(indent) + '}\n');
	}
	return expr;
};

function WhileExpression (line, column, predicate, whileStatements) {
  AstNode.call(this, line, column);
	this.predicate = predicate;
	this.whileStatements = whileStatements;
}
WhileExpression.prototype = Object.create(AstNode.prototype);
WhileExpression.prototype.compile = function(indent, fileName) {
  var node = this._sn(indent, fileName, 'while (' + this.predicate + ') {\n');
	node.add(this.whileStatements.map(function (statement) {
		return statement.compile(indent + 1, fileName);
  }));

	node.add(getIndentStr(indent) + '}\n');

	return node;
};


function MethodDeclarationExpression (line, column, name, arguments, innerStatements) {
  AstNode.call(this, line, column);
	this.name = name;
	this.arguments = arguments;
	this.innerStatements = innerStatements;
}

MethodDeclarationExpression.prototype = Object.create(AstNode.prototype);
MethodDeclarationExpression.prototype.compile = function(indent, fileName) {
  return mainNode = this._sn(indent, fileName, '')
    .add('function ' + this.name + ' ('+ this.arguments.join(', ') +') {\n')
    .add(this.innerStatements.map(function(statement) {
      return statement.compile(indent + 1, fileName);
    }))
    .add(indentNode(indent))
    .add('}\n');
};

function CallExpression (name, arguments) {
	this.name = name;
	this.arguments = arguments;
}

CallExpression.prototype.compile = function(indent, fileName) {
	return getIndentStr(indent) + this.name + '(' + this.arguments.join(', ') + ');\n';
};

function ReturnExpression (value) {
	this.value = value;
}

ReturnExpression.prototype.compile = function(indent, fileName) {
	return getIndentStr(indent) + 'return ' + this.value + ';\n';
};

function Bool(line, column, boolVal) {
  AstNode.call(this, line, column);
  this.boolVal = boolVal;
}
Bool.prototype = Object.create(AstNode.prototype);
Bool.prototype.compile = function(indent, fileName) {
  return this._sn(indent, fileName, this.boolVal);
};

function AssignementFromCallExpression (name, functionCalled) {
	this.name = name;
	this.functionCalled = functionCalled;
}

AssignementFromCallExpression.prototype.compile = function(indent, fileName) {
	return getIndentStr(indent) + 'var ' + this.name + ' = ' + this.functionCalled.compile(0, fileName);
};

function MainExpression (statements, line, column, endLine, endColumn) {
  AstNode.call(this, line, column);
	this.statements = statements;
  this.endLine = endLine;
  this.endColumn = endColumn;
}
MainExpression.prototype = Object.create(AstNode.prototype);
MainExpression.prototype.compile = function(indent, fileName) {
  return this._sn(indent, fileName, '(function() {\n')
    .add(this.statements.map(function (child) {
      return child.compile(indent + 1, fileName);
    }))
    .add(indentNode(indent))
    .add(new SourceNode(this.endLine, this.endColumn, fileName, '}());\n'));
};

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
  Bool: Bool,
  MainExpression: MainExpression
};

module.exports = yy;
