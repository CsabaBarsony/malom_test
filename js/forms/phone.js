const Phone = createReactClass({
  render: function() {
    return React.createElement(ListForm, {
      fields: [
        new ListFormField('text', 'phone_number', 'Telefonszám'),
        new ListFormField('select', 'country_code', 'Előhívó'),
      ],
      items: [
        {
          phone_number: '1234',
          country_code: 7885,
        },
        {
          phone_number: '666',
          country_code: 7854,
        }
      ],
    })
  }
})
