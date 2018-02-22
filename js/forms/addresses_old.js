function Address(props) {
  props = props || {}

  this.country_id = props.country_id
  this.county_id = props.county_id
  this.zip_code_id = props.zip_code_id
  this.city_id = props.city_id
  this.area = props.area
  this.message = props.message
  this.state = props.state
  this.is_primary_contact_item = props.is_primary_contact_item
  this.is_primary_type_item = props.is_primary_type_item
  this.is_mailing_address = props.is_mailing_address
}

const Addresses = createReactClass({
  getInitialState: function() {
    const addresses = partner.addresses.map(function(address) {
      const masterData = address.formatted_master_data || {}
      const attributes = address.attributes || {}

      return {
        'country_id': masterData.country ? masterData.country[0].id : '',
        'county_id': masterData.county ? masterData.county[0].id : '',
        'zip_code_id': masterData.zip_code ? masterData.zip_code[0].id : '',
        'city_id': masterData.city ? masterData.city[0].id : '',
        'area': address.area ? address.area : '',
        'message': address.message ? address.message : '',
        'state': !!address.state,
        'is_primary_contact_item': !!attributes.is_primary_contact_item,
        'is_primary_type_item': !!attributes.is_primary_type_item,
        'is_mailing_address': !!attributes.is_mailing_address,
      }
    })

    return {
      addresses: addresses,
    }
  },

  addAddress: function() {
    this.setState(function(state) {
      return update(state, {
        addresses: {
          $push: [new Address()],
        },
      })
    })
  },

  editAddress: function(index, value, type) {
    this.setState(function(state) {
      return update(state, {
        addresses: {
          [index]: {
            [type]: {
              $set: value,
            },
          },
        },
      })
    })
  },

  deleteAddress: function(index) {
    this.setState(function(state) {
      return update(state, {
        addresses: {
          $splice: [[index, 1]],
        },
      })
    })
  },

  save: function() {
    const payload = {
      _method: 'PUT',
    }

    if (!!partner.short_name) {
      payload.short_name = partner.short_name
    }

    if (!!partner.long_name) {
      payload.long_name = partner.long_name
    }

    if (!!partner.tax_number) {
      payload.tax_number = partner.tax_number
    }

    if (!!partner.public_tax_number) {
      payload.tax_number = partner.public_tax_number
    }

    if (!!partner.company_registration_number) {
      payload.company_registration_number = partner.company_registration_number
    }

    const addressPayload = this.state.addresses.map(function(address) {
      const result = {}

      _.each(address, function(value, key) {
        if(value !== '') {
          result[key] = value
        }
      })

      return result
    })

    payload.addresses = addressPayload

    post('partners/' + partnerId, payload, function(success) {
      if(success) {
        alert('Sikeresen mentve')
      }
      else {
        alert('Hiba történt mentés közben')
      }
    })
  },

  render: function() {
    return React.createElement('div', null,
        React.createElement(AddressesTable, {
          addresses: this.state.addresses,
          editAddress: this.editAddress,
          deleteAddress: this.deleteAddress,
        }),
        React.createElement('button', {onClick: this.addAddress}, 'Cím hozzáadása'),
        React.createElement('button', {onClick: this.save}, 'Mentés'),
      )
  }
})

const AddressesTable = createReactClass({
  getInitialState: function() {
    return {
      headings: [
        'Ország',
        'Megye',
        'Irányítószám',
        'Város',
        'Közterület',
        'Üzenet',
        'Állapot',
        'Kapcs. elem',
        'Típus elem',
        'Hírlevél',
        '',
      ],
      editingRowIndex: null,
    }
  },

  onEditClick: function(index) {
    this.setState(function(state) {
      return update(state, {
        editingRowIndex: {
          $set: index,
        },
      })
    })
  },

  onCancelClick: function() {
    this.setState(function(state) {
      return update(state, {
        editingRowIndex: {
          $set: null,
        },
      })
    })
  },

  render: function() {
    const self = this

    return React.createElement('table', {className: 'table'},
      React.createElement('thead', null,
        React.createElement('tr', null,
          this.state.headings.map(function(heading, index) {
            return React.createElement('th', {key: index}, heading)
          })
        )
      ),
      React.createElement('tbody', null,
        this.props.addresses.map(function(address, index) {
          const editing = index === self.state.editingRowIndex

          const select = function(value, list, type) {
            const options = list.map(function(country, index) {
              return React.createElement('option', {key: index, value: country.id}, country.name)
            })

            return React.createElement('td', null,
              React.createElement('select', {
                  value: value,
                  disabled: !editing,
                  onChange: function(e) {
                    self.props.editAddress(index, Number(e.target.value), type)
                  }
                },
                React.createElement('option'),
                options,
              )
            )
          }

          const text = function(value, type) {
            return React.createElement('td', null,
              React.createElement('input', {
                type: 'text',
                value: value || '',
                onChange: function(e) {
                  self.props.editAddress(index, e.target.value, type)
                },
                disabled: !editing,
              }),
            )
          }

          const checkbox = function(checked, type) {
            return React.createElement('td', null,
              React.createElement('input', {
                type: 'checkbox',
                checked: checked,
                onChange: function(e) {
                  self.props.editAddress(index, e.target.checked, type)
                },
                disabled: !editing,
              })
            )
          }

          let editButton = null
          let deleteButton = null
          let cancelButton = null

          if(editing) {
            deleteButton = React.createElement('button', {onClick: function() {
              self.props.deleteAddress(index)
              self.onCancelClick()
            }}, 'Törlés')
            cancelButton = React.createElement('button', {onClick: self.onCancelClick}, 'Mégse')
          }
          else {
            editButton = React.createElement('button', {onClick: function() {self.onEditClick(index)}}, 'Szerkesztés')
          }

          return React.createElement('tr', {key: index},
            select(address.country_id, masterData.country, 'country_id'),
            select(address.county_id, masterData.county, 'county_id'),
            select(address.zip_code_id, masterData.zip_code, 'zip_code_id'),
            select(address.city_id, masterData.city_code, 'city_id'),
            text(address.area, 'area'),
            text(address.message, 'message'),
            checkbox(address.state, 'state'),
            checkbox(address.is_primary_contact_item, 'is_primary_contact_item'),
            checkbox(address.is_primary_type_item, 'is_primary_type_item'),
            checkbox(address.is_mailing_address, 'is_mailing_address'),
            React.createElement('td', null,
              editButton,
              deleteButton,
              cancelButton,
            ),
          )
        })
      )
    )
  }
})
