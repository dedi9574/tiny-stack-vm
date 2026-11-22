// Tiny stack VM, written from the kit's ISA spec. One run answers a whole set.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
function run(p: Uint8Array, d: Uint8Array): { out: Uint8Array; exit: number } {
  const s = new Int32Array(256), c = new Int32Array(64), m = new Int32Array(256), o = new Uint8Array(65536);
  let sp = 0, cp = 0, pc = 0, ip = 0, k = 0, ol = 0;
  const n = p.length;
  try {
    for (;;) {
      if (k >= 1e6) throw 10;
      if (pc < 0 || pc >= n) throw 9;
      const op = p[pc];
      k++;
      switch (op) {
        case 0: return { out: o.subarray(0, ol), exit: 0 };
        case 1:
          if (pc + 2 > n) throw 9;
          if (sp >= 256) throw 3;
          s[sp++] = (p[pc + 1] << 24) >> 24; pc += 2; break;
        case 2:
          if (pc + 5 > n) throw 9;
          if (sp >= 256) throw 3;
          s[sp++] = p[pc + 1] | (p[pc + 2] << 8) | (p[pc + 3] << 16) | (p[pc + 4] << 24); pc += 5; break;
        case 3:
          if (sp < 1) throw 2;
          sp--; pc++; break;
        case 4:
          if (sp < 1) throw 2;
          if (sp >= 256) throw 3;
          s[sp] = s[sp - 1]; sp++; pc++; break;
        case 5:
          if (sp < 2) throw 2;
          { const t = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = t; }
          pc++; break;
        case 6:
          if (sp < 2) throw 2;
          if (sp >= 256) throw 3;
          s[sp] = s[sp - 2]; sp++; pc++; break;
        case 7:
          if (sp < 3) throw 2;
          { const a = s[sp - 3]; s[sp - 3] = s[sp - 2]; s[sp - 2] = s[sp - 1]; s[sp - 1] = a; }
          pc++; break;
        case 16:
          if (sp < 2) throw 2;
          s[sp - 2] = (s[sp - 2] + s[sp - 1]) | 0; sp--; pc++; break;
        case 17:
          if (sp < 2) throw 2;
          s[sp - 2] = (s[sp - 2] - s[sp - 1]) | 0; sp--; pc++; break;
        case 18:
          if (sp < 2) throw 2;
          s[sp - 2] = Math.imul(s[sp - 2], s[sp - 1]); sp--; pc++; break;
        case 19: {
          if (sp < 2) throw 2;
          const b = s[sp - 1];
          if (b === 0) throw 4;
          s[sp - 2] = Math.trunc(s[sp - 2] / b) | 0; sp--; pc++; break;
        }
        case 20: {
          if (sp < 2) throw 2;
          const b = s[sp - 1];
          if (b === 0) throw 4;
          s[sp - 2] = (s[sp - 2] % b) | 0; sp--; pc++; break;
        }
        case 21: {
          if (sp < 2) throw 2;
          const b = s[sp - 1];
          if (b === 0) throw 4;
          s[sp - 2] = Math.trunc((s[sp - 2] >>> 0) / (b >>> 0)) | 0; sp--; pc++; break;
        }
        case 22: {
          if (sp < 2) throw 2;
          const b = s[sp - 1];
          if (b === 0) throw 4;
          s[sp - 2] = ((s[sp - 2] >>> 0) % (b >>> 0)) | 0; sp--; pc++; break;
        }
        case 23:
          if (sp < 1) throw 2;
          s[sp - 1] = (-s[sp - 1]) | 0; pc++; break;
        case 24:
          if (sp < 2) throw 2;
          s[sp - 2] = s[sp - 2] & s[sp - 1]; sp--; pc++; break;
        case 25:
          if (sp < 2) throw 2;
          s[sp - 2] = s[sp - 2] | s[sp - 1]; sp--; pc++; break;
        case 26:
          if (sp < 2) throw 2;
          s[sp - 2] = s[sp - 2] ^ s[sp - 1]; sp--; pc++; break;
        case 27:
          if (sp < 1) throw 2;
          s[sp - 1] = ~s[sp - 1]; pc++; break;
        case 28:
          if (sp < 2) throw 2;
          s[sp - 2] = s[sp - 2] << (s[sp - 1] & 31); sp--; pc++; break;
        case 29:
          if (sp < 2) throw 2;
          s[sp - 2] = s[sp - 2] >> (s[sp - 1] & 31); sp--; pc++; break;
        case 30:
          if (sp < 2) throw 2;
          s[sp - 2] = (s[sp - 2] >>> (s[sp - 1] & 31)) | 0; sp--; pc++; break;
        case 32:
          if (sp < 2) throw 2;
          s[sp - 2] = s[sp - 2] === s[sp - 1] ? 1 : 0; sp--; pc++; break;
        case 33:
          if (sp < 2) throw 2;
          s[sp - 2] = s[sp - 2] < s[sp - 1] ? 1 : 0; sp--; pc++; break;
        case 34:
          if (sp < 2) throw 2;
          s[sp - 2] = (s[sp - 2] >>> 0) < (s[sp - 1] >>> 0) ? 1 : 0; sp--; pc++; break;
        case 48: {
          if (pc + 3 > n) throw 9;
          const v = ((p[pc + 1] | (p[pc + 2] << 8)) << 16) >> 16;
          pc = pc + 3 + v; break;
        }
        case 49: {
          if (pc + 3 > n) throw 9;
          if (sp < 1) throw 2;
          const t = s[--sp], v = ((p[pc + 1] | (p[pc + 2] << 8)) << 16) >> 16;
          pc = t === 0 ? pc + 3 + v : pc + 3; break;
        }
        case 50: {
          if (pc + 3 > n) throw 9;
          if (sp < 1) throw 2;
          const t = s[--sp], v = ((p[pc + 1] | (p[pc + 2] << 8)) << 16) >> 16;
          pc = t !== 0 ? pc + 3 + v : pc + 3; break;
        }
        case 51:
          if (pc + 3 > n) throw 9;
          if (cp >= 64) throw 7;
          c[cp++] = pc + 3; pc = p[pc + 1] | (p[pc + 2] << 8); break;
        case 52:
          if (cp === 0) throw 8;
          pc = c[--cp]; break;
        case 64: {
          if (sp < 1) throw 2;
          const a = s[sp - 1];
          if (a < 0 || a > 255) throw 6;
          s[sp - 1] = m[a]; pc++; break;
        }
        case 65: {
          if (sp < 2) throw 2;
          const a = s[sp - 1];
          if (a < 0 || a > 255) throw 6;
          m[a] = s[sp - 2]; sp -= 2; pc++; break;
        }
        case 80: {
          if (sp < 1) throw 2;
          const t = String(s[--sp]);
          if (ol + t.length > 65536) throw 11;
          for (let i = 0; i < t.length; i++) o[ol++] = t.charCodeAt(i);
          pc++; break;
        }
        case 81:
          if (sp < 1) throw 2;
          if (ol + 1 > 65536) throw 11;
          o[ol++] = s[--sp] & 255; pc++; break;
        case 82:
          if (sp >= 256) throw 3;
          s[sp++] = ip < d.length ? d[ip++] : -1; pc++; break;
        case 83:
          if (sp < 1) throw 2;
          return { out: o.subarray(0, ol), exit: s[--sp] & 255 };
        default: throw 5;
      }
    }
  } catch (e) {
    return { out: o.subarray(0, ol), exit: e as number };
  }
}
for (const id of readdirSync(I).sort()) {
  const a = join(I, id), b = join(O, id);
  const r = run(readFileSync(join(a, 'program.bin')), readFileSync(join(a, 'input.bin')));
  mkdirSync(b, { recursive: true });
  writeFileSync(join(b, 'stdout.bin'), r.out);
  writeFileSync(join(b, 'exit.txt'), r.exit + '\n');
}
