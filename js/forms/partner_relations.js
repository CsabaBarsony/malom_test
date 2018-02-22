const PartnerRelations = createReactClass({
  render: function() {
    return React.createElement(ListForm, {
      fields: [
        new ListFormField('text', 'partner', 'Partner'),
        new ListFormField('text', 'partner_type', 'Partner kapcsolat típusa'),
      ],
      items: [],
    })
  }
})
