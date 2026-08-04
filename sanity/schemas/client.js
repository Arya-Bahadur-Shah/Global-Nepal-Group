/* Trust logo shown in the homepage marquee — matches content/clients.json */
export default {
  name: 'client', title: 'Client / Trust Logo', type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: r => r.required() },
    { name: 'logo', title: 'Logo', type: 'image' },
  ],
}
