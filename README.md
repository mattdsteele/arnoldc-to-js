# arnoldc-to-js

arnoldc-to-js is a compiler from ArnoldC language to Javascript.

You can read about the original project here : https://github.com/lhartikk/ArnoldC

## How to use it

Just use the command ```node main PATH_TO_YOUR_FILE.arnoldc``` and it will output a javascript file next to the original file.

Then you can execute your generated file with NodeJS like a normal file.

## How does it works ?

It uses [Jison](http://zaach.github.io/jison/) to parse the file and to produce a simple AST of the code.
Then, it uses functions defined in the file Transpiler.js to produce the corresponding Javascript code.

If you want to change the grammar rules in arnoldc.jison, don't forget to generate the parser afterwards !
First, you need to have Jison installed globally ```npm install -g jison``` and then to produce the parser : ```jison arnoldc.jison```