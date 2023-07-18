import React, { createContext, useEffect, useContext, useState, useMemo, useCallback } from 'react'
import { encode } from 'universal-base64url'
import * as ethers from 'ethers'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { SafeAppProvider } from '@safe-global/safe-apps-provider'

const ENGINE_URL = 'https://orchestrator.grindery.org'

export type AuthToken = {
  access_token: string
  expires_in: number
  refresh_token: string
  token_type: string
}

// Context props
type ContextProps = {
  token: AuthToken | null
  message: string | null
}

// Context provider props
export type UserProviderProps = {
  children: React.ReactNode
}

// Init context
export const UserContext = createContext<ContextProps>({
  token: null,
  message: null,
})

export const UserProvider = ({ children }: UserProviderProps) => {
  const { sdk, safe } = useSafeAppsSDK()

  const web3Provider = useMemo(() => new ethers.providers.Web3Provider(new SafeAppProvider(safe, sdk)), [sdk, safe])

  // Auth message
  const [message, setMessage] = useState<string | null>(null)

  // Authentication token object
  const [token, setToken] = useState<AuthToken | null>(null)

  // Signed authentication message
  const [signature, setSignature] = useState<string | null>(null)

  const code =
    (message &&
      signature &&
      encode(
        JSON.stringify({
          message: message,
          signature: signature,
          type: 'eip1271',
        }),
      )) ||
    ''

  // Fetch authentication message or access token from the engine API
  const startSession = useCallback(async () => {
    // Try to fetch access token
    const resWithCreds = await fetch(`${ENGINE_URL}/oauth/session?address=${safe.safeAddress}&chain=${safe.chainId}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (resWithCreds && resWithCreds.ok) {
      const json = await resWithCreds.json()

      // Set access token if exists
      if (json.access_token) {
        setToken(json)
      } else if (json.message) {
        // Or set auth message
        setMessage(json.message)
      }
    } else {
      console.error('startSessionWithCreds error', (resWithCreds && resWithCreds.status) || 'Unknown error')
    }
  }, [safe])

  // Sign authentication message with MetaMask
  const signMessage = useCallback(
    async (msg: string) => {
      if (web3Provider) {
        try {
          const newSignature = await web3Provider.getSigner().signMessage(msg)
          setSignature(newSignature)
        } catch (error) {
          console.error('signMessage error', error)
          setSignature(null)
          setToken(null)
        }
      }
    },
    [web3Provider],
  )

  // Get access token from the engine API
  const getToken = async (code: string) => {
    const res = await fetch(`${ENGINE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
      }),
    })

    if (res.ok) {
      const result = await res.json()
      setToken(result)
    } else {
      console.error('getToken error', res.status)
      setToken(null)
    }
  }

  // Set refresh_token cookie
  const registerAuthSession = async (refresh_token: string) => {
    const res = await fetch(`${ENGINE_URL}/oauth/session-register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refresh_token,
      }),
    })

    if (!res.ok) {
      console.error('registerAuthSession error', res.status)
    }
  }

  // register auth session if token and address is known
  useEffect(() => {
    if (safe.safeAddress && token && token.access_token) {
      if (token.refresh_token) {
        registerAuthSession(token.refresh_token)
      }
    }
  }, [token, safe])

  // Start session if user address is known
  useEffect(() => {
    if (!message && !signature && !token) {
      startSession()
    }
  }, [message, signature, token, startSession])

  // Sign authentication message if message is known
  useEffect(() => {
    if (message && !signature && !token) {
      signMessage(message)
    }
  }, [message, signature, token, signMessage])

  // Get authentication token if message is signed
  useEffect(() => {
    if (code && !token) {
      getToken(code)
    }
  }, [code, token])

  return (
    <UserContext.Provider
      value={{
        token,
        message,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUserProvider = () => useContext(UserContext)

export default UserProvider
