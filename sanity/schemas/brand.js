/* Global brand Global Nepal Group exports — matches content/brands.json */
export default {
  name: 'brand', title: 'Export Brand', type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: r => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'logo', title: 'Logo', type: 'image' },
    { name: 'focus', title: 'What they cover', type: 'string' },
  ],
}
