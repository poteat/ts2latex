# ts2latex

Convert TypeScript to LaTeX algorithm format. Supports only a small subset of
the general TS syntax, and is intended to be an easier way to write psuedocode
for LaTeX-written academic documents.

## Installation

To use from the command line, install globally:

    npm i -g ts2latex

To use as a library, save as a dependency:

    npm i ts2latex --save-dev

## Usage

If installed globally, the following (e.g) will work:

    md2latex docs/example.md

The API is a single function which takes in correctly formatted TypeScript code,
and returns, optionally, both the JSON and LaTeX conversions of the code.

```js
const ts2latex = require("ts2latex");

ts2latex(
  data,
  json => {
    console.log(json);
  },
  latex => {
    console.log(latex);
  }
);
```

You will of course need supplementary LaTeX syntax (i.e. the appropriate
packages) before the generated LaTeX code will compile.

## Syntax

The syntax is a strict subset of TypeScript, requiring some annotated
documentation in a modified JSDoc style to supply needed captions, labels, etc.
For example:

```ts
/**
 * @name alg:always
 * @input Array of reals $x, y$ of size $n$
 * @return Array of reals, size $n$
 * @desc 'Always' operator.  Resultant array is true up until $x_i$ is false.
 */
function A(x: Array<number>, y) {
  let alpha: boolean = true;
  alpha = false;
  for (let x_i of x) {
    alpha = x_i && alpha;
    x_i = Number(alpha);
  }
  return x;
}
```

Some greek name variables will be converted to their respective LaTeX symbol.
If more are needed for your application, feel free to make a pull request.
