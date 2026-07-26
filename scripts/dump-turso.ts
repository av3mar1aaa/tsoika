/**
 * Копирует базу Turso в локальный SQLite-файл.
 *
 *   npm run dump-turso                    # -> data/app.db
 *   npm run dump-turso -- ./backup.db     # -> ./backup.db
 *
 * Нужен TURSO_DATABASE_URL / TURSO_AUTH_TOKEN в .env.local.
 * Существующий файл назначения перезаписывается (после подтверждения --force).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";

const BATCH = 200;

async function main() {
  const sourceUrl = process.env.TURSO_DATABASE_URL;
  if (!sourceUrl || !sourceUrl.startsWith("libsql:")) {
    throw new Error(
      "TURSO_DATABASE_URL не задан или не указывает на Turso (libsql://…)",
    );
  }

  const args = process.argv.slice(2).filter((a) => a !== "--force");
  const force = process.argv.includes("--force");
  const target = path.resolve(args[0] ?? path.join(process.cwd(), "data/app.db"));

  if (fs.existsSync(target)) {
    if (!force) {
      throw new Error(
        `${target} уже существует. Добавьте --force, чтобы перезаписать.`,
      );
    }
    for (const suffix of ["", "-wal", "-shm"]) {
      const f = `${target}${suffix}`;
      if (fs.existsSync(f)) fs.rmSync(f);
    }
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });

  const source = createClient({
    url: sourceUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const dest = createClient({ url: `file:${target}` });

  const objects = await source.execute(
    `SELECT type, name, sql FROM sqlite_master
     WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
     ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END`,
  );

  const tables: string[] = [];
  for (const row of objects.rows) {
    const { type, name, sql } = row as unknown as {
      type: string;
      name: string;
      sql: string;
    };
    await dest.execute(sql);
    if (type === "table") tables.push(name);
  }
  console.log(`Схема перенесена: ${tables.length} таблиц, ${objects.rows.length - tables.length} индексов/триггеров`);

  for (const table of tables) {
    const copied = await copyTable(source, dest, table);
    console.log(`  ${table}: ${copied}`);
  }

  console.log("\nПроверка:");
  let ok = true;
  for (const table of tables) {
    const a = await count(source, table);
    const b = await count(dest, table);
    const mark = a === b ? "ok" : "РАСХОЖДЕНИЕ";
    if (a !== b) ok = false;
    console.log(`  ${table}: turso=${a} local=${b} ${mark}`);
  }

  const size = fs.statSync(target).size;
  console.log(`\n${target} — ${(size / 1024).toFixed(0)} КБ`);
  if (!ok) {
    throw new Error("Счётчики строк не совпали — файл не использовать");
  }
}

async function copyTable(
  source: Client,
  dest: Client,
  table: string,
): Promise<number> {
  const info = await source.execute(`PRAGMA table_info("${table}")`);
  const columns = info.rows.map((r) => String((r as Record<string, unknown>).name));
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const placeholders = columns.map(() => "?").join(", ");
  const insert = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;

  let offset = 0;
  let total = 0;
  for (;;) {
    const page = await source.execute({
      sql: `SELECT ${colList} FROM "${table}" LIMIT ? OFFSET ?`,
      args: [BATCH, offset],
    });
    if (page.rows.length === 0) break;

    await dest.batch(
      page.rows.map((row) => ({
        sql: insert,
        args: columns.map(
          (c) => (row as Record<string, unknown>)[c] as string | number | null,
        ),
      })),
      "write",
    );
    total += page.rows.length;
    offset += page.rows.length;
    if (page.rows.length < BATCH) break;
  }
  return total;
}

async function count(client: Client, table: string): Promise<number> {
  const res = await client.execute(`SELECT COUNT(*) AS c FROM "${table}"`);
  return Number((res.rows[0] as Record<string, unknown>).c ?? 0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
