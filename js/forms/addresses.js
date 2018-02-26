const Addresses = createReactClass({
  getInitialState: function() {
    return {
      loading: false,
      items: [],
    }
  },

  getItems: function() {
    const self = this

    this.setState({loading: true})

    get('partner-addresses/' + partnerId)
      .then(function(data) {
        const items = data.map(function(d) {
          const result = {
            id: d.id,

            area: d.area,
            message: d.message,
            state: d.state,
            is_primary: d.is_primary,
            country_id: d.formatted_master_data.country ? d.formatted_master_data.country[0].id : null,
            county_id: d.formatted_master_data.county ? d.formatted_master_data.county[0].id : null,
            city_id: d.formatted_master_data.city ? d.formatted_master_data.city[0].id : null,
            zip_code_id: d.formatted_master_data.zip_code ? d.formatted_master_data.zip_code[0].id : null,
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
        new ListFormField('select', 'country_id', 'Ország'),
        new ListFormField('select', 'county_id', 'Megye'),
        new ListFormField('select', 'zip_code_id', 'Irányítószám'),
        new ListFormField('select', 'city_id', 'Város'),
        new ListFormField('text', 'area', 'Közterület'),
        new ListFormField('text', 'message', 'Üzenet'),
        new ListFormField('checkbox', 'state', 'Állapot'),
        new ListFormField('checkbox', 'is_primary', 'Elsődleges'),
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
            alert('Nem sikerült létrehozni az ügyintézőt.')
            self.setState({loading: false})
          }
        }

        if(item.id) {
          item.partner_id = Number(partnerId)

          put(`partner-addresses/${item.id}`, item, callback)
        }
        else {
          const payload = {
            partner_id: Number(partnerId),
            area: item.area,
            is_primary: item.is_primary,
            message: item.message,
            state: item.state,
          }

          if(item.country_id) payload.country_id = item.country_id
          if(item.county_id) payload.county_id = item.county_id
          if(item.zip_code_id) payload.zip_code_id = item.zip_code_id
          if(item.city_id) payload.city_id = item.city_id

          post('partner-addresses', payload, callback)
        }
      },
      onRemove: function(id) {
        remove(`partner-addresses/${partnerId}/${id}`, null, function(success) {
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
