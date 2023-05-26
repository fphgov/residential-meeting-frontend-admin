import { useState } from "react"
import { useRouter } from 'next/router'
import getConfig from 'next/config'
import axios from "axios"
import Details from "./Details"
import Submit from "../../component/form/elements/Submit"
import InputText from "../../component/form/elements/InputText"
import ScrollTo from "../../component/common/ScrollTo"
import { rmAllCharForEmail } from '../../lib/removeSpecialCharacters'
import Error from "../../component/form/Error"
import ErrorMiniWrapper from "../../component/form/ErrorMiniWrapper"
import dynamic from 'next/dynamic';

const DynamicButton = dynamic(() => import('./PrintButton'), {
  ssr: false,
});

export default function AccountBox({ account }) {
  const router = useRouter()
  const { publicRuntimeConfig } = getConfig()

  const [ open, setOpen ] = useState(false)
  const [ loading, setLoading ] = useState(false)
  const [ scroll, setScroll ] = useState(false)
  const [ error, setError ] = useState(null)
  const [ pdfBlob, setPdfBlob ] = useState(null)
  const [ filterData, setFilterData ] = useState({
    'id': '',
    'email': '',
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

  const submitAccount = (e) => {
    e.preventDefault()

    if (loading) {
      return
    }

    setError(null)
    setLoading(true)

    const data = {
      ...filterData,
      id: account.id,
    }

    axios.post(
      publicRuntimeConfig.apiSendAuthCode,
      new URLSearchParams(data).toString()
    )
    .then(response => {
      if (response.data && response.data.message) {
        window.location.reload()
      }
    })
    .catch(error => {
      if (error.response && error.response.status === 403) {
        setError('Google reCapcha ellenőrzés sikertelen. Kérjük frissíts rá az oldalra.')
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

  const handlePrint = () => {
    if (loading) {
      return
    }

    setError(null)
    setLoading(true)

    const data = {
      ...filterData,
      id: account.id,
    }

    axios.post(
      publicRuntimeConfig.apiPrintAuthCode,
      new URLSearchParams(data).toString()
    )
    .then(async (response) => {
      if (response.data) {
        setPdfBlob(response.data)
      }
    })
    .catch(error => {
      if (error.response && error.response.status === 403) {
        setError('Google reCapcha ellenőrzés sikertelen. Kérjük frissíts rá az oldalra.')
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

  const miniProp = (name, value) => {
    return value ? `${value} ${name}. ` : ''
  }

  return (
    <div className={`account-box${open ? ' open' : ''}`}>
      {scroll && document.querySelector('.error-message-inline') ? <ScrollTo element={document.querySelector('.error-message-inline').offsetTop} /> : null}

      <Details summary={<>
        <div>
          <h6>{account.fullName}</h6>
          <p>{account.address} // {miniProp('ép', account.building) + miniProp('lph', account.starway) + miniProp('e', account.floor) + miniProp('a', account.door)}</p>
        </div>
      </>} onChange={(o) => { setOpen(o) }}>

        <hr />

        <div className="details-inner">
          <h6><b>Azonosító küldése</b></h6>

          {error ? <Error message={error} /> : null}

          <form onSubmit={submitAccount}>
            <fieldset>
              <div className="row">
                <div className="col-md-6">
                  <div className="input-wrapper">
                    <InputText
                      id="email"
                      name="email"
                      label="E-mail cím:"
                      placeholder=""
                      value={filterData.email}
                      onChange={handleChangeEmailInput}
                      aria-invalid={error && error['email'] ? true: false}
                      aria-required={false}
                      longInfo={null}
                      info={null}
                    />

                    <ErrorMiniWrapper error={error} id="id" />
                    <ErrorMiniWrapper error={error} id="email" />
                  </div>
                </div>
              </div>

              <div className="button-wrapper">
                <Submit label="Küldés" loading={loading} disabled={false} />

                <DynamicButton className="btn btn-secondary" onClickEvent={handlePrint} blob={pdfBlob}>Nyomtatás (PDF)</DynamicButton>
              </div>
            </fieldset>
          </form>
        </div>
      </Details>
    </div>
  )
}
