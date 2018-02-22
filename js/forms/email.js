const Email = createReactClass({
  render: function() {
    return React.createElement(ListForm, {
      fields: [
        new ListFormField('text', 'email', 'E-mail'),
        new ListFormField('text', 'email_type', 'Típus'),
        new ListFormField('checkbox', 'primary', 'Elsődleges'),
      ],
      items: [
        {
          email: 'xxx@mail.com',
          email_type: 'some type...',
          primary: true,
        },
      ],
    })
  }
})
