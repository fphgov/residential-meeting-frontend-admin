import React, { useState } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next'
import HeaderSection from '../src/section/HeaderSection'
import axios from "axios"
import InputText from "../src/component/form/elements/InputText"
import Select from "../src/component/form/elements/Select"
import Submit from "../src/component/form/elements/Submit"
import ScrollTo from "../src/component/common/ScrollTo"
import { rmAllCharForName, rmAllCharForEmail } from '../src/lib/removeSpecialCharacters'
import Error  from "../src/component/form/Error"
import ErrorMiniWrapper from "../src/component/form/ErrorMiniWrapper"

function RejectSendPage({ token }) {
  const router = useRouter()

  const { publicRuntimeConfig } = getConfig()

  const [ loading, setLoading ] = useState(false)
  const [ scroll, setScroll ] = useState(false)
  const [ error, setError ] = useState(null)
  const [ info, setInfo ] = useState('')
  const [ filterData, setFilterData ] = useState({
    'email': '',
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

  const handleChangeEmailInput = (e) => {
    clearErrorItem(e.target.name)

    setFilterData({ ...filterData, [e.target.name]: rmAllCharForEmail(e.target.value) })
  }

  const sendForm = (e) => {
    e.preventDefault()

    if (loading) {
      return
    }

    setInfo('')
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
      publicRuntimeConfig.apiAccountReject,
      new URLSearchParams(data).toString(),
      config

    )
    .then(response => {
      if (response.data && response.data.message) {
        setInfo(response.data.message)
        setFilterData({
          'email': '',
        })
      }
    })
    .catch(error => {
      if (error.response && error.response.status === 403) {
        setError('Google reCapcha ellenőrzés sikertelen. Kérjük, frissítsd az oldalt!')
        setScroll(true)
      } else if (error.response && error.response.status === 401) {
        router.push('/kijelentkezes')
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
            <h5>Elutasítás küldése</h5>

            <p>Ezen a felületen lehetséges a beérkezett hibás kódigénylések elutasítása, indoklás választással.</p>
          </div>
        </div>

        <div className="search-box">
          <div className="container">
            <form onSubmit={sendForm}>
              <fieldset>
                {error ? <Error message={error} /> : null}

                <div className="input-wrapper-inline">
                  <div className="input-wrapper">
                    <Select
                      id="type"
                      name="type"
                      label="Elutasítás oka: *"
                      placeholder="Válassz az indoklások közül"
                      value={filterData.type}
                      onChange={handleChangeInput}
                      aria-invalid={error && error['type'] ? true: false}
                      aria-required={true}
                      longInfo={null}
                      info={null}
                      options={[
                        { value: 1, label: 'Lakcímkártya képe alapján azonosítás sikertelen' },
                        { value: 2, label: 'Kódkikérő nem szerepel az adatbázisban' },
                      ]}
                    />
                  </div>

                  <div className="input-wrapper">
                    <InputText
                      id="email"
                      name="email"
                      label="E-mail cím: *"
                      placeholder=""
                      value={filterData.email}
                      onChange={handleChangeEmailInput}
                      aria-invalid={error && error['email'] ? true: false}
                      aria-required={true}
                      longInfo={null}
                      info={null}
                    />

                    <ErrorMiniWrapper error={error} id="email" />
                  </div>

                  <div className="search-control">
                    <Submit label="Elutasítás" className="btn-search" loading={loading} disabled={false} />
                  </div>
                </div>
              </fieldset>
            </form>
          </div>
        </div>

        <div className="info-list">
          <div className="container">
            {info ? info : ''}
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

export default RejectSendPage
