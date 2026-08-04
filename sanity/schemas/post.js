/* Blog post — matches content/posts.json, plus rich text + SEO */
export default {
  name: 'post', title: 'Blog Post', type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: r => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'category', title: 'Category', type: 'string' },
    { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'date', title: 'Publish date', type: 'date' },
    { name: 'image', title: 'Featured image', type: 'image', options: { hotspot: true } },
    { name: 'excerpt', title: 'Excerpt', type: 'text' },
    { name: 'body', title: 'Body (rich text)', type: 'array', of: [{ type: 'block' }, { type: 'image' }] },
    { name: 'seoTitle', title: 'SEO title', type: 'string' },
    { name: 'seoDescription', title: 'SEO meta description', type: 'text' },
  ],
}
