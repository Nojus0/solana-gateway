import nodeResolve from "@rollup/plugin-node-resolve"
import common from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"
import { terser } from "rollup-plugin-terser"
import typescript from "@rollup/plugin-typescript"
import json from "rollup-plugin-json"
import path from "path"
const IS_PRODUCTION = !process.env.ROLLUP_WATCH
console.log(__dirname)
if (IS_PRODUCTION) {
  console.log(`🚀  Building production bundle...`)
} else {
  console.log(`🚀  Building development bundle...`)
}

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "./src/index.ts",
  treeshake: "recommended",
  external: ["aws-sdk"],
  preserveSymlinks: false,
  output: [
    {
      //   dir: "build",
      format: "cjs",
      file: "build/index.js"
    }
  ],
  plugins: [
    json(),
    nodeResolve({ dedupe: ["aws-sdk", "shared"]}),
    typescript(),
    // babel({
    //   babelHelpers: "",
    //   minified: true,
    //   extensions: [".ts", ".js"]
    // }),
    common(),
    terser()
  ]
}

export default config
