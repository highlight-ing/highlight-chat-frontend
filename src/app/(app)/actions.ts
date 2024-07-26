"use server";

// Hard code this, probably move to an env variable later on
const HIGHLIGHT_CLIENT_ID =
  "e64e0f07dd078e9750a2d8cca0b8e90849b9689aa601247aa4fafee8089cd3d4";
const HIGHLIGHT_CLIENT_SECRET = process.env.HIGHLIGHT_AUTH_CLIENT_SECRET;

/**
 * Refreshes the Highlight access token using the Highlight Oauth service
 * @see https://docs.highlight.ing/learn/developers/authentication#refreshing-a-token
 */
export async function refreshTokens(refreshToken: string) {
  if (!HIGHLIGHT_CLIENT_SECRET) {
    throw new Error(
      "HIGHLIGHT_CLIENT_SECRET must be set, check your .env file"
    );
  }

  const formData = new FormData();

  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", refreshToken);
  formData.append("client_id", HIGHLIGHT_CLIENT_ID);
  formData.append("client_secret", HIGHLIGHT_CLIENT_SECRET);

  // Send a request to refresh the auth token
  const response = await fetch(
    "https://backend.workers.highlight.ing/v1/auth/token",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const responseBody = await response.text();

    console.error("Auth refresh response body:", responseBody);

    throw new Error(
      "Failed to refresh token, Highlight auth service returned a non-OK status."
    );
  }

  const tokensResponse = await response.json();

  return tokensResponse as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
