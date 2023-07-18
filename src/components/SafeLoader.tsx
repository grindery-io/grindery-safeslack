import React from 'react'
import { Loader, Title } from '@gnosis.pm/safe-react-components'

const SafeLoader = () => (
  <>
    <Title size="sm">Waiting for Safe...</Title>
    <Loader size="md" />
  </>
)

export default SafeLoader
