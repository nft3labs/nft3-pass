import type { FC, PropsWithChildren } from 'react'
import { styled } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Header from './Header'
import Footer from './Footer'

import GlobalStyles from 'styles/GlobalStyles'

const Content = styled(Container)(() => ({
  minHeight: 'calc(100vh - 256px)',
}))

const ActiveLayout: FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <>
      <GlobalStyles />
      <Header />
      <Content>{children}</Content>
      <Footer />
    </>
  )
}

export default ActiveLayout
