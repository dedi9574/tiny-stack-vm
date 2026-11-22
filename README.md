# Tiny Stack VM

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack virtual machine for make.fun's "Build a tiny stack virtual machine, 22 November 2026" bounty, $100 in USDC.

One run of `node main.ts` answers all 40 instances of a set, writing `<id>/stdout.bin` and `<id>/exit.txt` under `MAKEFUN_OUTPUT_DIR`.

## Idea

A single tight dispatch loop over the program bytes, state in typed arrays. Every opcode follows the ISA exactly, traps included.
