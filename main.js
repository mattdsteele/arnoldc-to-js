var jison = require('jison');
var fs = require('fs');
var bnf = fs.readFileSync('./arnoldc.jison', 'utf-8');
var parser = new jison.Parser(bnf);
var util = require('util');
var Transpiler = require('./Transpiler');

if (process.argv[2]) {
	var fileName = process.argv[2];

	var ext = fileName.split('.');

	if (ext.length > 0 && ext[ext.length -1] === 'arnoldc') {
		var data = fs.readFileSync(fileName, 'utf-8');
		var AST = parser.parse(data);
		var code = Transpiler.getJSCode(AST);
		fs.writeFileSync(fileName+'.js', code);
	} else {
		console.log('File must have arnoldc extension');
	}
} else {
	console.log('You must specify a file');
}
