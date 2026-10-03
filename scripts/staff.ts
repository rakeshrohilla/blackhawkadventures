/**
 * Staff account management.
 *
 *   npm run staff:add -- "Name" email@example.com ADMIN
 *   npm run staff:password -- email@example.com
 *   npm run staff:list
 *
 * Passwords are read from stdin (never from argv, so they stay out of shell history)
 * and stored as bcrypt hashes.
 */
import "dotenv/config";

import { createInterface } from "node:readline/promises";
import { randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function askPassword(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`${prompt} (blank to generate one) `)).trim();
  rl.close();

  if (answer) {
    if (answer.length < 10) throw new Error("Use at least 10 characters.");
    return answer;
  }

  const generated = randomBytes(12).toString("base64url");
  console.log(`\nGenerated password: ${generated}\nStore it somewhere safe — it is not shown again.\n`);
  return generated;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === "list") {
    const staff = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    for (const member of staff) {
      console.log(
        `${member.role.padEnd(6)} ${member.email.padEnd(36)} ${member.name}` +
          (member.lastLoginAt ? `  (last in ${member.lastLoginAt.toISOString()})` : "  (never signed in)"),
      );
    }
    return;
  }

  if (command === "add") {
    const [name, email, role = "EDITOR"] = args;
    if (!name || !email) throw new Error('Usage: npm run staff:add -- "Name" email@example.com [ADMIN|EDITOR]');
    if (role !== "ADMIN" && role !== "EDITOR") throw new Error("Role must be ADMIN or EDITOR.");

    const password = await askPassword(`Password for ${email}:`);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), role, passwordHash: hashSync(password, 12) },
    });
    console.log(`Created ${user.role} ${user.email}`);
    return;
  }

  if (command === "password") {
    const [email] = args;
    if (!email) throw new Error("Usage: npm run staff:password -- email@example.com");

    const password = await askPassword(`New password for ${email}:`);
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash: hashSync(password, 12) },
    });
    console.log(`Password updated for ${email}`);
    return;
  }

  console.log("Commands: list | add | password");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
