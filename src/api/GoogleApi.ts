import { TokenResponse } from '@react-oauth/google';
import { GoogleUserInfo } from '../types/GoogleUserInfo';

export const getUserInfo = async (tokenResponse: TokenResponse) => {
  const userInfoResponse = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`,
    {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
        Accept: 'application/json',
      },
    }
  );

  const userInfo: GoogleUserInfo = await userInfoResponse.json();
  return userInfo;
};
