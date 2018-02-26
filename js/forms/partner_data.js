const PartnerData = createReactClass({
  getInitialState: function() {
    return {
      loading: false,
      form: {
        id: partner.partner.id,
        short_name: partner.partner.short_name,
        long_name: partner.partner.long_name,
        tax_number: partner.partner.tax_number,
        public_tax_number: partner.partner.public_tax_number,
        company_registration_number: partner.partner.company_registration_number,
      },
    }
  },

  onSave: function(e) {
    e.preventDefault()
    put('partners/' + partnerId, this.state.form, function(success) {
      if(success) alert('Sikeres partner adat változtatás.')
    })
  },

  render: function() {
    const self = this

    let phone = ''
    let email = ''
    let website = ''

    _.each(partner.primaryContactData, function(data) {
      if(data.type === 'phone') {
        phone = data.value
      }
      else if(data.type === 'email') {
        email = data.value
      }
      else if(data.type === 'website') {
        website = data.value
      }
    })

    const displays = {
      bankAccountNumber: partner.primaryBankAccount.account_number,
      area: (partner.primaryAddress && partner.primaryAddress.length) ? partner.primaryAddress[0].area : '',
      phone: phone,
      email: email,
      website: website,
      primaryAdmin: '',
    }

    function renderInput(key, value, title) {
      return React.createElement('div', {
          className: 'form-group row',
        },
        React.createElement('label', {className: 'col-6 col-form-label'}, title),
        React.createElement('div', {className: 'col-6 list_form_edit-input'},
          React.createElement('input', {value: value, onChange: function(e) {
              const value = e.target.value

              self.setState(function(state) {
                return update(state, {
                  form: {
                    [key]: {
                      $set: value,
                    },
                  },
                })
              })
            }
          })
        ),
      )
    }

    function renderDisplay(key, value) {
      return React.createElement('div', {
          className: 'form-group row',
        },
        React.createElement('label', {className: 'col-6 col-form-label'}, key),
        React.createElement('span', {className: 'col-6 list_form_edit-input col-form-label'},
          value ? value : 'nincs megadva'
        ),
      )
    }

    return React.createElement('form', {
      className: 'form-horizontal',
    },
      React.createElement('div', {className: 'row'},
        React.createElement('div', {
            className: 'col',
          },
          renderInput('short_name', self.state.form.short_name, 'Partner rövid neve'),
          renderInput('long_name', self.state.form.long_name, 'Partner hosszú neve'),
          renderInput('tax_number', self.state.form.tax_number, 'Adószám'),
          renderInput('public_tax_number', self.state.form.public_tax_number, 'Közösségi adószám'),
          renderInput('company_registration_number', self.state.form.company_registration_number, 'Cégjegyzékszám'),
        ),

        React.createElement('div', {
            className: 'col',
          },
          renderDisplay('Bankszámlaszám', displays.bankAccountNumber),
          renderDisplay('Székhely', displays.area),
          renderDisplay('Telefonszám', displays.phone),
          renderDisplay('E-mail', displays.email),
          renderDisplay('Weblap', displays.website),
          renderDisplay('Elsődleges ügyintéző', null),
        ),
      ),


      React.createElement('button', {
        className: 'btn',
        onClick: self.onSave,
      }, 'Mentés')
    )
  },
})
