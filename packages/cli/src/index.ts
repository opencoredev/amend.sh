#!/usr/bin/env bun

import { runAmendCli } from "./cli";

const exitCode = await runAmendCli(process.argv.slice(2));
process.exitCode = exitCode;
