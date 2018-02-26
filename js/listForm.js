function ListFormField(type, key, title) {
  this.type = type
  this.key = key
  this.title = title
}

const ListFormEdit = createReactClass({
  getInitialState: function() {
    return {
      fields: this.props.fields,
      item: this.props.item,
    }
  },

  renderInput: function(type, key, value) {
    const self = this
    let input

    switch (type) {

      case 'text':
        input = React.createElement('input', {
          type: 'text',
          value: (value === null || value === undefined) ? '' : value,
          onChange: function(e) {
            const value = e.target.value

            self.setState(function(state) {
              return update(state, {
                item: {
                  [key]: {
                    $set: value,
                  },
                },
              })
            })
          },
        })
        break

      case 'select':
        input = React.createElement('select', {
          value: value || false,
          onChange: function(e) {
            const value = e.target.value

            self.setState(function(state) {
              return update(state, {
                item: {
                  [key]: {
                    $set: Number(value),
                  },
                },
              })
            })
          },
        },
          React.createElement('option'),
          masterData[key].map(function(option, index) {
            return React.createElement('option', {key: index, value: option.id}, option.name)
          })
        )
        break

      case 'checkbox':
        input = React.createElement('select', {
          type: 'checkbox',
          value: value,
          onChange: function(e) {
            const value = e.target.value === 'true'

            self.setState(function(state) {
              return update(state, {
                item: {
                  [key]: {
                    $set: value,
                  },
                },
              })
            })
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
    const fields = this.state.fields
    const item = this.state.item
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
          self.props.onSave(self.state.item, self.props.index)
        },
      }, 'Mentés'),
      React.createElement('button', {
        className: 'btn',
        onClick: function(e) {
          e.preventDefault()
          self.props.onCancel()
        },
      }, 'Mégse'),
    )
  }
})

const ListForm = createReactClass({
  getInitialState: function() {
    return {
      selectedItemIndex: null,
      isSelectedUnsaved: false,
      fields: this.props.fields,
      items: this.props.items,
    }
  },

  onEditButtonClick: function(index) {
    this.setState(function(state) {
      return update(state, {
        selectedItemIndex: {
          $set: index,
        },
      })
    })
  },

  onAddItemButtonClick: function() {
    let newItem = {}

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
        selectedItemIndex: {
          $set: state.items.length,
        },
        isSelectedUnsaved: {
          $set: true,
        },
      })
    })
  },

  render: function() {
    const fields = this.state.fields
    const items = this.state.items
    const self = this

    const listFormEdit = this.state.selectedItemIndex !== null && React.createElement(ListFormEdit, {
        fields: fields,
        item: items[this.state.selectedItemIndex],
        index: this.state.selectedItemIndex,
        onChange: self.onInputChange,
        onCancel: function() {
          self.setState(function(state) {
            if(state.isSelectedUnsaved) {
              return update(state, {
                selectedItemIndex: {
                  $set: null,
                },
                items: {
                  $splice: [[state.selectedItemIndex, 1]],
                },
                isSelectedUnsaved: {
                  $set: false,
                },
              })
            }
            else {
              return update(state, {
                selectedItemIndex: {
                  $set: null,
                },
                isSelectedUnsaved: {
                  $set: false,
                },
              })
            }
          })
        },
        onSave: self.props.onSave,
      })

    const addItemButton = this.state.selectedItemIndex === null && React.createElement('button', {
      className: 'btn',
      onClick: self.onAddItemButtonClick,
    }, 'Elem hozzáadása')

    if(this.state.loading) return React.createElement('div', null, 'Kérem, várjon egy pillanatot!')

    return React.createElement('div', null,
      React.createElement('table', {className: 'table'},
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'ID'),
            fields.map(function(field, index) {
              return React.createElement('th', {key: index}, field.title)
            }),
            self.state.selectedItemIndex === null ? React.createElement('th', null, 'Műveletek') : null,
          ),
        ),
        React.createElement('tbody', null,
          items.map(function(item, index) {
            if(!item) {
              console.warn('no item')
            }
            return React.createElement('tr', {key: index},
              React.createElement('td', null, item.id),
              fields.map(function(field, index) {
                let value

                switch (field.type) {
                  case 'text':
                    value = item[field.key]
                    break
                  case 'select':
                    if(!masterData[field.key]) {
                      console.error('Hiányzó masterData!')
                    }
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
              self.state.selectedItemIndex === null ? React.createElement('td', null,
                React.createElement('button', {
                  className: 'btn',
                  onClick: function() {
                    self.onEditButtonClick(index)
                  },
                }, 'Szerkesztés'),
                React.createElement('button', {
                  className: 'btn',
                  onClick: function() {
                    self.props.onRemove(item.id)
                  },
                }, 'Törlés'),
              ) : null
            )
          }),
        ),
      ),
      addItemButton,
      listFormEdit,
    )
  }
})
