import React, { useState, useContext } from 'react'
import getConfig from 'next/config'
import HeaderSection from '../src/section/HeaderLoginSection'
import axios from "axios"
import StoreContext from '../src/StoreContext'
import InputText from "../src/component/form/elements/InputText"
import Submit from "../src/component/form/elements/Submit"
import ScrollTo from "../src/component/common/ScrollTo"
import { rmAllCharForName } from '../src/lib/removeSpecialCharacters'
import Error  from "../src/component/form/Error"
import ErrorMiniWrapper from "../src/component/form/ErrorMiniWrapper"
import AccountBox  from "../src/component/common/AccountBox"

function AuthSendPage() {
  const context = useContext(StoreContext)

  const { publicRuntimeConfig } = getConfig()

  const [ loading, setLoading ] = useState(false)
  const [ scroll, setScroll ] = useState(false)
  const [ error, setError ] = useState(null)
  const [ accounts, setAccounts ] = useState([])
  const [ filterData, setFilterData ] = useState({
    'zip_code': '',
    'name': '',
    'address': '',
    'house_number': '',
  })

  const clearErrorItem = (inputName) => {
    if (error && error[inputName]) {
      delete error[inputName]
    }
  }

  const handleChangeInput = (e) => {
    clearErrorItem(e.target.name)

    const value = e.target.type === 'checkbox' ? e.target.checked : rmAllCharForName(e.target.value)

    setFilterData({ ...filterData, [e.target.name]: value })
  }

  const search = (e) => {
    e.preventDefault()

    if (loading) {
      return
    }

    setScroll(false)
    setError(null)
    setLoading(true)

    const data = {
      ...filterData,
    }

    context.storeSave('form', 'data', filterData)

    axios.post(
      publicRuntimeConfig.apiAccountSearch,
      new URLSearchParams(data).toString()
    )
    .then(response => {
      if (response.data && response.data.data) {
        setAccounts(response.data.data)
      }
    })
    .catch(error => {
      if (error.response && error.response.status === 403) {
        setError('Google reCapcha ellenőrzés sikertelen. Kérjük frissíts rá az oldalra.')
        setScroll(true)
      } else if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error)
        setScroll(true)
      } else if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors)
        setScroll(true)
      } else {
        setError('Váratlan hiba történt, kérünk próbáld később')
        setScroll(true)
      }
    })
    .finally(() => {
      setLoading(false)
    })
  }

  return (
    <>
      <HeaderSection />

      <main className="page">
        {scroll && document.querySelector('.error-message-inline') ? <ScrollTo element={document.querySelector('.error-message-inline').offsetTop} /> : null}

        <div className="info-box">
          <div className="container">
            <h5>Azonosító küldése</h5>

            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lobortis enim turpis, vel laoreet lacus pellentesque vitae. Mauris facilisis condimentum nisi, id posuere sapien tincidunt vel. Vestibulum ante ipsum primis in faucibus orci luctus.</p>
          </div>
        </div>

        <div className="search-box">
          <div className="container">
            <form onSubmit={search}>
              <fieldset>
                {error ? <Error message={error} /> : null}

                <div className="input-wrapper-inline">
                  <div className="input-wrapper">
                    <InputText
                      id="zip_code"
                      name="zip_code"
                      label="Irányítószám:"
                      placeholder="Irányítószám"
                      value={filterData.zip_code}
                      onChange={handleChangeInput}
                      aria-invalid={error && error['zip_code'] ? true: false}
                      aria-required={true}
                      longInfo={null}
                      info={null}
                    />

                    <ErrorMiniWrapper error={error} id="zip_code" />
                  </div>

                  <div className="input-wrapper">
                    <InputText
                      id="name"
                      name="name"
                      label="Vezetéknév:"
                      placeholder="Vezetéknév"
                      value={filterData.name}
                      onChange={handleChangeInput}
                      aria-invalid={error && error['name'] ? true: false}
                      aria-required={true}
                      longInfo={null}
                      info={null}
                    />

                    <ErrorMiniWrapper error={error} id="name" />
                  </div>

                  <div className="input-wrapper">
                    <InputText
                      id="address"
                      name="address"
                      label="Utcanév:"
                      placeholder="Utcanév"
                      value={filterData.address}
                      onChange={handleChangeInput}
                      aria-invalid={error && error['address'] ? true: false}
                      aria-required={false}
                      longInfo={null}
                      info={null}
                    />

                    <ErrorMiniWrapper error={error} id="address" />
                  </div>

                  <div className="input-wrapper">
                    <InputText
                      id="house_number"
                      name="house_number"
                      label="Házszám:"
                      placeholder="Házszám"
                      value={filterData.house_number}
                      onChange={handleChangeInput}
                      aria-invalid={error && error['house_number'] ? true: false}
                      aria-required={false}
                      longInfo={null}
                      info={null}
                    />

                    <ErrorMiniWrapper error={error} id="house_number" />
                  </div>

                  <div className="search-control">
                    <Submit label="Keresés" className="btn-search" loading={loading} disabled={false} />
                  </div>
                </div>
              </fieldset>
            </form>
          </div>
        </div>

        <div className="account-list">
          <div className="container">
            {accounts ? accounts.map((account) => <AccountBox key={account.id} account={account} />) : ''}
          </div>
        </div>
      </main>
    </>
  )
}

export default AuthSendPage
