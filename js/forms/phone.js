const Phone = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      items: [],
    }
  },

  getItems: function() {
    const self = this

    this.setState({loading: true})

    get('partner-contact-data/' + partnerId + '?contact_data_type=phone')
      .then(function(data) {
        const items = data.map(function(d) {
          const result = {
            id: d.id,

            value: d.value,
            type_attribute: d.type_attribute,
            is_primary_type_item: !!d.is_primary_type_item,
            country_code_id: d.formatted_master_data.country_code ? d.formatted_master_data.country_code[0].id : null,
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
        new ListFormField('text', 'value', 'Telefonszám'),
        new ListFormField('select', 'country_code_id', 'Előhívó'),
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

        function callback(success, data) {
          if(success) {
            const item = {
              id: data.id,

              value: data.value,
              type_attribute: data.type_attribute,
              is_primary_type_item: !!data.is_primary_type_item,
              country_code_id: data.formatted_master_data.country_code ? data.formatted_master_data.country_code[0].id : null,
            }

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

        if(item.id) {
          const payload = {
            partner_id: Number(partnerId),
            contact_data: {
              contact_data_type: 'phone',
              value: item.value,
              type_attribute: item.type_attribute,
              is_primary_type_item: !!item.is_primary_type_item,
              country_code_id: item.country_code_id,
              phone_number_type_id: item.phone_number_type,
              // ide jön majd a master_data.country_code_id
            }
          }

          put(`partner-contact-data/${item.id}`, payload, callback)
        }
        else {
          const payload = {
            partner_id: Number(partnerId),
            contact_data: {
              contact_data_type: 'phone',
              value: item.value,
              type_attribute: item.type_attribute,
              is_primary_type_item: !!item.is_primary_type_item,
              country_code_id: item.country_code_id,
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
