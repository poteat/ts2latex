#!/usr/bin/env node

const fs = require("fs");
const args = require("minimist")(process.argv.slice(2));
const ts2latex = require("./lib/ts2latex.js");

const path = args._[0];
const ext = /(?<=\.)[^.]*?$/;
const dir = /(?<=\/)[^\/]*?$/;

if (!path) {
  console.log("Usage: ./cmd.js [filename]");
  return;
}

fs.readFile(path, "utf8", (err, data) => {
  if (err) {
    throw err;
  }
  ts2latex(
    data,
    latex => {
      console.log("LaTeX successfully generated!");
      let fullTexPath = path.replace(ext, "tex");
      let outDirectory = path.replace(dir, "");
      fs.writeFile(fullTexPath, latex, err => {
        if (err) throw err;
      });
    },
    json => {
      console.log("JSON successfully generated!");
      fs.writeFile(
        path.replace(ext, "json"),
        JSON.stringify(json, null, 2),
        err => {
          if (err) throw err;
        }
      );
    }
  );
});
