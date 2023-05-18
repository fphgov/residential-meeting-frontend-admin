import React, { useState, useContext } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import Image from 'next/image'
import axios from "axios"
import StoreContext from '../src/StoreContext'
import HeaderSection from '../src/section/HeaderSection'
import Submit  from "../src/component/form/elements/Submit"
import InputText  from "../src/component/form/elements/InputText"
import ScrollTo from "../src/component/common/ScrollTo"
import Error  from "../src/component/form/Error"
import ErrorMiniWrapper from "../src/component/form/ErrorMiniWrapper"
import { rmAllCharForEmail, rmAllCharForName } from '../src/lib/removeSpecialCharacters'
import bpLogo from '../public/image/bp-emblem-color.svg'

function AuthPage() {
  const context = useContext(StoreContext)
  const router = useRouter()

  const { publicRuntimeConfig } = getConfig()

  const [ loading, setLoading ] = useState(false)
  const [ scroll, setScroll ] = useState(false)
  const [ error, setError ] = useState(null)
  const [ filterData, setFilterData ] = useState({
    'email': '',
    'password': '',
  })

  const clearErrorItem = (inputName) => {
    if (error && error[inputName]) {
      delete error[inputName]
    }
  }

  const handleChangeEmailInput = (e) => {
    clearErrorItem(e.target.name)

    setFilterData({ ...filterData, [e.target.name]: rmAllCharForEmail(e.target.value) })
  }

  const handleChangeInput = (e) => {
    clearErrorItem(e.target.name)

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
        router.push('/azonosito-kuldes')
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
                      <h1>Bejelentkezés</h1>
                    </div>

                    <div className="login-wrapper">
                      {error ? <Error message={error} /> : null}

                      <div className="input-wrapper">
                        <InputText
                          id="email"
                          name="email"
                          label="E-mail cím:"
                          placeholder="minta.janos@budapest.hu"
                          value={filterData.email}
                          onChange={handleChangeEmailInput}
                          aria-invalid={error && error['email'] ? true: false}
                          aria-required={false}
                          longInfo={null}
                          info={null}
                        />

                        <ErrorMiniWrapper error={error} id="email" />
                      </div>

                      <div className="input-wrapper">
                        <InputText
                          id="password"
                          name="password"
                          label="Jelszó:"
                          type="password"
                          placeholder=""
                          value={filterData.password}
                          onChange={handleChangeInput}
                          aria-invalid={error && error['password'] ? true: false}
                          aria-required={false}
                          longInfo={null}
                          info={null}
                        />

                        <ErrorMiniWrapper error={error} id="password" />
                      </div>

                      <Submit label="Bejelentkezés" loading={loading} disabled={false} />
                    </div>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </main>

      <div className="auth-logo-wrapper">
        <Image
          src={bpLogo}
          alt="Budapest logó"
        />
      </div>
    </>
  )
}

export default AuthPage
