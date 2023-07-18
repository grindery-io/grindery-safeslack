import React from 'react'
import styled from 'styled-components'
import UserProvider from './providers/UserProvider'
import EmbedApp from './components/EmbedApp'

const Container = styled.div`
  background: #fff;
  padding: 0;
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-direction: column;
`

const SafeApp = () => {
  return (
    <Container>
      <UserProvider>
        <EmbedApp />
      </UserProvider>
    </Container>
  )
}

export default SafeApp
