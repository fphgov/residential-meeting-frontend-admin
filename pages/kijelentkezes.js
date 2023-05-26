import { deleteCookie } from 'cookies-next'

function LogoutPage() {
  return (
    <></>
  )
}

export async function getServerSideProps({ req, res }) {
  deleteCookie('token', { req, res })

  return {
    redirect: {
      permanent: false,
      destination: "/bejelentkezes",
    },
    props: {},
  }
}

export default LogoutPage
