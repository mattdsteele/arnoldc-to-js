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
  return this._sn(indent, fileName, 'console.log( ')
    .add(this.value.compile(indent, fileName))
    .add(' );\n');
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
  node.add('var ')
    .add(this.name.compile(indent, fileName))
    .add(' = ')
    .add(val);
  return node.add(';\n');
};

function AssignementExpression (line, column, name, initialValue, operations) {
  AstNode.call(this, line, column);
	this.name = name;
	this.initialValue = initialValue;
	this.operations = operations;
}
AssignementExpression.prototype = Object.create(AstNode.prototype);
AssignementExpression.prototype.compile = function(indent, fileName) {
  var compiledName = this.name.compile(indent, fileName);
  var node = this._sn(indent, fileName, 'var ')
    .add(compiledName)
    .add(' = (');

	if (this.operations && this.operations.length > 0) {
    var opsNodes = [this.initialValue.compile(indent, fileName)]
		this.operations.forEach(function (operation) {
      opsNodes.splice(0, 0, '(');
      opsNodes.push(operation.compile(indent, fileName));
      opsNodes.push(')');
		});
    node.add(opsNodes)
      .add(');\n');
	} else {
		node.add(this.initialValue.compile(indent, fileName))
      .add(');\n');
	}
  node.add(indentNode(indent))
    .add('if(typeof(')
    .add(compiledName)
    .add(') === "boolean") { ')
    .add(compiledName)
    .add(' = ')
    .add(compiledName)
    .add(' ? 1 : 0; }\n')
    .add(indentNode(indent))
    .add(compiledName)
    .add(' = Math.round(')
    .add(compiledName)
    .add(');\n');

	return node;
};

function IfExpression (line, column, predicate, ifStatements, elseStatements, endIfLine, endIfColumn, elseNode) {
  AstNode.call(this, line, column);
	this.predicate = predicate;
	this.ifStatements = ifStatements;
	this.elseStatements = elseStatements;
  this.endIfLine = endIfLine;
  this.endIfColumn = endIfColumn;
  this.elseNode = elseNode;
}
IfExpression.prototype = Object.create(AstNode.prototype);
IfExpression.prototype.compile = function(indent, fileName) {
  var expr = this._sn(indent, fileName, 'if (')
    .add(this.predicate.compile(indent, fileName))
    .add(') { \n');

	expr.add(this.ifStatements.map(function (node) {
		return node.compile(indent + 1, fileName);
  }));

	if (this.elseStatements && this.elseStatements.length > 0) {
    expr.add(indentNode(indent))
      .add('}\n')
      .add(this.elseNode.compile(indent, fileName))
      .add(this.elseStatements.map(function (node) {
        return node.compile(indent+1, fileName);
      }));
	}
  return expr.add(indentNode(indent))
    .add(new SourceNode(this.endIfLine, this.endIfColumn, fileName, '}\n'));
};

function ElseNode(line, column) {
  AstNode.call(this, line, column);
}
ElseNode.prototype = Object.create(AstNode.prototype);
ElseNode.prototype.compile = function(indent, fileName) {
  return this._sn(indent, fileName, 'else { \n');
};

function WhileExpression (line, column, predicate, whileStatements, endLine, endColumn) {
  AstNode.call(this, line, column);
	this.predicate = predicate;
	this.whileStatements = whileStatements;
  this.endLine = endLine;
  this.endColumn = endColumn;
}
WhileExpression.prototype = Object.create(AstNode.prototype);
WhileExpression.prototype.compile = function(indent, fileName) {
  return this._sn(indent, fileName, 'while (' + this.predicate + ') {\n')
    .add(this.whileStatements.map(function (statement) {
      return statement.compile(indent + 1, fileName);
    }))
    .add(indentNode(indent))
    .add(new SourceNode(this.endLine, this.endColumn, fileName, '}\n'));
};


function MethodDeclarationExpression (line, column, name, arguments, innerStatements, endLine, endColumn) {
  AstNode.call(this, line, column);
	this.name = name;
	this.arguments = arguments;
	this.innerStatements = innerStatements;
  this.endLine = endLine;
  this.endColumn = endColumn;
}

MethodDeclarationExpression.prototype = Object.create(AstNode.prototype);
MethodDeclarationExpression.prototype.compile = function(indent, fileName) {
  var node = this._sn(indent, fileName, '')
    .add('function ' + this.name + ' (');


    this.arguments.forEach(function(argument, i, self) {
      node.add(argument.compile(0, fileName));
      if (i != self.length - 1) {
        node.add(', ');
      }
    });

    return node.add(') {\n')
    .add(this.innerStatements.map(function(statement) {
      return statement.compile(indent + 1, fileName);
    }))
    .add(indentNode(indent))
    .add(new SourceNode(this.endLine, this.endColumn, fileName, '}\n'));
};

function CallExpression (line, column, name, arguments) {
  AstNode.call(this, line, column);
	this.name = name;
	this.arguments = arguments;
}
CallExpression.prototype = Object.create(AstNode.prototype);
CallExpression.prototype.compile = function(indent, fileName) {
  var node = this._sn(indent, fileName, '')
    .add(this.name)
    .add('(');

  this.arguments.forEach(function(argument, i, self) {
    node.add(argument.compile(indent, fileName));
    if (i != self.length - 1) {
      node.add(', ');
    }
  });
  node.add(');\n');
  return node;
};

function ReturnExpression (line, column, value) {
  AstNode.call(this, line, column);
	this.value = value;
}
ReturnExpression.prototype = Object.create(AstNode.prototype);
ReturnExpression.prototype.compile = function(indent, fileName) {
  return this._sn(indent, fileName, 'return ')
    .add(this.value.compile(indent, fileName))
    .add(';\n');
};

function IntegerLike(line, column, boolVal) {
  AstNode.call(this, line, column);
  this.boolVal = boolVal;
}
IntegerLike.prototype = Object.create(AstNode.prototype);
IntegerLike.prototype.compile = function(indent, fileName) {
  return this._sn(0, fileName, this.boolVal);
};

function Operation(line, column, operation, variable) {
  AstNode.call(this, line, column);
  this.operation = operation;
  this.variable = variable;
}
Operation.prototype = Object.create(AstNode.prototype);
Operation.prototype.compile = function(indent, fileName) {
  return this._sn(0, fileName, '')
    .add(this.operation)
    .add(this.variable.compile(indent, fileName));
};

function AssignementFromCallExpression (line, column, name, functionCalled) {
  AstNode.call(this, line, column);
	this.name = name;
	this.functionCalled = functionCalled;
}
AssignementFromCallExpression.prototype = Object.create(AstNode.prototype);
AssignementFromCallExpression.prototype.compile = function(indent, fileName) {
  return this._sn(indent, fileName, '')
    .add('var ' + this.name + ' = ')
    .add(this.functionCalled.compile(0, fileName));
};

function ArgumentDeclarationExpression(line, column, variable) {
  AstNode.call(this, line, column);
  this.variable = variable;
}
ArgumentDeclarationExpression.prototype = Object.create(AstNode.prototype);
ArgumentDeclarationExpression.prototype.compile = function(indent, fileName) {
  return this._sn(indent, fileName, '')
    .add(this.variable);
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
  ElseNode: ElseNode,
  WhileExpression: WhileExpression,
  MethodDeclarationExpression: MethodDeclarationExpression,
  CallExpression: CallExpression,
  ReturnExpression: ReturnExpression,
  AssignementFromCallExpression: AssignementFromCallExpression,
  ArgumentDeclarationExpression: ArgumentDeclarationExpression,
  IntegerLike: IntegerLike,
  Operation: Operation,
  MainExpression: MainExpression
};

module.exports = yy;
