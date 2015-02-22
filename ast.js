var sourceMap = require('source-map'),
  SourceNode = sourceMap.SourceNode;

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

function PrintExpression (line, column, value) {
	this.type = 'PrintExpression';
  this.line = line;
  this.column = column;
	this.value = value;
}

PrintExpression.prototype.compile = function(indent, fileName) {
  var printNode = indentNode(indent);
	var blob = 'console.log( '+ this.value + ' );\n';
  printNode.add(new SourceNode(this.line, this.column, fileName, blob));
  return printNode;
};

function IntDeclarationExpression (line, column, name, value) {
	this.type = 'IntDeclarationExpression';
	this.name = name;
	this.value = value;
  this.line = line;
  this.column = column;
}

IntDeclarationExpression.prototype.compile = function(indent, fileName) {
  var node = new SourceNode(this.line, this.column, fileName, '');
  node.add(indentNode(indent));
  var val = this.value.compile ? this.value.compile() : this.value;
  node.add('var ' + this.name + ' = ');
  node.add(val);
  return node.add(';\n');
};

function AssignementExpression (name, initialValue, operations) {
	this.type = 'AssignementExpression';
	this.name = name;
	this.initialValue = initialValue;
	this.operations = operations;
}

AssignementExpression.prototype.compile = function(indent, fileName) {
	var code = getIndentStr(indent) + 'var ' + this.name + ' = parseInt(';

	if (this.operations && this.operations.length > 0) {
		var operationsStr = this.initialValue;

		this.operations.forEach(function (operation) {
			operationsStr = '(' + operationsStr + operation + ')';
		});

		code += operationsStr +');\n';
	} else {
		code +=  this.initialValue + ');\n';
	}

	return code;
};

function IfExpression (predicate, ifStatements, elseStatements) {
	this.type = 'IfExpression';
	this.predicate = predicate;
	this.ifStatements = ifStatements;
	this.elseStatements = elseStatements;
}

IfExpression.prototype.compile = function(indent, fileName) {
	var code = getIndentStr(indent) + 'if ('+ this.predicate + ') { \n';

	code += this.ifStatements.map(function (node) {
		return node.compile(indent + 1, fileName);
	}).reduce(function (block, line) {
		return block + line;
	}, '');

	code += getIndentStr(indent) + '} \n';

	if (this.elseStatements && this.elseStatements.length > 0) {
		code += getIndentStr(indent) + 'else { \n';
		code += this.elseStatements.map(function (node) {
			return node.compile(indent+1, fileName);
		}).reduce(function (block, line) {
			return block + line;
		}, '');
		code += getIndentStr(indent) + '}\n';
	}

	return code;
};

function WhileExpression (predicate, whileStatements) {
	this.type = 'WhileExpression';
	this.predicate = predicate;
	this.whileStatements = whileStatements;
}

WhileExpression.prototype.compile = function(indent, fileName) {
	var code = getIndentStr(indent) + 'while (' + this.predicate + ') {\n';

	code += this.whileStatements.map(function (node) {
		return node.compile(indent + 1, fileName);
	}).reduce(function (block, line) {
		return block + line;
	}, '');

	code += getIndentStr(indent) + '}\n';

	return code;
};


function MethodDeclarationExpression (line, column, name, arguments, innerStatements) {
	this.type = 'MethodDeclarationExpression';
	this.name = name;
	this.arguments = arguments;
	this.innerStatements = innerStatements;
  this.line = line;
  this.column = column;
}

MethodDeclarationExpression.prototype.compile = function(indent, fileName) {
  var mainNode = new SourceNode(this.line, this.column, fileName, '');
  mainNode.add(indentNode(indent));
	var code = 'function ' + this.name + ' ('+ this.arguments.join(', ') +') {\n';
  mainNode.add(code);
  mainNode.add(this.innerStatements.map(function(statement) {
    return statement.compile(indent + 1, fileName);
  }));

  mainNode.add(indentNode(indent));
  mainNode.add('}\n');

	return mainNode;
};

function CallExpression (name, arguments) {
	this.type = 'CallExpression';
	this.name = name;
	this.arguments = arguments;
}

CallExpression.prototype.compile = function(indent, fileName) {
	return getIndentStr(indent) + this.name + '(' + this.arguments.join(', ') + ');\n';
};

function ReturnExpression (value) {
	this.type = 'ReturnExpression';
	this.value = value;
}

ReturnExpression.prototype.compile = function(indent, fileName) {
	return getIndentStr(indent) + 'return ' + this.value + ';\n';
};

function False(line, column) {
  this.type = 'FalseKeyword';
  this.line = line;
  this.column = column;
}

False.prototype.compile = function(indent, fileName) {
  return new SourceNode(this.line, this.column, fileName, 'false');
};

function True(line, column) {
  this.type = 'TrueKeyword';
  this.line = line;
  this.column = column;
}

True.prototype.compile = function(indent, fileName) {
  return new SourceNode(this.line, this.column, fileName, 'true');
};

function AssignementFromCallExpression (name, functionCalled) {
	this.type = 'AssignementFromCallExpression';
	this.name = name;
	this.functionCalled = functionCalled;
}

AssignementFromCallExpression.prototype.compile = function(indent, fileName) {
	return getIndentStr(indent) + 'var ' + this.name + ' = ' + this.functionCalled.compile(0, fileName);
};

function MainExpression (statements, startLine, startColumn, endLine, endColumn) {
	this.type = 'MainExpression';
	this.statements = statements;
  this.line = startLine;
  this.column = startColumn;
  this.endLine = endLine;
  this.endColumn = endColumn;
}

MainExpression.prototype.compile = function(indent, fileName) {
	var startCode = getIndentStr(indent) + '(function () {\n';
  var mainNode = new SourceNode(this.line, this.column, fileName, startCode);

	var children = this.statements;

	children.forEach(function (child) {
		mainNode.add(child.compile(indent + 1, fileName));
	});

  var endCode = getIndentStr(indent) + '}());\n';
  mainNode.add(new SourceNode(this.endLine, this.endColumn, fileName, endCode));

	return mainNode;
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
  False: False,
  True: True,
  MainExpression: MainExpression
};

module.exports = yy;
