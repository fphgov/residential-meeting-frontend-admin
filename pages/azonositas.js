import React, { useEffect, useState, useContext } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import axios from "axios"
import StoreContext from '../src/StoreContext'
import HeaderSection from '../src/section/HeaderSection'
import Submit  from "../src/component/form/elements/Submit"
import InputText  from "../src/component/form/elements/InputText"
import Checkbox  from "../src/component/form/elements/Checkbox"
import ScrollTo from "../src/component/common/ScrollTo"
import Error  from "../src/component/form/Error"
import ErrorMiniWrapper from "../src/component/form/ErrorMiniWrapper"
import { rmAllCharForEmail, rmAllCharForName } from '../src/lib/removeSpecialCharacters'

function AuthPage() {
  const context = useContext(StoreContext)
  const router = useRouter()

  const { publicRuntimeConfig } = getConfig()

  const [ loading, setLoading ] = useState(false)
  const [ scroll, setScroll ] = useState(false)
  const [ error, setError ] = useState(null)
  const [ showPrivacy, setShowPrivacy ] = useState(false)
  const [ filterData, setFilterData ] = useState({
    'auth_code': '',
    'email': '',
    'privacy': false,
    'newsletter': false,
  })

  const clearErrorItem = (inputName) => {
    if (error && error[inputName]) {
      delete error[inputName]
    }
  }

  const ShowPrivacyError = ({ error }) => {
    if (! error) {
      return null
    }

    if (error?.newsletter?.callbackValue && error?.privacy?.callbackValue) {
      return <ErrorMiniWrapper error={error} id="privacy" className="error-message-single" />
    }

    if (error?.newsletter || error?.privacy) {
      return (
        <>
          <ErrorMiniWrapper error={error} id="newsletter" className="error-message-single" />
          <ErrorMiniWrapper error={error} id="privacy"  className="error-message-single" />
        </>
      )
    }
  }

  const handleChangeRaw = (e) => {
    clearErrorItem(e.target.name)

    setFilterData({ ...filterData, [e.target.name]: e.target.value })
  }

  const handleChangeEmailInput = (e) => {
    clearErrorItem(e.target.name)

    setFilterData({ ...filterData, [e.target.name]: rmAllCharForEmail(e.target.value) })
  }

  const handleChangeInput = (e) => {
    clearErrorItem(e.target.name)

    if (e.target.name === 'privacy' || e.target.name === 'newsletter') {
      clearErrorItem('privacy')
      clearErrorItem('newsletter')
    }

    const value = e.target.type === 'checkbox' ? e.target.checked : rmAllCharForName(e.target.value)

    setFilterData({ ...filterData, [e.target.name]: value })
  }

  const submitAuth = (e) => {
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
      publicRuntimeConfig.apiAuth,
      new URLSearchParams(data).toString()
    )
    .then(response => {
      if (response.data) {
        router.push('/kerdes/1')
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

  useEffect(() => {
    if (filterData.email !== '') {
      setShowPrivacy(true)
    } else {
      setShowPrivacy(false)
    }
  }, [filterData])

  return (
    <>
      <HeaderSection showHeaderLine={true} />

      <main className="page auth">
        {scroll && document.querySelector('.error-message-inline') ? <ScrollTo element={document.querySelector('.error-message-inline').offsetTop} /> : null}

        <div className="container">
          <div className="row">
            <div className="offset-lg-2 offset-xl-3 col-lg-8 col-xl-6 col-md-12">
              <form className="form-horizontal" onSubmit={submitAuth}>
                <fieldset>
                  <div className="auth-wrapper">
                    <div className="information">
                      <h1>Szavazás</h1>

                      <p>Döntsünk közösen, szavazz egyedi kódoddal az első Budapesti Lakógyűlésen június 11-ig!</p>
                    </div>

                    <div className="login-wrapper">
                      {error ? <Error message={error} /> : null}

                      <div className="input-wrapper">
                        <InputText
                          id="email"
                          name="email"
                          label="E-mail cím (nem kötelező):"
                          placeholder="minta.janos@budapest.hu"
                          value={filterData.email}
                          onChange={handleChangeEmailInput}
                          aria-invalid={error && error['email'] ? true: false}
                          aria-required={false}
                          longInfo={
                            <>Ha azt szeretnéd, hogy külön is értesítsünk a szavazás sikerességéről és a Lakógyűlés eredményéről, vagy hírlevelet kapnál, akkor add meg az e-mail címedet.</>
                          }
                          info={null}
                        />

                        <ErrorMiniWrapper error={error} id="email" />
                      </div>

                      { showPrivacy ? <>
                        <div className="input-wrapper form-control">
                          <Checkbox id="privacy" name="privacy" value={filterData.privacy} onChange={handleChangeInput} ariaInvalid={error && error['privacy'] ? true: false} ariaRequired={true}>
                            Szeretnék külön értesítést kapni a szavazásom sikerességéről és a Lakógyűlés eredményéről. Az <a href={`${publicRuntimeConfig.publicHost}/files/adatkezelesi_tajekoztato.pdf`} target="_blank" rel="noopener noreferrer">adatkezelési tájékoztatást</a> megismertem, és hozzájárulok, hogy e célból kezeljék az e-mail címemet.
                          </Checkbox>
                        </div>

                        <div className="input-wrapper form-control">
                          <Checkbox id="newsletter" name="newsletter" value={filterData.newsletter} onChange={handleChangeInput} ariaInvalid={error && error['newsletter'] ? true: false} ariaRequired={false}>
                            Szeretnék feliratkozni a Fővárosi Önkormányzat Hírlevelére. Az <a href="https://budapest.hu/Documents/adatkezelesi_tajekoztatok/Fovarosi_Onkormanyzat_hirlevele.pdf" target="_blank" rel="noopener noreferrer">adatkezelési tájékoztatást</a> megismertem, és hozzájárulok, hogy e célból kezeljék az e-mail címemet.
                          </Checkbox>
                        </div>

                        <ShowPrivacyError error={error} />
                      </> : null}

                      <hr />

                      <Submit label="Tovább a szavazáshoz" loading={loading} disabled={/_/.test(filterData.auth_code) || filterData.auth_code.length == 0} />
                    </div>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default AuthPage
