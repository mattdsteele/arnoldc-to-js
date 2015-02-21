var jison = require('jison');
var fs = require('fs');
var bnf = fs.readFileSync('./arnoldc.jison', 'utf-8');
var parser = new jison.Parser(bnf);
parser.yy = require('./ast');
var util = require('util');
var Transpiler = require('./Transpiler');
var sourceMap = require('source-map');

if (process.argv[2]) {
	var fileName = process.argv[2];

	var ext = fileName.split('.');

	if (ext.length > 0 && ext[ext.length -1] === 'arnoldc') {
		var data = fs.readFileSync(fileName, 'utf-8');
		var AST = parser.parse(data);
		var code = Transpiler.getJSCode(AST);

    var jsFile = fileName + '.js',
      sourceMapName = jsFile + '.map';
		fs.writeFileSync(fileName+'.golden.js', code);

    var mapping = Transpiler.withSourceMaps(AST, fileName);
    mapping.setSourceContent(fileName, data);
    var output = mapping.toStringWithSourceMap({ file: sourceMapName });
    //add source map
    output.code += "\n//# sourceMappingURL=" + sourceMapName;
    fs.writeFileSync(sourceMapName, output.map);
    fs.writeFileSync(jsFile, output.code);
	} else {
		console.log('File must have arnoldc extension');
	}
} else {
	console.log('You must specify a file');
}
