const Administrators = createReactClass({
  getInitialState: function() {
    return {
      loading: false,
      items: [],
    }
  },

  getItems: function() {
    const self = this

    this.setState({loading: true})

    get('partner-administrators/' + partnerId)
      .then(function(data) {
        const items = data.map(function(d) {
          const result = {
            id: d.id,
            person_id: d.person.id,
            position_id: d.formatted_partner_meta_data.position ? d.formatted_partner_meta_data.position.id : null,
            competence_id: d.formatted_partner_meta_data.competence ? d.formatted_partner_meta_data.competence.id : null,
            country_code_id: d.formatted_partner_meta_data.phone_country_code ? d.formatted_partner_meta_data.phone_country_code.id : null,
            phone: d.phone_number,
            email: d.email_address,
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
        new ListFormField('select', 'person_id', 'Név'),
        new ListFormField('select', 'position_id', 'Beosztás'),
        new ListFormField('select', 'competence_id', 'Ügyterület'),
        new ListFormField('select', 'country_code_id', 'Ország előhívó'),
        new ListFormField('text', 'phone', 'Telefonszám'),
        new ListFormField('text', 'email', 'E-mail'),
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

        function callback(success, data) {
          const item = {
            id: data.id,
            person_id: data.person.id,
            position_id: data.formatted_partner_meta_data.position ? data.formatted_partner_meta_data.position.id : null,
            competence_id: data.formatted_partner_meta_data.competence ? data.formatted_partner_meta_data.competence.id : null,
            country_code_id: data.formatted_partner_meta_data.phone_country_code ? data.formatted_partner_meta_data.phone_country_code.id : null,
            phone: data.phone_number,
            email: data.email_address,
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
            alert('Nem sikerült létrehozni az ügyintézőt.')
            self.setState({loading: false})
          }
        }

        if(item.id) {
          put(`partner-administrators/${partnerId}/${item.id}`, item, callback)
        }
        else {
          post('partner-administrators/' + partnerId, item, callback)
        }
      },
      onRemove: function(id) {
        remove(`partner-administrators/${id}`, null, function(success) {
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
