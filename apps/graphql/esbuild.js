import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['src/index.ts'],  // dein Lambda Entrypoint
  bundle: true,                   // alles in eine Datei packen
  platform: 'node',               // für Node.js targeten
  target: ['node18'],             // Node 18 Syntax verwenden
  outfile: 'dist/index.js',       // Ausgabe für Lambda
  sourcemap: 'inline',            // optional für Debugging
  format: 'cjs',                  // Lambda erwartet CommonJS
  external: ['aws-sdk'],          // aws-sdk ist in Lambda runtime schon da
}).catch(() => process.exit(1))
