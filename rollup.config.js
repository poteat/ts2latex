import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default [
  {
    input: "src/ts2latex.mjs",
    output: {
      file: pkg.main,
      name: "ts2latex",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  }
];
