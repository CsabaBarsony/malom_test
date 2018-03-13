const Website = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      items: [],
    }
  },

  getItems: function() {
    const self = this

    this.setState({loading: true})

    get('partner-contact-data/' + partnerId + '?contact_data_type=website')
      .then(function(data) {
        const items = data.map(function(d) {
          const result = {
            id: d.id,

            value: d.value,
            type_attribute: d.type_attribute,
            is_primary_type_item: !!d.is_primary_type_item,
          }

          return result
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
        new ListFormField('text', 'value', 'Weboldal'),
        new ListFormField('text', 'type_attribute', 'Típus'),
        new ListFormField('checkbox', 'is_primary_type_item', 'Elsődleges'),
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
            alert('Nem sikerült létrehozni a Weboldalt.')
            self.setState({loading: false})
          }
        }

        if(item.id) {
          const payload = {
            partner_id: Number(partnerId),
            contact_data: {
              contact_data_type: 'website',
              value: item.value,
              type_attribute: item.type_attribute || '',
              is_primary_type_item: !!item.is_primary_type_item,
            }
          }

          put(`partner-contact-data/${item.id}`, payload, callback)
        }
        else {
          const payload = {
            partner_id: Number(partnerId),
            contact_data: {
              contact_data_type: 'website',
              value: item.value,
              type_attribute: item.type_attribute || '',
              is_primary_type_item: !!item.is_primary_type_item,
            }
          }

          post('partner-contact-data', payload, callback)
        }
      },
      onRemove: function(id) {
        self.setState(function(state) {
          update(state, {
            loading: {
              $set: true,
            },
          })
        })
        remove(`partner-contact-data/${id}/${partnerId}`, null, function(success) {
          self.setState(function(state) {
            update(state, {
              loading: {
                $set: false,
              },
            })
          })

          if(!success) {
            console.error('Valami baj történt.')
          }
        })
      },
    })
  }
})
