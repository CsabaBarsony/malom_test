const partnerId = new URLSearchParams(window.location.search).get('partner')
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

function post(url, payload, callback) {
  callback = callback || function() {}
  let ok = true

  console.log(url, payload)

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
      callback(true)
    }
  })
}

get('partners')

if (partnerId) {
  const partnerPromise = get('partners/' + partnerId)
  const countriesPromise = get('master_data/countries?limit=1000')
  const countiesPromise = get('master_data/counties?limit=1000')
  const zipCodesPromise = get('master_data/zip_codes?limit=1000')
  const citiesPromise = get('master_data/cities?limit=1000')
  const countryCodesPromise = get('master_data/country_codes?limit=1000')

  Promise.all([
    partnerPromise,
    countriesPromise,
    countiesPromise,
    zipCodesPromise,
    citiesPromise,
    countryCodesPromise,
  ]).then(function (results) {
    partner = results[0]
    masterData.country = results[1]
    masterData.county = results[2]
    masterData.zip_code = results[3]
    masterData.city_code = results[4]
    masterData.country_code = results[5]

    document.getElementById('loading').style.display = 'none'
    document.getElementById('content').style.display = 'block'
    populatePartnerData()

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
      document.getElementById('bank_accounts')
    )

    ReactDOM.render(
      React.createElement(Administrators),
      document.getElementById('administrators')
    )

    ReactDOM.render(
      React.createElement(PartnerRelations),
      document.getElementById('partner_relations')
    )

    ReactDOM.render(
      React.createElement(Company),
      document.getElementById('company')
    )
  })
}
else {
  alert('Meg kell adni a partner id-t, pl.: index.html?partner=123')
}

function populatePartnerData() {
  const form = document.forms[0]
  form.elements['partner_data-short_name'].value = partner.short_name
  form.elements['partner_data-long_name'].value = partner.long_name
  form.elements['partner_data-tax_number'].value = partner.tax_number
  form.elements['partner_data-public_tax_number'].value = partner.public_tax_number
  form.elements['partner_data-company_registration_number'].value = partner.company_registration_number
}

function onPartnerDataFormSubmit(form) {
  const payload = {
    _method: 'PUT',
  }

  if (form.elements['partner_data-short_name'].value !== '') {
    payload.short_name = form.elements['partner_data-short_name'].value
  }

  if (form.elements['partner_data-long_name'].value !== '') {
    payload.long_name = form.elements['partner_data-long_name'].value
  }

  if (form.elements['partner_data-tax_number'].value !== '') {
    payload.tax_number = form.elements['partner_data-tax_number'].value
  }

  if (form.elements['partner_data-public_tax_number'].value !== '') {
    payload.public_tax_number = form.elements['partner_data-public_tax_number'].value
  }

  if (form.elements['partner_data-company_registration_number'].value !== '') {
    payload.company_registration_number = form.elements['partner_data-company_registration_number'].value
  }

  post('partners/' + partnerId, payload, function(success) {
    if(success) {
      alert('Partner sikeresen mentve.')
    }
  })
}
