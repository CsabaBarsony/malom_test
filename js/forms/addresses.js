const Addresses = createReactClass({
  render: function() {
    return React.createElement(ListForm, {
      fields: [
        new ListFormField('select', 'country', 'Ország'),
        new ListFormField('select', 'county', 'Megye'),
        new ListFormField('select', 'zip_code', 'Irányítószám'),
        new ListFormField('select', 'city_code', 'Város'),
        new ListFormField('text', 'area', 'Közterület'),
        new ListFormField('text', 'message', 'Üzenet'),
        new ListFormField('checkbox', 'state', 'Állapot'),
        new ListFormField('checkbox', 'is_primary_contact_item', 'Kapcsolódó elem'),
        new ListFormField('checkbox', 'is_primary_type_item', 'Típus elem'),
        new ListFormField('checkbox', 'is_mailing_address', 'Feliratkozó'),
      ],
      items: [
        {
          country: 123,
          county: 123,
          zip_code: 123,
          city_code: 123,
          area: 'area text',
          message: 'message text',
          state: false,
          is_primary_contact_item: true,
          is_primary_type_item: false,
          is_mailing_address: false,
        },
      ],
    })
  }
})
