/* Software platform (Cubix / Activ / Trackline / On Service).
   Gets its own page at /solutions/<slug>. 'hardwareUsed' is a list of
   product NAMES (must match a product's "name" in the product schema)
   so the solution page can link straight to the real hardware it runs on. */
export default {
  name: 'solution', title: 'Solution', type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: r => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'tag', title: 'Short tagline', type: 'string' },
    { name: 'summary', title: 'Summary (homepage teaser + card)', type: 'text' },
    { name: 'description', title: 'Full description (detail page)', type: 'text' },
    { name: 'features', title: 'Features', type: 'array',
      of: [{ type: 'object', fields: [{ name: 'title', type: 'string' }, { name: 'body', type: 'text' }] }] },
    { name: 'modules', title: 'Modules (optional \u2014 e.g. Cubix)', type: 'array',
      of: [{ type: 'object', fields: [{ name: 'title', type: 'string' }, { name: 'body', type: 'text' }] }] },
    { name: 'advantages', title: 'Advantages (short tags)', type: 'array', of: [{ type: 'string' }] },
    { name: 'hardwareUsed', title: 'Hardware used (product names)', type: 'array', of: [{ type: 'string' }],
      description: 'Must match the "name" field of a product exactly (or its start) to cross-link.' },
    { name: 'visual', title: 'Screenshot / mockup image', type: 'image', options: { hotspot: true } },
  ],
}
