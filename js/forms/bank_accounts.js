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
        const items = data.map(function(d) {
          return d.bank_account_data
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
        function callback(success, item) {
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
        remove(`partner-bank-account-data/${partnerId}/${id}`, function(success) {
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
