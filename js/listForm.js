function ListFormField(type, key, title) {
  this.type = type
  this.key = key
  this.title = title
}

const ListFormEdit = createReactClass({
  renderInput: function(type, key, value) {
    const self = this
    let input

    switch (type) {

      case 'text':
        input = React.createElement('input', {
          type: 'text',
          value: value || '',
          onChange: function(e) {
            self.props.onChange(self.props.index, key, e.target.value)
          },
        })
        break

      case 'select':
        input = React.createElement('select', {
          value: value || false,
          onChange: function(e) {
            self.props.onChange(self.props.index, key, e.target.value)
          },
        }, masterData[key].map(function(option, index) {
          return React.createElement('option', {key: index, value: option.id}, option.name)
        }))
        break

      case 'checkbox':
        input = React.createElement('select', {
          type: 'checkbox',
          value: value,
          onChange: function(e) {
            const value = e.target.value === 'true'

            self.props.onChange(self.props.index, key, value)
          },
        },
          React.createElement('option', {value: true}, 'igen'),
          React.createElement('option', {value: false}, 'nem'),
        )
        break

      default:
        console.warn('Nincs, vagy helytelen input type!')
        break
    }

    return React.createElement('div', {className: 'col-6 list_form_edit-input'}, input)
  },

  render: function() {
    const fields = this.props.fields || []
    const item = this.props.item || {}
    const self = this

    return React.createElement('form', {
        className: 'form-horizontal',
        onSubmit: function(e) {
          e.preventDefault()
        },
      },
      fields.map(function(field, index) {
        return React.createElement('div', {
            key: index,
            className: 'form-group row',
          },
          React.createElement('label', {className: 'col-6 col-form-label'}, field.title),
          self.renderInput(field.type, field.key, item[field.key])
        )
      }),
      React.createElement('button', {
        className: 'btn',
        onClick: function(e) {
          e.preventDefault()
          self.props.onSave(self.props.index)
        },
      }, 'Kész'),
      React.createElement('button', {
        className: 'btn',
        onClick: function(e) {
          e.preventDefault()
          self.props.onCancel(self.props.item._unsaved)
        },
      }, 'Mégse'),
    )
  }
})

const ListForm = createReactClass({
  getInitialState: function() {
    return {
      selectedFieldIndex: null,
      fields: this.props.fields || [],
      items: this.props.items || [],
    }
  },

  onEditButtonClick: function(index) {
    this.setState(function(state) {
      return update(state, {
        selectedFieldIndex: {
          $set: index,
        },
      })
    })
  },



  onInputChange: function(index, key, value) {
    this.setState(function(state) {
      return update(state, {
        items: {
          [index]: {
            [key]: {
              $set: value,
            },
          },
        },
      })
    })
  },

  onAddItemButtonClick: function() {
    let newItem = {
      _unsaved: true,
    }

    _.each(this.props.fields, function(field) {
      let value = ''

      switch (field.type) {
        case 'text':
          value = ''
          break
        case 'select':
          value = ''
          break
        case 'checkbox':
          value = false
          break
      }

      newItem[field.key] = value
    })

    this.setState(function(state) {
      return update(state, {
        items: {
          $push: [newItem],
        },
        selectedFieldIndex: {
          $set: state.items.length,
        },
      })
    })
  },

  onRemove: function(index) {
    this.setState(function(state) {
      return update(state, {
        items: {
          $splice: [[index, 1]],
        },
      })
    })
  },

  render: function() {
    const fields = this.state.fields
    const items = this.state.items
    const self = this

    const listFormEdit = this.state.selectedFieldIndex !== null && React.createElement(ListFormEdit, {
        fields: fields,
        item: items[this.state.selectedFieldIndex],
        index: this.state.selectedFieldIndex,
        onChange: self.onInputChange,
        onCancel: function(isUnsaved, index) {
          if(isUnsaved) {
            self.setState(function(state) {
              const result = update(state, {
                selectedFieldIndex: {
                  $set: null,
                },
                items: {
                  $splice: [[state.selectedFieldIndex, 1]]
                },
              })

              return result
            })
          }
          else {
            self.setState({selectedFieldIndex: null})
          }
        },
        onSave: function(index) {
          self.setState(function(state) {
            return update(state, {
              selectedFieldIndex: {
                $set: null,
              },
              items: {
                [index]: {
                  _unsaved: {
                    $set: false,
                  },
                },
              },
            })
          })
        },
      })

    const addItemButton = this.state.selectedFieldIndex === null && React.createElement('button', {
      className: 'btn',
      onClick: self.onAddItemButtonClick,
    }, 'Elem hozzáadása')

    const saveButton = this.state.selectedFieldIndex === null && React.createElement('button', {
      className: 'btn',
      onClick: function() {
        console.log(self.state.items)
      },
    }, 'Mentés')

    return React.createElement('div', null,
      React.createElement('table', {className: 'table'},
        React.createElement('thead', null,
          React.createElement('tr', null,
            fields.map(function(field, index) {
              return React.createElement('th', {key: index}, field.title)
            }),
            self.state.selectedFieldIndex === null ? React.createElement('th', null, 'Műveletek') : null,
          ),
        ),
        React.createElement('tbody', null,
          items.map(function(item, index) {
            if(item._unsaved) return null

            return React.createElement('tr', {key: index},
              fields.map(function(field, index) {
                let value = null

                switch (field.type) {
                  case 'text':
                    value = item[field.key]
                    break
                  case 'select':
                    const d = masterData[field.key].find(function(data) {
                      return data.id === Number(item[field.key])
                    })

                    value = d ? d.name : ''
                    break
                  case 'checkbox':
                    value = item[field.key] ? 'igen' : 'nem'
                    break
                }

                return React.createElement('td', {key: index}, value)
              }),
              self.state.selectedFieldIndex === null ? React.createElement('td', null,
                React.createElement('button', {
                  className: 'btn',
                  onClick: function() {
                    self.onEditButtonClick(index)
                  },
                }, 'Szerkesztés'),
                React.createElement('button', {
                  className: 'btn',
                  onClick: function() {
                    self.onRemove(index)
                  },
                }, 'Törlés'),
              ) : null
            )
          }),
        ),
      ),
      addItemButton,
      saveButton,
      listFormEdit,
    )
  }
})
