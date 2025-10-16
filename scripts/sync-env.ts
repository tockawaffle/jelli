#!/usr/bin/env bun
import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const ENV_FILE = join(process.cwd(), ".env.local");

function parseEnvFile(content: string): Record<string, string> {
	const env: Record<string, string> = {};
	const lines = content.split("\n");

	for (const line of lines) {
		// Skip empty lines and comments
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		// Parse KEY=VALUE
		const match = trimmed.match(/^([^=]+)=(.*)$/);
		if (match) {
			const key = match[1].trim();
			let value = match[2].trim();

			// Remove surrounding quotes if present
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}

			env[key] = value;
		}
	}

	return env;
}

function setConvexEnv(key: string, value: string): boolean {
	console.log(`Setting ${key}...`);

	const result = spawnSync("convex", ["env", "set", key, value], {
		stdio: "inherit",
		shell: true,
	});

	if (result.status !== 0) {
		console.error(`Failed to set ${key}`);
		return false;
	}

	return true;
}

function main() {
	// Check if .env.local exists
	if (!existsSync(ENV_FILE)) {
		console.error(`Error: ${ENV_FILE} not found`);
		process.exit(1);
	}

	console.log(`Reading environment variables from ${ENV_FILE}...\n`);

	// Read and parse .env.local
	const content = readFileSync(ENV_FILE, "utf-8");
	const envVars = parseEnvFile(content);

	const keys = Object.keys(envVars);
	if (keys.length === 0) {
		console.log("No environment variables found in .env.local");
		return;
	}

	console.log(`Found ${keys.length} environment variable(s)\n`);

	// Set each environment variable in Convex
	let successCount = 0;
	let failCount = 0;

	for (const [key, value] of Object.entries(envVars)) {
		if (setConvexEnv(key, value)) {
			successCount++;
		} else {
			failCount++;
		}
	}

	console.log(`\n✓ Successfully set ${successCount} variable(s)`);
	if (failCount > 0) {
		console.log(`✗ Failed to set ${failCount} variable(s)`);
		process.exit(1);
	}
}

main();

