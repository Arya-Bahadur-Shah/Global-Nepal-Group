/* ============================================================
   Exercises the write path end to end, then cleans up after itself.
   Run:  node scripts/db-write-test.mjs

   Specifically proves the two things a read-only check can't:
   - INSERT without an explicit id doesn't collide with a migrated row
     (the identity sequence was set past the existing max)
   - JSON columns round-trip with their key ORDER intact, which is what
     product spec tables render
   ============================================================ */
import nextEnv from '@next/env'
import pg from 'pg'

nextEnv.loadEnvConfig(process.cwd())
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

let failures = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ' — ' + detail : ''}`)
  if (!ok) failures++
}

try {
  const before = await pool.query('SELECT COUNT(*)::int AS n, MAX(id)::int AS maxid FROM products')
  console.log(`products before: ${before.rows[0].n} rows, max id ${before.rows[0].maxid}`)

  // Key order here is deliberately NOT alphabetical and NOT length-sorted,
  // so a reordering by the storage layer is detectable.
  const specs = { Zebra: 'first', 'Print speed': 'second', OS: 'third' }

  const ins = await pool.query(
    `INSERT INTO products ("brandSlug", slug, name, model, specs, gallery)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    ['zebra', '__writetest__', 'Write Test', 'WT-1', JSON.stringify(specs), JSON.stringify(['a', 'b'])]
  )
  const newId = ins.rows[0].id
  check('INSERT without explicit id succeeded', true, `got id ${newId}`)
  check('new id is past every migrated row', newId > before.rows[0].maxid, `${newId} > ${before.rows[0].maxid}`)

  const read = await pool.query('SELECT * FROM products WHERE id = $1', [newId])
  const row = read.rows[0]
  check('row reads back', !!row)
  check('camelCase column survived quoting', row?.brandSlug === 'zebra', `brandSlug=${row?.brandSlug}`)
  check('JSON returns a parsed object', typeof row?.specs === 'object' && row.specs !== null)
  check(
    'JSON key ORDER preserved',
    JSON.stringify(row?.specs) === JSON.stringify(specs),
    JSON.stringify(row?.specs)
  )
  check('array column round-tripped', JSON.stringify(row?.gallery) === JSON.stringify(['a', 'b']))

  const upd = await pool.query('UPDATE products SET name = $1 WHERE id = $2', ['Write Test 2', newId])
  check('UPDATE reports one changed row', upd.rowCount === 1, `rowCount=${upd.rowCount}`)

  // The unique constraint must still fire — that's what the admin form's
  // "slug already in use" message depends on.
  let dupBlocked = false
  try {
    await pool.query(`INSERT INTO products ("brandSlug", slug, name) VALUES ($1,$2,$3)`, [
      'zebra',
      '__writetest__',
      'dupe',
    ])
  } catch (e) {
    dupBlocked = /duplicate key value/i.test(e.message)
  }
  check('duplicate slug rejected by UNIQUE constraint', dupBlocked)

  const del = await pool.query('DELETE FROM products WHERE id = $1', [newId])
  check('DELETE removed it', del.rowCount === 1)

  const after = await pool.query('SELECT COUNT(*)::int AS n FROM products')
  check('row count back to original', after.rows[0].n === before.rows[0].n, `${after.rows[0].n} vs ${before.rows[0].n}`)
} catch (e) {
  console.log('\nUNEXPECTED ERROR:', e.message)
  failures++
  // Best-effort cleanup so a failed run doesn't leave test data behind.
  await pool.query(`DELETE FROM products WHERE slug = '__writetest__'`).catch(() => {})
} finally {
  await pool.end()
}

console.log(failures === 0 ? '\nWrite path healthy.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
