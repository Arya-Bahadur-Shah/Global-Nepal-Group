/* Website inquiry — created by the contact API route once Sanity is connected,
   so leads are viewable in the CMS dashboard */
export default {
  name: 'lead', title: 'Website Lead', type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'msg', title: 'Message', type: 'text' },
    { name: 'at', title: 'Received at', type: 'datetime' },
  ],
  readOnly: true,
}
