import useAuth from '@/hooks/useAuth'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/'

type ApiVersion = 'v3' | 'v4'

interface FetchOptions {
  version?: ApiVersion
  body?: FormData
  method: 'GET' | 'POST' | 'DELETE'
  bearerToken: string
  signal?: AbortSignal
}

interface PublicFetchOptions {
  version?: ApiVersion
  body?: FormData | string
  method: 'GET' | 'POST' | 'DELETE'
  signal?: AbortSignal
}

interface RequestOptions {
  version: ApiVersion
  signal?: AbortSignal
}

const fetchRequest = async (route: string, { bearerToken, body, version, method, signal }: FetchOptions) => {
  return fetch(`${backendUrl}api/${version ?? 'v3'}/${route}`, {
    method: method,
    body: body,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    signal: signal,
  })
}

const fetchPublicRequest = async (route: string, { body, version, method, signal }: PublicFetchOptions) => {
  return fetch(`${backendUrl}api/${version ?? 'v3'}/${route}`, {
    method: method,
    body: body,
    signal: signal,
  })
}

export const useApi = () => {
  const { getAccessToken } = useAuth()

  const get = async (route: string, options?: Partial<RequestOptions>) => {
    const accessToken = await getAccessToken()
    return fetchRequest(route, {
      bearerToken: accessToken,
      method: 'GET',
      version: options?.version,
      signal: options?.signal,
    })
  }

  const post = async (route: string, body: FormData, options?: Partial<RequestOptions>) => {
    const accessToken = await getAccessToken()
    return fetchRequest(route, {
      bearerToken: accessToken,
      body,
      method: 'POST',
      version: options?.version,
      signal: options?.signal,
    })
  }

  const deleteRequest = async (route: string, options?: Partial<RequestOptions>) => {
    const accessToken = await getAccessToken()
    return fetchRequest(route, {
      bearerToken: accessToken,
      method: 'DELETE',
      version: options?.version,
      signal: options?.signal,
    })
  }

  const getImage = async (imageUrl: string, options?: Partial<RequestOptions>) => {
    const accessToken = await getAccessToken()
    const formData = new FormData()
    formData.append('imageUrl', imageUrl)

    const response = await fetchRequest('image/', {
      bearerToken: accessToken,
      method: 'POST',
      body: formData,
      version: options?.version,
      signal: options?.signal,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  }

  const getSharedImage = async (imageUrl: string, options?: Partial<RequestOptions>) => {
    const formData = new FormData()
    formData.append('imageUrl', imageUrl)

    const response = await fetchPublicRequest('image/public', {
      method: 'POST',
      body: formData,
      version: options?.version,
      signal: options?.signal,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch shared image')
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  }

  return {
    get,
    post,
    deleteRequest: deleteRequest,
    getImage,
    getSharedImage,
  }
}
