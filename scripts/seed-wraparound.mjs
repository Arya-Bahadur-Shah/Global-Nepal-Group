import nextEnv from '@next/env'
import pg from 'pg'

nextEnv.loadEnvConfig(process.cwd())

const url = process.env.DATABASE_URL
if (!url) {
  console.log('DATABASE_URL is missing')
  process.exit(1)
}

const client = new pg.Client({ connectionString: url })
await client.connect()

const name = 'Wrap around labelling machine'
const slug = 'wrap-around-labelling-machine'
const brandSlug = 'industrial'
const industrialSolutionSlug = 'labeling-solutions'
const model = 'Wraparound Labeller'
const shortDescription = 'Industrial packaging system designed to apply pressure-sensitive, adhesive labels that encircle cylindrical or geometric containers.'
const description = 'A wrap-around labeller (also written as wraparound labeling machine) is an industrial packaging system designed to apply pressure-sensitive, adhesive labels that encircle cylindrical or geometric containers. They are universally deployed across the pharmaceutical, food, beverage, cosmetic, and chemical industries to process bottles, jars, cans, vials, and tubes.'
const image = '/assets/products/wraparound-labeler.png'
const specs = JSON.stringify({
  'Machine Type': 'Wrap Around Labeling Machine',
  'Application': 'Bottles, Jars, Cans, Vials & Tubes',
  'Label Type': 'Pressure-Sensitive Adhesive',
  'Target Industries': 'Pharmaceutical, Food, Beverage, Chemical, Cosmetic',
})

try {
  await client.query(
    `INSERT INTO products ("brandSlug", "industrialSolutionSlug", slug, name, model, "shortDescription", description, image, specs)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT ("brandSlug", slug) DO UPDATE SET
       name = EXCLUDED.name,
       model = EXCLUDED.model,
       "industrialSolutionSlug" = EXCLUDED."industrialSolutionSlug",
       "shortDescription" = EXCLUDED."shortDescription",
       description = EXCLUDED.description,
       image = EXCLUDED.image,
       specs = EXCLUDED.specs`,
    [brandSlug, industrialSolutionSlug, slug, name, model, shortDescription, description, image, specs]
  )
  console.log('Wrap around labelling machine seeded successfully!')
} catch (err) {
  console.error('Error seeding product:', err)
} finally {
  await client.end()
}
