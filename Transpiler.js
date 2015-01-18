function getIndentStr (level) {
	var indentStr = '';

	for (var i = 0; i < level; i++) {
		indentStr += '    ';
	}

	return indentStr;
}

function HandleNode (node, indent) {
	switch (node.type) {
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
	}
}

function PrintHandler (node, indent) {
	return getIndentStr(indent) + 'console.log( '+ node.value + ' );\n';
}

function IntDeclarationHandler (node, indent) {
	return getIndentStr(indent) + 'var '+ node.name + ' = ' + node.value + ';\n';
}

function AssignementExpressionHandler (node, indent) {
	var code = getIndentStr(indent) + 'var ' + node.name + ' = ';

	if (node.operations && node.operations.length > 0) {
		var operationsStr = node.initialValue;

		node.operations.forEach(function (operation) {
			operationsStr = '(' + operationsStr + operation + ')';
		});

		code += operationsStr +';\n';
	} else {
		code +=  node.initialValue + ';\n';
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

function MainHandler (node) {
	var code = '(function () {\n "use strict"\n';

	var children = node.statements;

	children.forEach(function (child) {
		code += HandleNode(child, 1);
	});

	code += '}());';

	return code;
}

module.exports.getJSCode = MainHandler;