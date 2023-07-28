import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import React, { useEffect, useState } from 'react'
import { useUserProvider } from '../providers/UserProvider'
import SafeLoader from './SafeLoader'

const EmbedApp = () => {
  const { safe } = useSafeAppsSDK()
  const [height, setHeight] = useState(0)
  const { token } = useUserProvider()

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.method === 'gr_resize' && event.data.params && event.data.params.height) {
        setHeight(event.data.params.height)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  return safe.safeAddress && token ? (
    <iframe
      style={{ border: 'none', width: '100%', height: height + 'px' }}
      src={`https://embed.grindery.io/safe/slack__safe?user_chain=${safe.chainId}&user_address=${safe.safeAddress}&access_token=${token.access_token}&trigger.input._grinderyContractAddress=${safe.safeAddress}&trigger.input._grinderyChain=eip155:${safe.chainId}&trigger.skipAuth=1&action=sendChannelMessage&create=1`}
      title="Grindery Safe Embedded Integration"
    />
  ) : (
    <div
      style={{
        minHeight: '100%',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        flex: 1,
      }}
    >
      <SafeLoader />
    </div>
  )
}

export default EmbedApp
