const PartnerRelations = createReactClass({
  getInitialState: function() {
    return {
      loading: false,
      items: [],
    }
  },

  render: function() {
    const self = this

    return this.state.loading ? React.createElement('div', null, 'Kérem, várjon!') :  React.createElement(ListForm, {
      fields: [
        new ListFormField('select', 'partner_id', 'Partner neve'),
        // new ListFormField('text', 'partner_type', 'Partner kapcsolat típusa'),
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
            alert('Nem sikerült létrehozni a Telefonszámot.')
            self.setState({loading: false})
          }
        }

        const payload = {
          partner_id: Number(partnerId),
          contact_data: {
            contact_data_type: 'phone',
            value: item.value,
            type_id: item.phone_number_type,
            is_primary_type_item: item.is_primary_type_item,
            country_code_id: item.country_code_id,
          }
        }

        if(item.id) {
          put(`partner-contact-data/${item.id}`, payload, callback)
        }
        else {
          post('partner-contact-data', payload, callback)
        }
      },
      onRemove: function(id) {
        remove(`partner-contact-data`, function(success) {
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
