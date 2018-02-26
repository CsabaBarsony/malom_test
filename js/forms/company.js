const Company = createReactClass({
  getInitialState: function() {
    return {
      loading: false,
      prefix: '',
      isCompany: false,
    }
  },

  render: function() {
    const self = this

    return this.state.loading ? React.createElement('div', null, 'Kérem, várjon!') : React.createElement('form', {
        className: 'form-horizontal',
        onSubmit: function(e) {
          e.preventDefault()
        },
      },

      React.createElement('div', {
          className: 'form-group row',
        },
        React.createElement('label', {className: 'col-6 col-form-label'}, 'Előtag'),
        React.createElement('div', {className: 'col-6 list_form_edit-input'},
          React.createElement('input', {
            type: 'text',
            value: self.state.prefix,
            onChange: function(e) {
              const value = e.target.value

              self.setState(function(state) {
                return update(state, {
                  prefix: {
                    $set: value,
                  },
                })
              })
            },
          }),
        ),
      ),

      React.createElement('div', {
          className: 'form-group row',
        },
        React.createElement('label', {className: 'col-6 col-form-label'}, 'Társaság'),

        React.createElement('div', {className: 'col-6 list_form_edit-input'},
          React.createElement('select', {
              type: 'checkbox',
              value: self.state.isCompany,
              onChange: function(e) {
                const value = e.target.value === 'true'

                self.setState(function(state) {
                  return update(state, {
                    isCompany: {
                      $set: value,
                    },
                  })
                })
              },
            },
            React.createElement('option', {value: true}, 'igen'),
            React.createElement('option', {value: false}, 'nem'),
          ),
        )
      ),
      React.createElement('button', {
        onClick: function() {
          self.setState(function(state) {
            return update(state, {
              loading: {
                $set: true,
              },
            })
          })

          put('partner-company-data/' + partnerId, {
            prefix: self.state.prefix,
            is_company: self.state.isCompany,
          }, function(result) {
            self.setState(function(state) {
              return update(state, {
                loading: {
                  $set: false,
                },
              })
            })
          })
        }
      }, 'Mentés')
    )
  },
})
