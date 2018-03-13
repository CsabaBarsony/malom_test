const PartnerRelations = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      items: [],
    }
  },

  getItems: function() {
    const self = this

    this.setState({loading: true})

    get('partner-connections/' + partnerId)
      .then(function(data) {
        const items = data.map(function(d) {
          const result = {
            id: d.id,

            parent_id: d.parent_id,
            partner_id: d.child_id,
            partner_relation_type_id: d.connection_types.length ? d.connection_types.map(function(c) {
              return c.connection_type_master_id
            }) : [],
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
          const payload = {
            connection_type_ids: item.partner_relation_type_id,
          }

          put(`partner-connections/${item.child_id}`, payload, function(success) {
            console.log(success)
          })
        }
        else {
          const payload = {
            parent_id: Number(partnerId),
            child_id: item.partner_id,
            connection_type_ids: item.partner_relation_type_id,
          }

          post('partner-connections', payload, function(success) {
            console.log(success)
          })
        }
      },
      onRemove: function(id) {
        remove(`partner-connections/${id}`, null, function(success) {
          if(!success) {
            console.error('Valami baj történt.')
          }
        })
      },
    })
  }
})
