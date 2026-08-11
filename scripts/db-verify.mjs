/* ============================================================
   Compare the migrated Postgres data against the SQLite source.
   Run:  node scripts/db-verify.mjs

   Row counts alone don't prove much -- the real risk is the JSON
   columns, where a value can arrive as the STRING "[1,2]" instead of
   the array [1,2] and still look fine in a count. This deep-compares
   every value in every row.
   ============================================================ */
import nextEnv from '@next/env'
import pg from 'pg'
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { JSON_COLUMNS, TABLES } from '../lib/pg-schema.mjs'

nextEnv.loadEnvConfig(process.cwd())

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const sqlitePath = path.join(process.cwd(), 'data', 'gng.db').replace(/\\/g, '/')
const sqlite = new DatabaseSync(`file:${sqlitePath}?mode=ro`, { readOnly: true })
const q = (id) => `"${id.replace(/"/g, '""')}"`

/* SQLite keeps JSON in TEXT; Postgres hands back parsed values. Compare
   MEANING, not representation.

   Two traps this has to absorb, both of which produced false alarms on
   the first run:
   - SQLite stores JSON.stringify(null) as the four-character text
     "null", while Postgres reads back a real null. Same meaning.
   - Key ORDER is compared deliberately (no sorting). It matters: spec
     tables render keys in sequence, so a reordering is a visible
     change, not a cosmetic one. That's what caught jsonb reordering
     product specs by key length. */
function norm(v, isJson) {
  if (v === null || v === undefined) return null
  if (typeof v === 'bigint') return Number(v)
  if (isJson) {
    let parsed = v
    if (typeof v === 'string') {
      try {
        parsed = JSON.parse(v)
      } catch {
        return v
      }
    }
    if (parsed === null) return null
    return JSON.stringify(parsed)
  }
  return v
}

let problems = 0
let compared = 0

for (const table of TABLES) {
  let sRows
  try {
    sRows = sqlite.prepare(`SELECT * FROM ${q(table)} ORDER BY id`).all()
  } catch {
    continue
  }
  const pRes = await pool.query(`SELECT * FROM ${q(table)} ORDER BY id`)
  const pRows = pRes.rows
  const jsonCols = new Set(JSON_COLUMNS[table] || [])

  if (sRows.length !== pRows.length) {
    console.log(`${table}: ROW COUNT ${sRows.length} vs ${pRows.length}`)
    problems++
    continue
  }

  for (let i = 0; i < sRows.length; i++) {
    for (const col of Object.keys(sRows[i])) {
      const a = norm(sRows[i][col], jsonCols.has(col))
      const b = norm(pRows[i][col], jsonCols.has(col))
      compared++
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        console.log(`${table}[id=${sRows[i].id}].${col}`)
        console.log(`   sqlite  : ${String(a).slice(0, 90)}`)
        console.log(`   postgres: ${String(b).slice(0, 90)}`)
        problems++
      }
    }
  }
}

// The uploaded-file references are the ones that prove this is the LIVE
// data and not a re-seed from content/*.json.
const uploads = await pool.query(`
  SELECT count(*)::int AS n FROM (
    SELECT image AS v FROM products
    UNION ALL SELECT visual FROM solutions
    UNION ALL SELECT visual FROM industrial_solutions
    UNION ALL SELECT visual FROM industries
    UNION ALL SELECT logo FROM solutions
  ) t WHERE v LIKE '%/uploads/%'
`)

console.log(`\n${compared} values compared`)
console.log(`admin-uploaded file references preserved: ${uploads.rows[0].n}`)
console.log(problems === 0 ? 'RESULT: identical — migration is faithful' : `RESULT: ${problems} MISMATCH(ES)`)

await pool.end()
sqlite.close()
process.exit(problems === 0 ? 0 : 1)
