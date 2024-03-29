import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import headerLogo from '../../public/image/bp-residential-header.svg'
import HamburgerMenu from '../component/HamburgerMenu'

function HeaderLoginSection({ position, showHeaderLine = false }) {
  const router = useRouter()

  const { asPath } = router

  const [fixed, setFixed] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)

  const handleScroll = () => {
    if (window.scrollY >= (window.innerHeight > 767 ? 340 : 220)) {
      setFixed(true)
    } else {
      setFixed(false)
    }
  }

  const toggleMenu = () => {
    setOpenMenu(state => !state)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <header className={`site-header${showHeaderLine ? ' header-line' : ''}${fixed ? ' fixed-header' : ''}${position ? 'relative-header' : ''}${asPath === '/bejelentkezes' ? ' transparent-header' : ''}`}>
        <div className="container">
          <div className="site-header-inner">
            <div className="row flex-center">
              <div className="col-10 col-sm-8 col-md-8 col-lg-6">
                <a className="logo" href="/">
                  <Image
                    src={headerLogo}
                    alt="Budapest Lakógyűlés logó"
                  />
                </a>
              </div>

              <div className="col-2 col-sm-4 col-md-4 col-lg-6">
                <nav role="navigation" className="main-navigation">
                  <HamburgerMenu toggleMenu={toggleMenu} open={openMenu} />

                  <div className={`navigation-wrapper ${openMenu ? 'open' : ''}`}>
                    <div className="container">
                      <ul className={openMenu ? '' : ''}>
                        <li><Link href="/bejelentkezes" onClick={() => { setOpenMenu(false) }}><span>Bejelentkezés</span></Link></li>
                      </ul>
                    </div>
                  </div>
                </nav>
              </div>
            </div>

          </div>
        </div>
      </header>
    </>
  )
}

export default HeaderLoginSection
