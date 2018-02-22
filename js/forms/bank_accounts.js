const BankAccounts = createReactClass({
  render: function() {
    return React.createElement(ListForm, {
      fields: [
        new ListFormField('text', 'name', 'Bank'),
        new ListFormField('text', 'bank_account_number', 'Bankszámlaszám'),
        new ListFormField('text', 'iban', 'IBAN'),
        new ListFormField('text', 'swift', 'Swift'),
        new ListFormField('text', 'currency', 'Pénznem'),
        new ListFormField('text', 'is_primary', 'Elsődleges'),
      ],
      items: [],
    })
  }
})
