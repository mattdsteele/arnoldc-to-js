# arnoldc-to-js

arnoldc-to-js is a compiler from ArnoldC language to Javascript, with support for source maps.

You can read about the original project here : https://github.com/lhartikk/ArnoldC

## How to use it

Install: `npm install arnoldc.js --global`

Run: `arnoldc.js {{file.arnoldc}}`

It will output two files:

* Compiled javascript: `PATH_TO_YOUR_FILE.arnoldc.js`
* Source Map javascript: `PATH_TO_YOUR_FILE.arnoldc.js.map`

The source map contents is inlined into the map using `sourcesContent`, so you don't need to host your .arnoldc files.

## How does it works ?

It uses [Jison](http://zaach.github.io/jison/) to parse the file and to produce a simple AST of the code.

Then, it uses functions defined in the file `Transpiler.js` and `ast.js` to produce the corresponding Javascript code.

Source maps provided by Mozilla's [source-maps](https://github.com/mozilla/source-map) library.

## Not supported yet

- Non void methods
- Return statement
- Assign variable from method call
- Read integer

It's coming soon !
