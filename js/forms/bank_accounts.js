const BankAccounts = createReactClass({
  getInitialState: function() {
    return {
      loading: false,
      items: [],
    }
  },

  getItems: function() {
    const self = this

    this.setState({loading: true})

    get('partner-bank-account-data/' + partnerId)
      .then(function(data) {
        const items = data.map(function(bank) {
          return {
            id: bank.id,
            account_number: bank.account_number,
            swift_code: bank.swift_code,
            iban_code: bank.iban_code,
            bank_name_id: bank.formatted_master_data.bank ? bank.formatted_master_data.bank[0].id : null,
            currency_type_id: bank.formatted_master_data.currency ? bank.formatted_master_data.currency[0].id : null,
          }
        })

        self.setState(function(state) {
          return update(state, {
            loading: {
              $set: false,
            },
            items: {
              $set: items,
            },
          })
        })
      })
      .catch(function(e) {
        console.log(e)
      })
  },

  componentDidMount: function() {
    this.getItems()
  },

  render: function() {
    const self = this

    return this.state.loading ? React.createElement('div', null, 'Kérem, várjon!') : React.createElement(ListForm, {
      fields: [
        new ListFormField('text', 'account_number', 'Bankszámlaszám'),
        new ListFormField('text', 'swift_code', 'Swift'),
        new ListFormField('text', 'iban_code', 'IBAN'),
        new ListFormField('select', 'bank_name_id', 'Bank'),
        new ListFormField('select', 'currency_type_id', 'Pénznem'),
      ],
      items: this.state.items,
      onSave: function(item, index) {
        self.setState(function(state) {
          return update(state, {
            loading: {
              $set: true,
            },
          })
        })
        function callback(success, data) {
          const item = {
            id: data.id,
            account_number: data.account_number,
            swift_code: data.swift_code,
            iban_code: data.iban_code,
            bank_name_id: data.formatted_master_data.bank ? data.formatted_master_data.bank[0].id : null,
            currency_type_id: data.formatted_master_data.currency ? data.formatted_master_data.currency[0].id : null,
          }

          if(success) {
            self.setState(function(state) {
              return update(state, {
                loading: {
                  $set: false,
                },
                items: {
                  [index]: {
                    $set: item,
                  },
                },
              })
            })
          }
          else {
            console.log('Valami baj történt.')
          }
        }

        if(item.id) {
          put(`partner-bank-account-data/${partnerId}/${item.id}`, item, callback)
        }
        else {
          post('partner-bank-account-data/' + partnerId, item, callback)
        }
      },
      onRemove: function(id) {
        remove(`partner-bank-account-data/${partnerId}/${id}`, null, function(success) {
          if(success) {
            self.getItems()
          }
          else {
            console.error('Valami baj történt.')
          }
        })
      },
    })
  }
})
