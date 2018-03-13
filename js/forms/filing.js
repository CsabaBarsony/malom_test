const Filing = createReactClass({
  getInitialState: function() {
    return {
      loading: false,
      items: [],
      registration_id: null,
    }
  },

  getItems: function() {
    const self = this

    this.setState({loading: true})

    Promise.all([
      get(`document-registration-in/${companyId}`),
      get(`document-registration-in/${companyId}/create`),
    ]).then(function(data) {
      const items = data[0].map(function(filing) {
        return {
          id: filing.id,
          partner_id: filing.sender_partner_id,
          recipient_id: Number(filing.recipient_partner_id),
          arrival_method_id: filing.formatted_master_data.arrival_method[0].id,
          status_id: filing.formatted_master_data.status[0].id,
          topic_id: filing.formatted_master_data.topic[0].id,
          message: filing.message,
          subject: filing.subject,
          date: filing.date,
          deadline: filing.deadline,
        }
      })

      self.setState(function(state) {
        return update(state, {
          loading: {
            $set: false,
          },
          registration_id: {
            $set: data[1].registration_id.documentRegistrationNextId,
          },
          items: {
            $set: items,
          },
        })
      })
    })
  },

  componentDidMount: function() {
    this.getItems()
  },

  render: function() {
    const self = this

    return this.state.loading ? React.createElement('div', null, 'Kérem, várjon!') : React.createElement(ListForm, {
      fields: [
        new ListFormField('select', 'partner_id', 'Beküldő partner'),
        new ListFormField('date', 'date', 'Dátum'),
        new ListFormField('select', 'recipient_id', 'Címzett'),
        new ListFormField('select', 'arrival_method_id', 'Érkezés módja'),
        new ListFormField('select', 'status_id', 'Státusz'),
        new ListFormField('select', 'topic_id', 'Téma'),
        new ListFormField('text', 'message', 'Megjegyzés'),
        new ListFormField('text', 'subject', 'Tárgy'),
        new ListFormField('date', 'deadline', 'Ügyintézési határidő'),
      ],
      options: {
        details: {
          label: 'Linkek',
          component: React.createElement('div', null, 'majom vagy'),
        },
      },
      items: this.state.items,
      onSave: function(item, index) {
        const payload = {
          sender_partner_id: item.partner_id,
          recipient_partner_id: item.recipient_id,
          date: moment(item.date).format('YYYY-MM-DD hh:mm:ss'),
          deadline: moment(item.deadline).format('YYYY-MM-DD hh:mm:ss'),
          message: item.message,
          subject: item.subject,
          arrival_method_master_data_id: item.arrival_method_id,
          state_master_data_id: item.status_id,
          topic_master_data_id: item.topic_id,
          registration_id: self.state.registration_id,
        }

        self.setState(function(state) {
          return update(state, {
            loading: {
              $set: true,
            },
          })
        })
        function callback(success) {
          if(success) {
            alert('Iktatás sikeresen létrehozva')
            self.setState(function(state) {
              return update(state, {
                loading: {
                  $set: false,
                },
              })
            })
          }
          else {
            console.log('Valami baj történt.')
          }
        }

        if(item.id) {
          payload.id = item.id
          put(`document-registration-in/${companyId}/${item.id}`, payload, callback)
        }
        else {
          post(`document-registration-in/${companyId}`, payload, callback)
        }
      },
      onRemove: function(id) {
        remove(`document-registration-in/${companyId}/${id}`, null, function(success) {
          if(success) {
            alert('Iktatás sikeresen törölve')
          }
          else {
            console.error('Valami baj történt.')
          }
        })
      },
    })
  }
})
