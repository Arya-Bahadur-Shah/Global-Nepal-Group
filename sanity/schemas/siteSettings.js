/* Global editable content — matches content/site.json */
export default {
  name: 'siteSettings', title: 'Site Settings', type: 'document',
  fields: [
    { name: 'heroHeadline', title: 'Hero headline', type: 'string' },
    { name: 'heroSub', title: 'Hero sub-headline', type: 'text' },
    { name: 'ctaPrimary', title: 'Primary CTA label', type: 'string' },
    { name: 'ctaSecondary', title: 'Secondary CTA label', type: 'string' },
    { name: 'mission', title: 'Mission statement', type: 'text' },
    { name: 'address', title: 'Office address', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'team', title: 'Team members', type: 'array',
      of: [{ type: 'object', fields: [
        { name: 'name', type: 'string' }, { name: 'role', type: 'string' }, { name: 'photo', type: 'image' },
      ] }] },
    { name: 'stats', title: 'Homepage stats', type: 'array',
      of: [{ type: 'object', fields: [
        { name: 'value', type: 'string' }, { name: 'label', type: 'string' },
      ] }] },
  ],
}
