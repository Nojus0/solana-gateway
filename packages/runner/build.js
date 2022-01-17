require("esbuild").buildSync({
  platform: "node",
  bundle: true,
  minify: true,
  treeShaking: true,
  entryPoints: ["./src/index.ts"],
  outfile: "./build/index.js"
})
