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
          arrival_method_id: filing.arrival_method_id,
          status_id: filing.status_id,
          topic_id: filing.topic_id,
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
          content: FilingDetailsContent,
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

const FilingDetailsPartners = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      partners: [],
    }
  },
  componentDidMount: function() {
    const self = this

    get('partners').then(function(data) {
      const partners = data.map(function(partner) {
        const isConnected = self.props.filing.partners.find(function(filingPartner) {
          return filingPartner.id === partner.id
        })

        return {
          partner: partner,
          checked: !!isConnected,
        }
      })

      self.setState({
        loading: false,
        partners: partners,
      })
    })
  },
  render: function() {
    const self = this

    const saveButton = React.createElement('button', {
      className: 'btn',
      onClick: function() {
        self.setState({loading: true})
        const payload = {
          partners: []
        }
        _.each(self.state.partners, function(partner) {
          if(partner.checked) payload.partners.push(partner.partner.id)
        })

        post(`document-registration-in/${companyId}/${self.props.filing.id}/link/partner`, payload, function(success) {
          if(success) alert('Sikerült a hozzárendelés')
          else alert('Hiba hozzárendelés közben')
          self.setState({loading: false})
        })
      },
    }, 'Mentés')

    return self.state.loading ? React.createElement('div', null, 'Kérem, várjon!') : React.createElement('div', null,
      saveButton,
      self.state.partners.map(function(partnerItem, index) {
        return React.createElement('div', {key: index, className: 'container'},
          React.createElement('div', {className: 'row'},
            React.createElement('div', {className: 'col'},
              React.createElement('input', {
                type: 'checkbox',
                onChange: function(e) {
                  const checked = e.target.checked

                  self.setState(function(state) {
                    return update(state, {
                      partners: {
                        [index]: {
                          checked: {
                            $set: checked,
                          },
                        },
                      },
                    })
                  })
                },
                checked: partnerItem.checked,
              }),
            ),
            React.createElement('div', {className: 'col'},
              React.createElement('span', null, partnerItem.partner.short_name),
            ),
          ),
        )
      }),
    )
  },
})

const FilingDetailsEstates = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      items: [],
    }
  },
  componentDidMount: function() {
    const self = this

    get(`estates`).then(function(data) {
      const estates = data.map(function(estate) {
        const isConnected = self.props.filing.estates.find(function(filingEstate) {
          return filingEstate.id === estate.id
        })

        return {
          data: estate,
          checked: !!isConnected,
        }
      })

      self.setState({
        loading: false,
        items: estates,
      })
    })
  },
  render: function() {
    const self = this

    const saveButton = React.createElement('button', {
      className: 'btn',
      onClick: function() {
        self.setState({loading: true})
        const payload = {
          estates: []
        }
        _.each(self.state.items, function(item) {
          if(item.checked) payload.estates.push(item.data.id)
        })

        post(`document-registration-in/${companyId}/${self.props.filing.id}/link/estate`, payload, function(success) {
          if(success) alert('Sikerült a hozzárendelés')
          else alert('Hiba hozzárendelés közben')
          self.setState({loading: false})
        })
      },
    }, 'Mentés')

    return self.state.loading ? React.createElement('div', null, 'Kérem, várjon!') : React.createElement('div', null,
      saveButton,
      self.state.items.map(function(item, index) {
        return React.createElement('div', {key: index, className: 'container'},
          React.createElement('div', {className: 'row'},
            React.createElement('div', {className: 'col'},
              React.createElement('input', {
                type: 'checkbox',
                onChange: function(e) {
                  const checked = e.target.checked

                  self.setState(function(state) {
                    return update(state, {
                      items: {
                        [index]: {
                          checked: {
                            $set: checked,
                          },
                        },
                      },
                    })
                  })
                },
                checked: item.checked,
              }),
            ),
            React.createElement('div', {className: 'col'},
              React.createElement('span', null, item.data.name),
            ),
          ),
        )
      }),
    )
  },
})

const FilingDetailsDocuments = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      items: [],
    }
  },
  componentDidMount: function() {
    const self = this

    get(`documents/${companyId}/document_libraries`).then(function(data) {
      const libraryId = data[0].id

      get(`documents/${companyId}/${libraryId}`).then(function(data) {
        const documents = data.map(function(document) {
          const isConnected = self.props.filing.documents.find(function(filingDocument) {
            return filingDocument.id === document.id
          })

          return {
            data: document,
            checked: !!isConnected,
          }
        })

        self.setState({
          loading: false,
          items: documents,
        })
      })
    })
  },
  render: function() {
    const self = this

    const saveButton = React.createElement('button', {
      className: 'btn',
      onClick: function() {
        self.setState({loading: true})
        const payload = {
          documents: []
        }
        _.each(self.state.items, function(item) {
          if(item.checked) payload.documents.push(item.data.id)
        })

        post(`document-registration-in/${companyId}/${self.props.filing.id}/link/document`, payload, function(success) {
          if(success) alert('Sikerült a hozzárendelés')
          else alert('Hiba hozzárendelés közben')
          self.setState({loading: false})
        })
      },
    }, 'Mentés')

    return self.state.loading ? React.createElement('div', null, 'Kérem, várjon!') : React.createElement('div', null,
      saveButton,
      self.state.items.map(function(item, index) {
        return React.createElement('div', {key: index, className: 'container'},
          React.createElement('div', {className: 'row'},
            React.createElement('div', {className: 'col'},
              React.createElement('input', {
                type: 'checkbox',
                onChange: function(e) {
                  const checked = e.target.checked

                  self.setState(function(state) {
                    return update(state, {
                      items: {
                        [index]: {
                          checked: {
                            $set: checked,
                          },
                        },
                      },
                    })
                  })
                },
                checked: item.checked,
              }),
            ),
            React.createElement('div', {className: 'col'},
              React.createElement('span', null, item.data.file_display_name),
            ),
          ),
        )
      }),
    )
  },
})

const FilingDetailsFilings = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      itemsIn: [],
      itemsOut: [],
    }
  },
  componentDidMount: function() {
    const self = this

    Promise.all([
      get(`document-registration-in/${companyId}`),
      get(`document-registration-out/${companyId}`),
    ]).then(function(data) {
      const filingsIn = data[0].map(function(filing) {
        const isConnected = self.props.filing.incoming_document_registrations.find(function(incomingFiling) {
          return incomingFiling.id === filing.id
        })

        return {
          data: filing,
          checked: !!isConnected,
        }
      })

      const filingsOut = data[1].map(function(filing) {
        const isConnected = self.props.filing.outgoing_document_registrations.find(function(outgoingFiling) {
          return outgoingFiling.id === filing.id
        })

        return {
          data: filing,
          checked: !!isConnected,
        }
      })

      self.setState({
        loading: false,
        itemsIn: filingsIn,
        itemsOut: filingsOut,
      })
    })
  },
  render: function() {
    const self = this

    const saveButton = React.createElement('button', {
      className: 'btn',
      onClick: function() {
        self.setState({loading: true})
        const payload = {
          document_registrations_in: [],
          document_registrations_out: [],
        }

        _.each(self.state.itemsIn, function(item) {
          if(item.checked) payload.document_registrations_in.push(item.data.id)
        })

        _.each(self.state.itemsOut, function(item) {
          if(item.checked) payload.document_registrations_out.push(item.data.id)
        })

        post(`document-registration-in/${companyId}/${self.props.filing.id}/link/document-registration`, payload, function(success) {
          if(success) alert('Sikerült a hozzárendelés')
          else alert('Hiba hozzárendelés közben')
          self.setState({loading: false})
        })
      },
    }, 'Mentés')

    return self.state.loading ? React.createElement('div', null, 'Kérem, várjon!') : React.createElement('div', null,
      saveButton,
      React.createElement('div', {className: 'row'},
        React.createElement('div', {className: 'col'},
          self.state.itemsIn.map(function(item, index) {
            return React.createElement('div', {key: index, className: 'container'},
              React.createElement('div', {className: 'row'},
                React.createElement('div', {className: 'col'},
                  React.createElement('input', {
                    type: 'checkbox',
                    onChange: function(e) {
                      const checked = e.target.checked

                      self.setState(function(state) {
                        return update(state, {
                          itemsIn: {
                            [index]: {
                              checked: {
                                $set: checked,
                              },
                            },
                          },
                        })
                      })
                    },
                    checked: item.checked,
                  }),
                ),
                React.createElement('div', {className: 'col'},
                  React.createElement('span', null, item.data.topic_name),
                ),
              ),
            )
          }),
        ),
        React.createElement('div', {className: 'col'},
          self.state.itemsOut.map(function(item, index) {
            return React.createElement('div', {key: index, className: 'container'},
              React.createElement('div', {className: 'row'},
                React.createElement('div', {className: 'col'},
                  React.createElement('input', {
                    type: 'checkbox',
                    onChange: function(e) {
                      const checked = e.target.checked

                      self.setState(function(state) {
                        return update(state, {
                          itemsOut: {
                            [index]: {
                              checked: {
                                $set: checked,
                              },
                            },
                          },
                        })
                      })
                    },
                    checked: item.checked,
                  }),
                ),
                React.createElement('div', {className: 'col'},
                  React.createElement('span', null, item.data.topic_name),
                ),
              ),
            )
          }),
        ),
      ),
    )
  },
})

const FilingDetailsContent = createReactClass({
  getInitialState: function() {
    return {
      loading: true,
      filing: {},
    }
  },
  componentDidMount: function() {
    const self = this

    get(`document-registration-in/${companyId}/${self.props.id}`).then(function(data) {
      self.setState({
        loading: false,
        filing: data,
      })
    })
  },
  render: function() {
    const self = this

    const tabs = React.createElement('div', null,
      React.createElement('ul', {className: 'nav nav-tabs', role: 'tablist'},
        React.createElement('li', {className: 'nav-item'},
          React.createElement('a', {className: 'nav-link active', href: '#filing-partners', role: 'tab', 'data-toggle': 'tab'}, 'Partnerek'),
        ),
        React.createElement('li', {className: 'nav-item'},
          React.createElement('a', {className: 'nav-link', href: '#filing-filings', role: 'tab', 'data-toggle': 'tab'}, 'Iktatások'),
        ),
        React.createElement('li', {className: 'nav-item'},
          React.createElement('a', {className: 'nav-link', href: '#filing-documents', role: 'tab', 'data-toggle': 'tab'}, 'Dokumentum csatolása'),
        ),
        React.createElement('li', {className: 'nav-item'},
          React.createElement('a', {className: 'nav-link', href: '#filing-property', role: 'tab', 'data-toggle': 'tab'}, 'Ingatlan'),
        ),
      ),
      React.createElement('div', {className: 'tab-content filing-links'},
        React.createElement('div', {className: 'tab-pane active', id: 'filing-partners'},
          React.createElement(FilingDetailsPartners, {filing: self.state.filing}),
        ),
        React.createElement('div', {className: 'tab-pane', id: 'filing-filings'},
          React.createElement(FilingDetailsFilings, {filing: self.state.filing}),
        ),
        React.createElement('div', {className: 'tab-pane', id: 'filing-documents'},
          React.createElement(FilingDetailsDocuments, {filing: self.state.filing}),
        ),
        React.createElement('div', {className: 'tab-pane', id: 'filing-property'},
          React.createElement(FilingDetailsEstates, {filing: self.state.filing}),
        ),
      )
    )

    return this.state.loading ? React.createElement('div', null, 'loading') : tabs
  }
})
