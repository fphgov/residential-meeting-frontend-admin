import React, { useState, useContext } from 'react'
import getConfig from 'next/config'
import { getCookie } from 'cookies-next'
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

function AuthSendPage({ token }) {
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

    setAccounts([])
    setScroll(false)
    setError(null)
    setLoading(true)

    const data = {
      ...filterData,
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    }

    axios.post(
      publicRuntimeConfig.apiAccountSearch,
      new URLSearchParams(data).toString(),
      config

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

            <p>Ezen a felületen kereshető ki a Lakógyűlésben használt egyedi azonosító kód. Az irányítószám, vezetéknév megadása kötelező, a cím opciónális. A cím csak közterületet és házszámot tartalmaz. Ha a találatok száma eléri az 50 darabot, a keresés automatikusan visszautasításra kerül, pontosítás szükséges. Minden keresés, e-mail és PDF nyomtatás naplózásra kerül.</p>
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
                      label="Irányítószám: *"
                      placeholder=""
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
                      label="Vezetéknév: *"
                      placeholder=""
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
                      label="Cím:"
                      placeholder=""
                      value={filterData.address}
                      onChange={handleChangeInput}
                      aria-invalid={error && error['address'] ? true: false}
                      aria-required={false}
                      longInfo={null}
                      info={null}
                    />

                    <ErrorMiniWrapper error={error} id="address" />
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

export async function getServerSideProps({ req, res }) {
  const token = getCookie('token', { req, res })

  if (! token) {
    return {
      redirect: {
        permanent: false,
        destination: "/bejelentkezes",
      },
      props: {},
    }
  }

  return {
    props: {
      token
    }
  }
}

export default AuthSendPage
