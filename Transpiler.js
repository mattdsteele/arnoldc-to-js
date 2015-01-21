function getIndentStr (level) {
	var indentStr = '';

	for (var i = 0; i < level; i++) {
		indentStr += '    ';
	}

	return indentStr;
}

function HandleNode (node, indent) {
	switch (node.type) {
		case 'MainExpression':
			return MainExpressionHandler(node, indent);
			break;
		case 'PrintExpression':
			return PrintHandler(node, indent);
			break;
		case 'IntDeclarationExpression':
			return IntDeclarationHandler(node, indent);
			break;
		case 'AssignementExpression':
			return AssignementExpressionHandler(node, indent);
			break;
		case 'IfExpression':
			return IfExpressionHandler(node, indent);
			break;
		case 'WhileExpression':
			return WhileExpressionHandler(node, indent);
			break;
		case 'MethodDeclarationExpression':
			return MethodDeclarationExpressionHandler(node, indent);
			break;
		case 'CallExpression':
			return CallExpressionHandler(node, indent);
			break;
		case 'ReturnExpression':
			return ReturnExpressionHandler(node, indent);
			break;
		case 'AssignementFromCallExpression':
			return AssignementFromCallExpressionHandler(node, indent);
			break;
	}
}

function PrintHandler (node, indent) {
	return getIndentStr(indent) + 'console.log( '+ node.value + ' );\n';
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

function IfExpressionHandler (node, indent) {
	var code = getIndentStr(indent) + 'if ('+ node.predicate + ') { \n';

	code += node.ifStatements.map(function (node) {
		return HandleNode(node, indent + 1);
	}).reduce(function (block, line) {
		return block + line;
	}, '');

	code += getIndentStr(indent) + '} \n';

	if (node.elseStatements && node.elseStatements.length > 0) {
		code += getIndentStr(indent) + 'else { \n';
		code += node.elseStatements.map(function (node) {
			return HandleNode(node, indent+1);
		}).reduce(function (block, line) {
			return block + line;
		}, '');
		code += getIndentStr(indent) + '}\n';
	}

	return code;
}

function WhileExpressionHandler (node, indent) {
	var code = getIndentStr(indent) + 'while (' + node.predicate + ') {\n';

	code += node.whileStatements.map(function (node) {
		return HandleNode(node, indent + 1);
	}).reduce(function (block, line) {
		return block + line;
	}, '');

	code += getIndentStr(indent) + '}\n';

	return code;
}

function MethodDeclarationExpressionHandler (node, indent) {
	var code = getIndentStr(indent) + 'function ' + node.name + ' ('+ node.arguments.join(', ') +') {\n';

	code += node.innerStatements.map(function (node) {
		return HandleNode(node, indent + 1);
	}).reduce(function (block, line) {
		return block + line;
	}, '');

	code += getIndentStr(indent) + '}\n';

	return code;
}

function CallExpressionHandler (node, indent) {
	return getIndentStr(indent) + node.name + '(' + node.arguments.join(', ') + ');\n';
}

function ReturnExpressionHandler (node, indent) {
	return getIndentStr(indent) + 'return ' + node.value + ';\n';
}

function AssignementFromCallExpressionHandler (node, indent) {
	return getIndentStr(indent) + 'var ' + node.name + ' = ' + HandleNode(node.functionCalled);
}

function MainExpressionHandler (node, indent) {
	var code = getIndentStr(indent) + '(function () {\n';

	var children = node.statements;

	children.forEach(function (child) {
		code += HandleNode(child, indent + 1);
	});

	code += getIndentStr(indent) + '}());\n';

	return code;
}

function RootHandler (nodes) {
	var code = '(function () {\n "use strict";\n';

	nodes.forEach(function (node) {
		code += HandleNode(node, 1);
	});

	code += '}());';

	return code;
}

module.exports.getJSCode = RootHandler;