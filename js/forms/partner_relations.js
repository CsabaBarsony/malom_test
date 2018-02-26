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
        new ListFormField('multiselect', 'partner_relation_type_id', 'Partner kapcsolat típusai'),
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

        if(item.id) {
          debugger
          put(`partner-connections/${item.id}`, payload, callback)
        }
        else {
          const payload = {
            parent_id: partnerId,
            child_id: item.partner_id,
            connection_type_ids: item.partner_relation_type_id,
          }

          post('partner-connections', payload, function(success) {
            debugger
          })
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
