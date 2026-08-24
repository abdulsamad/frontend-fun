import { build } from 'esbuild';

await build({
  entryPoints: ['functions/_worker.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  outfile: 'build/_worker.js',
  sourcemap: false,
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});
