const Website = createReactClass({
  render: function() {
    return React.createElement(ListForm, {
      fields: [
        new ListFormField('text', 'website', 'Weboldal'),
        new ListFormField('text', 'website_type', 'Típus'),
        new ListFormField('checkbox', 'primary', 'Elsődleges'),
      ],
      items: [
        {
          website: 'somewebsite.com',
          website_type: 'some type...',
          primary: true,
        },
      ],
    })
  }
})
