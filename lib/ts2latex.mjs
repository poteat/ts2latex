import _ from "lodash";

let regex = {
  commentBlock: /^\/\*\*[^]*\*\/\n?/m,
  name: /^ \* @name (.*)$/m,
  input: /^ \* @input ([^]*?)$/m,
  return: /^ \* @return ([^]*?)$/m,
  description: /^ \* @desc ([^]*?)$/m,
  functionName: /^function (\S)\((.*)\) {$/m,
  arguments: /([^ ,\n]+?)(?:: )?([^ ,\n]+)?/,
  codeBlock: /function.*\n([^]*)\n}/,
  forOfBlock: /\n?([ \t]*)for \((?:var|let)? ([\S]+?) of ([\S]+?)\) {\n?([^]*)\1}/,
  declaration: /^[ \t]*(?:let|var) (\S+)(?:: )?(\S*?)?(?: = (.+?))?;?$/m,
  assignment: /^[ \t]*([\S]+) = (.+?);?$/m,
  returnStatement: /^[ \t]*return ([\S]+?);?$/m,
  statement: /^ *[^]+?$/m
};

let latex = {
  header:
    "\\begin{algorithm}[ht]\n\\SetKwInOut{Input}{Input}\n\\SetKwInOut{Output}{Output}\n",
  functionBegin: "\\underline{function ",
  functionMid: "} $(",
  functionEnd: ")$\\;\n",
  inputBegin: "\\Input{",
  inputEnd: "}\n",
  outputBegin: "\\Output{",
  outputEnd: "}\n",
  declarationBegin: "$",
  declarationMid: " = ",
  declarationEnd: "$\\;\n",
  typeBegin: "\\tt{",
  typeEnd: "}: ",
  forOfBegin: "\\For{$",
  forOfMid: " \\in ",
  forOfEnd: "$}{\n",
  forOfBlockEnd: "} ",
  returnBegin: "return $",
  returnEnd: "$\\;\n",
  assignmentBegin: "$",
  assignmentMid: " = ",
  assignmentEnd: "$\\;\n",
  descriptionBegin: "\\caption{",
  descriptionEnd: "}\n",
  labelBegin: "\\label{",
  labelEnd: "}\n",
  footer: "\\end{algorithm}\n"
};

export default (data, latexCb, jsonCb = () => {}) => {
  let obj = {};

  let matchSet = (s, expr, f) => {
    let match;
    do {
      match = expr.exec(s);
      if (match) {
        f(match);
        s = s.replace(expr, "\n".repeat(match[0].length));
      }
    } while (match);
    return s;
  };

  data = data.replace(/\r\n/g, "\n");

  let commentBlock = data.match(regex.commentBlock)[0];

  _.forEach(
    {
      name: match => {
        obj.name = match[1];
      },
      input: match => {
        obj.input = match[1];
      },
      return: match => {
        obj.return = match[1];
      },
      description: match => {
        obj.description = match[1];
      }
    },
    (f, key) => {
      matchSet(commentBlock, regex[key], f);
    }
  );

  obj.arguments = [];

  matchSet(data, regex.functionName, match => {
    obj.functionName = match[1];
    matchSet(match[2], regex.arguments, match => {
      obj.arguments.push({
        name: match[1],
        type: match[2] ? match[2] : null
      });
    });
  });

  let codeBlock = data.match(regex.codeBlock)[0];

  obj.code = [];

  let parse = data => {
    let elements = [];
    _.forEach(
      {
        forOfBlock: match => {
          elements.push({
            elementType: "forOfBlock",
            index: match.index,
            item: match[2],
            collection: match[3],
            code: parse(match[4])
          });
        },
        declaration: match => {
          elements.push({
            elementType: "declaration",
            index: match.index,
            name: match[1],
            type: match[2],
            rhs: match[3] ? match[3] : null
          });
        },
        assignment: match => {
          elements.push({
            elementType: "assignment",
            index: match.index,
            name: match[1],
            rhs: match[2]
          });
        },
        returnStatement: match => {
          elements.push({
            elementType: "returnStatement",
            index: match.index,
            name: match[1]
          });
        }
      },
      (f, key) => {
        data = matchSet(data, regex[key], f);
      }
    );
    return elements.sort((a, b) => a.index - b.index);
  };

  obj.code = parse(codeBlock);

  jsonCb(obj);

  let out = latex.header;
  out += latex.functionBegin + obj.functionName + latex.functionMid;
  out += _.flatMap(obj.arguments, "name").join(", ");
  out += latex.functionEnd;
  out += latex.inputBegin + obj.input + latex.inputEnd;
  out += latex.outputBegin + obj.return + latex.outputEnd;

  let greek = s => {
    s = s.replace(/alpha/g, "\\alpha");
    s = s.replace(/beta/g, "\\beta");
    return s;
  };

  let format = s => {
    s = s.replace(/true/g, "\\tt{true}");
    s = s.replace(/false/g, "\\tt{false}");
    return s;
  };

  let symbolize = s => {
    s = s.replace(/&&/g, "\\land");
    s = s.replace(/\|\|/g, "\\lor");
    s = s.replace(/Number/g, "\\mathbb{R}");
    return s;
  };

  let write = elements => {
    let out = "";

    for (let element of elements) {
      _.get(
        {
          forOfBlock: element => {
            out += latex.forOfBegin + element.item + latex.forOfMid;
            out += element.collection + latex.forOfEnd;
            out += write(element.code);
            out += latex.forOfBlockEnd;
          },
          declaration: element => {
            out += latex.declarationBegin;
            out += latex.typeBegin + element.type + latex.typeEnd;
            out += greek(element.name);

            if (element.rhs) {
              out += latex.declarationMid + format(element.rhs);
            }
            out += latex.declarationEnd;
          },
          assignment: element => {
            out += latex.assignmentBegin + greek(element.name);
            out += latex.assignmentMid + format(symbolize(greek(element.rhs)));
            out += latex.assignmentEnd;
          },
          returnStatement: element => {
            out += latex.returnBegin + greek(element.name) + latex.returnEnd;
          }
        },
        element.elementType
      )(element);
    }

    return out;
  };

  out += write(obj.code);

  out += latex.descriptionBegin + obj.description + latex.descriptionEnd;
  out += latex.labelBegin + obj.name + latex.labelEnd;
  out += latex.footer;

  latexCb(out);
};
