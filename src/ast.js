import sourceMap from 'source-map';

let SourceNode = sourceMap.SourceNode;
let indentSize = 2;

//Helper functions
let getIndentStr = level => new Array(indentSize * level).join(' ');
let indentNode = level => new SourceNode(null, null, null, getIndentStr(level));

//Base class
class AstNode {
  constructor(line, column) {
    this.line = line;
    this.column = column;
  }
  _sn(indent, fileName, chunk) {
    return new SourceNode(this.line, this.column, fileName, '')
      .add(indentNode(indent))
      .add(chunk);
  }
  compile(indent, fileName) {
    //Abstract
  }
}

//Keywords/Expressions

class PrintExpression extends AstNode {
  constructor(position, value) {
    super(position.first_line, position.first_column);
    this.value = value;
  }
  compile(indent, fileName) {
    return this._sn(indent, fileName, 'console.log( ')
      .add(this.value.compile(indent, fileName))
      .add(' );\n');
  }
}

class IntDeclarationExpression extends AstNode {
  constructor(position, name, value) {
    super(position.first_line, position.first_column);
    this.name = name;
    this.value = value;
  }

  compile(indent, fileName) {
    var node = this._sn(indent, fileName, '');
    var val = this.value.compile ? this.value.compile(0, fileName) : this.value;
    node.add('var ')
      .add(this.name.compile(indent, fileName))
      .add(' = ')
      .add(val);
    return node.add(';\n');
  }
}

class AssignmentExpression extends AstNode {
  constructor(position, name, initialValue, operations) {
    super(position.first_line, position.first_column);
    this.name = name;
    this.initialValue = initialValue;
    this.operations = operations;
  }

  compile(indent, fileName) {
    var compiledName = this.name.compile(indent, fileName);
    var node = this._sn(indent, fileName, 'var ')
      .add(compiledName)
      .add(' = (');

    if (this.operations && this.operations.length > 0) {
      var opsNodes = [this.initialValue.compile(indent, fileName)];
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
  }
}

class IfExpression extends AstNode {
  constructor(position, predicate, ifStatements, elseStatements, endPosition, elseNode) {
    super(position.first_line, position.first_column);
    this.predicate = predicate;
    this.ifStatements = ifStatements;
    this.elseStatements = elseStatements;
    this.endIfLine = endPosition.first_line;
    this.endIfColumn = endPosition.first_column;
    this.elseNode = elseNode;
  }

  compile(indent, fileName) {
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
          return node.compile(indent + 1, fileName);
        }));
    }
    return expr.add(indentNode(indent))
      .add(new SourceNode(this.endIfLine, this.endIfColumn, fileName, '}\n'));
  }
}

class ElseNode extends AstNode {
  constructor(line, column) {
    super(line, column);
  }

  compile(indent, fileName) {
    return this._sn(indent, fileName, 'else { \n');
  }
}

class WhileExpression extends AstNode {
  constructor(position, predicate, whileStatements, endPosition) {
    super(position.first_line, position.first_column);
    this.predicate = predicate;
    this.whileStatements = whileStatements;
    this.endLine = endPosition.first_line;
    this.endColumn = endPosition.first_column;
  }

  compile(indent, fileName) {
    return this._sn(indent, fileName, 'while (')
      .add(this.predicate.compile(indent, fileName))
      .add(') {\n')
      .add(this.whileStatements.map(function (statement) {
        return statement.compile(indent + 1, fileName);
      }))
      .add(indentNode(indent))
      .add(new SourceNode(this.endLine, this.endColumn, fileName, '}\n'));
  }
}


class MethodDeclarationExpression extends AstNode {
  constructor(line, column, name, args, innerStatements, endLine, endColumn) {
    super(line, column);
    this.name = name;
    this.args = args;
    this.innerStatements = innerStatements;
    this.endLine = endLine;
    this.endColumn = endColumn;
  }

  compile(indent, fileName) {
    var node = this._sn(indent, fileName, 'function ')
      .add(this.name.compile(indent, fileName))
      .add(' (');


    this.args.forEach(function (argument, i, self) {
      node.add(argument.compile(0, fileName));
      if (i != self.length - 1) {
        node.add(', ');
      }
    });

    return node.add(') {\n')
      .add(this.innerStatements.map(function (statement) {
        return statement.compile(indent + 1, fileName);
      }))
      .add(indentNode(indent))
      .add(new SourceNode(this.endLine, this.endColumn, fileName, '}\n'));
  }
}


class CallExpression extends AstNode {
  constructor(position, name, args) {
    super(position.first_line, position.first_column);
    this.name = name;
    this.args = args;
  }

  compile(indent, fileName) {
    var node = this._sn(indent, fileName, '')
      .add(this.name.compile(indent, fileName))
      .add('(');

    this.args.forEach(function (argument, i, self) {
      node.add(argument.compile(indent, fileName));
      if (i != self.length - 1) {
        node.add(', ');
      }
    });
    node.add(');\n');
    return node;
  }
}

class ReturnExpression extends AstNode {
  constructor(position, value) {
    super(position.first_line, position.first_column);
    this.value = value;
  }

  compile(indent, fileName) {
    return this._sn(indent, fileName, 'return ')
      .add(this.value.compile(indent, fileName))
      .add(';\n');
  }
}

class IntegerLike extends AstNode {
  constructor(line, column, boolVal) {
    super(line, column);
    this.boolVal = boolVal;
  }

  compile(indent, fileName) {
    return this._sn(0, fileName, this.boolVal);
  }
}

class Operation extends AstNode {
  constructor(position, operation, variable) {
    super(position.first_line, position.first_column);
    this.operation = operation;
    this.variable = variable;
  }

  compile(indent, fileName) {
    return this._sn(0, fileName, '')
      .add(this.operation)
      .add(this.variable.compile(indent, fileName));
  }
}

class AssignmentFromCallExpression extends AstNode {
  constructor(position, name, functionCalled) {
    super(position.first_line, position.first_column);
    this.name = name;
    this.functionCalled = functionCalled;
  }

  compile(indent, fileName) {
    return this._sn(indent, fileName, 'var ')
      .add(this.name.compile(indent, fileName))
      .add(' = ')
      .add(this.functionCalled.compile(0, fileName));
  }
}

class ArgumentDeclarationExpression extends AstNode {
  constructor(line, column, variable) {
    super(line, column);
    this.variable = variable;
  }

  compile(indent, fileName) {
    return this._sn(indent, fileName, '')
      .add(this.variable.compile(indent, fileName));
  }
}

class MainExpression extends AstNode {
  constructor(statements, startPosition, endPosition) {
    super(startPosition.first_line, startPosition.first_column);
    this.statements = statements;
    this.endLine = endPosition.first_line;
    this.endColumn = endPosition.first_column;
  }

  compile(indent, fileName) {
    return this._sn(indent, fileName, '')
      .add(this.statements.map(function (child) {
        return child.compile(indent + 1, fileName);
      }));
  }
}

export default {
  PrintExpression,
  IntDeclarationExpression,
  AssignmentExpression,
  IfExpression,
  ElseNode,
  WhileExpression,
  MethodDeclarationExpression,
  CallExpression,
  ReturnExpression,
  AssignmentFromCallExpression,
  ArgumentDeclarationExpression,
  IntegerLike,
  Operation,
  MainExpression,
};
