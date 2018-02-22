const Administrators = createReactClass({
  render: function() {
    return React.createElement(ListForm, {
      fields: [
        new ListFormField('text', 'name', 'Név'),
        new ListFormField('text', 'position', 'Beosztás'),
        new ListFormField('text', 'competence', 'Ügyterület'),
        new ListFormField('text', 'phone', 'Telefonszám'),
        new ListFormField('text', 'email', 'E-mail'),
        new ListFormField('checkbox', 'is_primary', 'Elsődleges'),
      ],
      items: [],
    })
  }
})
