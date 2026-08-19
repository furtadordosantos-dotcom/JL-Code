import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('.');
const output = resolve('dist');
const publicFiles = ['index.html','login.html','cadastro.html','planos.html','pagamento-aprovado.html','aluno.html','apostilas.html','exercicios.html','ia-gabriela.html','visualizar-apostila.html','script.js','style.css','exercicios.css'];
const imageExtensions = /\.(png|jpe?g|webp|svg|ico)$/i;
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of publicFiles) await cp(resolve(root, file), resolve(output, file));
for await (const entry of await (await import('node:fs/promises')).opendir(root)) {
  if (entry.isFile() && imageExtensions.test(entry.name)) await cp(resolve(root, entry.name), resolve(output, entry.name));
}
