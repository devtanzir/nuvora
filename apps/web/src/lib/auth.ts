import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'nuvora_access_token';

export const authCookies = {
  getToken: () => Cookies.get(ACCESS_TOKEN_KEY) ?? null,

  setToken: (token: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: 1 / 96, // 15 minutes
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  },

  removeToken: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
  },
};
