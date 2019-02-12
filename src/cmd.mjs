#!/usr/bin/env node

import fs from "fs";
import minimist from "minimist";
import ts2latex from "./ts2latex.mjs";

const path = minimist(process.argv.slice(2))._[0];
const ext = /(?<=\.)[^.]*?$/;
const dir = /(?<=\/)[^\/]*?$/;

if (!path) {
  console.log("Usage: ./cmd.js [filename]");
}

fs.readFile(path, "utf8", (err, data) => {
  if (err) {
    throw err;
  }
  ts2latex(
    data,
    (err, latex) => {
      if (err) throw err;
      console.log("LaTeX successfully generated!");
      let fullTexPath = path.replace(ext, "tex");
      let outDirectory = path.replace(dir, "");
      fs.writeFile(fullTexPath, latex, err => {
        if (err) throw err;
      });
    },
    (err, json) => {
      if (err) throw err;
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
