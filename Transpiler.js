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

function HandleNode (node, indent, fileName) {
	switch (node.type) {
		case 'MainExpression':
			return MainExpressionHandler(node, indent, fileName);
			break;
		case 'PrintExpression':
			return PrintHandler(node, indent, fileName);
			break;
		case 'IntDeclarationExpression':
			return IntDeclarationHandler(node, indent, fileName);
			break;
		case 'AssignementExpression':
			return AssignementExpressionHandler(node, indent, fileName);
			break;
		case 'IfExpression':
			return IfExpressionHandler(node, indent, fileName);
			break;
		case 'WhileExpression':
			return WhileExpressionHandler(node, indent, fileName);
			break;
		case 'MethodDeclarationExpression':
			return MethodDeclarationExpressionHandler(node, indent, fileName);
			break;
		case 'CallExpression':
			return CallExpressionHandler(node, indent, fileName);
			break;
		case 'ReturnExpression':
			return ReturnExpressionHandler(node, indent, fileName);
			break;
		case 'AssignementFromCallExpression':
			return AssignementFromCallExpressionHandler(node, indent, fileName);
			break;
	}
}

function PrintHandler (node, indent, fileName) {
  var printNode = indentNode(indent);
	var blob = 'console.log( '+ node.value + ' );\n';
  printNode.add(new SourceNode(node.line, node.column, fileName, blob));
  return printNode;
}

function IntDeclarationHandler (node, indent) {
	return getIndentStr(indent) + 'var '+ node.name + ' = ' + node.value + ';\n';
}

function AssignementExpressionHandler (node, indent) {
	var code = getIndentStr(indent) + 'var ' + node.name + ' = parseInt(';

	if (node.operations && node.operations.length > 0) {
		var operationsStr = node.initialValue;

		node.operations.forEach(function (operation) {
			operationsStr = '(' + operationsStr + operation + ')';
		});

		code += operationsStr +');\n';
	} else {
		code +=  node.initialValue + ');\n';
	}

	return code;
}

function IfExpressionHandler (node, indent, fileName) {
	var code = getIndentStr(indent) + 'if ('+ node.predicate + ') { \n';

	code += node.ifStatements.map(function (node) {
		return HandleNode(node, indent + 1, fileName);
	}).reduce(function (block, line) {
		return block + line;
	}, '');

	code += getIndentStr(indent) + '} \n';

	if (node.elseStatements && node.elseStatements.length > 0) {
		code += getIndentStr(indent) + 'else { \n';
		code += node.elseStatements.map(function (node) {
			return HandleNode(node, indent+1, fileName);
		}).reduce(function (block, line) {
			return block + line;
		}, '');
		code += getIndentStr(indent) + '}\n';
	}

	return code;
}

function WhileExpressionHandler (node, indent, fileName) {
	var code = getIndentStr(indent) + 'while (' + node.predicate + ') {\n';

	code += node.whileStatements.map(function (node) {
		return HandleNode(node, indent + 1, fileName);
	}).reduce(function (block, line) {
		return block + line;
	}, '');

	code += getIndentStr(indent) + '}\n';

	return code;
}

function MethodDeclarationExpressionHandler (node, indent, fileName) {
  var mainNode = new SourceNode(node.line, node.column, fileName, '');
	var code = getIndentStr(indent) + 'function ' + node.name + ' ('+ node.arguments.join(', ') +') {\n';

	code += node.innerStatements.map(function (node) {
		return HandleNode(node, indent + 1, fileName);
	}).reduce(function (block, line) {
		return block + line;
	}, '');

	code += getIndentStr(indent) + '}\n';
  mainNode.add(code);

	return mainNode;
}

function CallExpressionHandler (node, indent) {
	return getIndentStr(indent) + node.name + '(' + node.arguments.join(', ') + ');\n';
}

function ReturnExpressionHandler (node, indent) {
	return getIndentStr(indent) + 'return ' + node.value + ';\n';
}

function AssignementFromCallExpressionHandler (node, indent, fileName) {
	return getIndentStr(indent) + 'var ' + node.name + ' = ' + HandleNode(node.functionCalled, 0, fileName);
}

function MainExpressionHandler (node, indent, fileName) {
	var startCode = getIndentStr(indent) + '(function () {\n';
  var mainNode = new SourceNode(node.line, node.column, fileName, startCode);

	var children = node.statements;

	children.forEach(function (child) {
		mainNode.add(HandleNode(child, indent + 1, fileName));
	});

  var endCode = getIndentStr(indent) + '}());\n';
  mainNode.add(new SourceNode(node.endLine, node.endColumn, fileName, endCode));

	return mainNode;
}

module.exports.withSourceMaps = function(nodes, fileName) {
  var preamble = new SourceNode(null, null, null, '')
    .add('(function() {\n "use strict";\n');

  var codes = nodes.forEach(function(expr) {
    preamble.add(HandleNode(expr, 1, fileName));
  });

  var postscript = new SourceNode(null, null, null, '')
    .add('}());');

  preamble.add(postscript);

  return preamble;
};
