const partnerId = new URLSearchParams(window.location.search).get('partner_id')
const companyId = new URLSearchParams(window.location.search).get('company_id')

let partner = {}
const masterData = {}
const urlPrefix = 'http://dimpropbackend_test.skylc.local/api/'

function get(url) {
  return new Promise(function (resolve, reject) {
    fetch(urlPrefix + url)
      .then((function (response) {
        if (!response.ok) console.log(response)
        return response.json()
      }))
      .then(function (body) {
        resolve(body.data)
      })
      .catch(function (error) {
        console.log(error)
      })
  })
}

function put(url, paylodad, callback) {
  paylodad._method = 'PUT'
  post(url, paylodad, callback)
}

function post(url, payload, callback) {
  callback = callback || function () {
  }
  let ok = true

  fetch(urlPrefix + url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(function (response) {
    ok = response.ok
    return response.json()
  }).then(function (data) {
    if (!ok) {
      if (data.status && data.status.message) {
        let message = data.status.message

        _.each(data.status.errorBag, function (error) {
          message += '\n' + error
        })
        alert(message)
      }
      callback(false)
    }
    else {
      const resource = (data && data.data) ? data.data.resource : null

      callback(true, resource)
    }
  })
}

function remove(url, payload, callback) {
  payload = payload || {}
  payload._method = 'DELETE'
  callback = callback || function () {
  }
  let ok = true

  fetch(urlPrefix + url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(function (data) {
    if (!ok) {
      if (data.status && data.status.message) {
        let message = data.status.message

        _.each(data.status.errorBag, function (error) {
          message += '\n' + error
        })
        alert(message)
      }
      callback(false)
    }
    else {
      callback(true)
    }
  }).catch(function (e) {
    console.log(e)
  })
}

if (partnerId) {
  const partnerPromise = get('partners/' + partnerId)
  const countriesPromise = get('master_data/countries?limit=100')
  const countiesPromise = get('master_data/counties?limit=100')
  const zipCodesPromise = get('master_data/zip_codes?limit=100')
  const citiesPromise = get('master_data/cities?limit=100')
  const countryCodesPromise = get('master_data/country_codes?limit=100')
  const personsPromise = get('persons')
  const positionsPromise = get('master_data?type[]=position&size=100')
  const competencePromise = get('master_data?type[]=competence&size=100')
  const emailTypesPromise = get('master_data/email_types')
  const phoneNumberTypesPromise = get('master_data/phone_number_types')
  const websiteTypesPromise = get('master_data/website_types')
  const partnersPromise = get('partners')
  const partnerRelationTypesPromise = get('master_data/partner_relation_types')
  const partnerConnectionsPromise = get('partner-connections/' + partnerId)
  const bankPromise = get('master_data/banks')
  const currencyPromise = get('master_data/currencies')
  const arrivalMethodPromise = get('master_data?type=arrival_method')
  const topicPromise = get('master_data?type=topic')
  const statusPromise = get('master_data?type=status')

  Promise.all([
    partnerPromise,
    countriesPromise,
    countiesPromise,
    zipCodesPromise,
    citiesPromise,
    countryCodesPromise,
    personsPromise,
    positionsPromise,
    competencePromise,
    emailTypesPromise,
    phoneNumberTypesPromise,
    websiteTypesPromise,
    partnersPromise,
    partnerRelationTypesPromise,
    partnerConnectionsPromise,
    bankPromise,
    currencyPromise,
    arrivalMethodPromise,
    topicPromise,
    statusPromise,
  ]).then(function (results) {
    partner = results[0]
    partner.connections = results[14]
    masterData.country_id = results[1]
    masterData.county_id = results[2]
    masterData.zip_code_id = results[3]
    masterData.city_id = results[4]
    masterData.country_code_id = results[5]
    masterData.person_id = results[6].map(function (personProps) {
      return new Person(personProps)
    })
    masterData.position_id = results[7]
    masterData.competence_id = results[8]
    masterData.email_type = results[9]
    masterData.phone_number_type = results[10]
    masterData.website_type = results[11]
    masterData.partner_id = results[12].map(function(partner) {
      return {
        id: partner.id,
        name: partner.short_name,
      }
    })
    masterData.recipient_id = results[12].map(function(partner) {
      return {
        id: partner.id,
        name: partner.short_name,
      }
    })
    masterData.partner_relation_type_id = results[13]
    masterData.bank_name_id = results[15]
    masterData.currency_type_id = results[16]
    masterData.arrival_method_id = results[17]
    masterData.topic_id = results[18]
    masterData.status_id = results[19]

    document.getElementById('loading').style.display = 'none'
    document.getElementById('content').style.display = 'block'

    ReactDOM.render(
      React.createElement(PartnerData),
      document.getElementById('partner_data'),
    )

    ReactDOM.render(
      React.createElement(Addresses),
      document.getElementById('relations-addresses')
    )

    ReactDOM.render(
      React.createElement(Phone),
      document.getElementById('relations-phone')
    )

    ReactDOM.render(
      React.createElement(Email),
      document.getElementById('relations-email')
    )

    ReactDOM.render(
      React.createElement(Website),
      document.getElementById('relations-website')
    )

    ReactDOM.render(
      React.createElement(BankAccounts),
      document.getElementById('bank_accounts'),
    )

    ReactDOM.render(
      React.createElement(Administrators),
      document.getElementById('administrators'),
    )

    ReactDOM.render(
      React.createElement(PartnerRelations),
      document.getElementById('partner_relations')
    )

    ReactDOM.render(
      React.createElement(Company),
      document.getElementById('company')
    )

    ReactDOM.render(
      React.createElement(Filing),
      document.getElementById('filing')
    )
  })
}
else {
  alert('Meg kell adni a partner id-t, pl.: index.html?partner_id=123')
}

function uid() {
  return Math.floor(Math.random() * 100000)
}
