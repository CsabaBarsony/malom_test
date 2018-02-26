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
            website_type: d.type_id,
            is_primary_type_item: d.is_primary_type_item,
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
    return React.createElement(ListForm, {
      fields: [
        new ListFormField('text', 'value', 'Weboldal'),
        new ListFormField('text', 'website_type', 'Típus'),
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

        const payload = {
          partner_id: Number(partnerId),
          contact_data: {
            contact_data_type: 'website',
            value: item.value,
            type_id: item.website_type,
            is_primary_type_item: item.is_primary_type_item,
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
        remove(`partner-contact-data`, null, function(success) {
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
