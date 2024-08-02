import useAuth from "@/hooks/useAuth";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:8080/";

type ApiVersion = 'v1'

interface FetchOptions {
  version?: ApiVersion
  body?: FormData,
  method: 'GET' | 'POST' | 'DELETE'
  bearerToken: string
}

interface RequestOptions {
  version: ApiVersion
}

const fetchRequest = async (route: string, {bearerToken, body, version, method}: FetchOptions) => {
  return fetch(`${backendUrl}api/${version ?? 'v1'}/${route}`, {
    method: method,
    body: body,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    }
  })
}

export const useApi = () => {
  const { getAccessToken } = useAuth();

  const get = async (route: string, options?: RequestOptions) => {
    const accessToken = await getAccessToken()
    return fetchRequest(route, {
      bearerToken: accessToken,
      method: 'GET',
      version: options?.version,
    })
  }

  const post = async (route: string, body: FormData, options?: RequestOptions) => {
    const accessToken = await getAccessToken()
    return fetchRequest(route, {
      bearerToken: accessToken,
      body,
      method: 'POST',
      version: options?.version,
    })
  }

  const deleteRequest = async (route: string, options?: RequestOptions) => {
    const accessToken = await getAccessToken()
    return fetchRequest(route, {
      bearerToken: accessToken,
      method: 'DELETE',
      version: options?.version,
    })
  }

  const getImage = async (route: string, options?: RequestOptions) => {
    const accessToken = await getAccessToken()
    const response = await fetchRequest(route, {
      bearerToken: accessToken,
      method: 'GET',
      version: options?.version,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  }

  return {
    get,
    post,
    deleteRequest: deleteRequest,
    getImage
  }
}
