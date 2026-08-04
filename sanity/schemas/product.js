/* Hardware product — matches content/products.json.
   Belongs to a brand via 'brandSlug'. Spec sheet can be a single PDF
   (specSheetFile/specSheetUrl) or, for products with multiple specs
   (e.g. Rynan R20 MAX/PRO/REACH), a list in 'specSheetVariants'. */
export default {
  name: 'product', title: 'Hardware Product', type: 'document',
  fields: [
    { name: 'name', title: 'Product Name', type: 'string', validation: r => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'brandSlug', title: 'Brand', type: 'string',
      description: 'Must match a brand slug (zebra, rynan, hid, yesmark, oem)' },
    { name: 'model', title: 'Model / SKU', type: 'string' },
    { name: 'shortDescription', title: 'Short description (card)', type: 'text' },
    { name: 'description', title: 'Full description', type: 'text' },
    { name: 'image', title: 'Main image', type: 'image', options: { hotspot: true } },
    { name: 'gallery', title: 'Gallery', type: 'array', of: [{ type: 'image' }] },
    { name: 'specs', title: 'Specifications (key/value)', type: 'array',
      of: [{ type: 'object', fields: [
        { name: 'key', title: 'Spec name', type: 'string' },
        { name: 'value', title: 'Spec value', type: 'string' },
      ] }] },
    { name: 'specSheetFile', title: 'Spec sheet (PDF upload)', type: 'file', options: { accept: '.pdf' } },
    { name: 'specSheetUrl', title: 'Spec sheet (external URL)', type: 'url' },
    { name: 'specSheetVariants', title: 'Spec sheet variants (multiple PDFs, e.g. MAX/PRO/REACH)', type: 'array',
      of: [{ type: 'object', fields: [{ name: 'label', type: 'string' }, { name: 'url', type: 'url' }] }] },
  ],
}
