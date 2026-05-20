import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'nuvora_access_token';

const isProduction = process.env.NODE_ENV === 'production';

export const authCookies = {
  getToken: (): string | null => {
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
  },

  setToken: (token: string): void => {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: 1,
      sameSite: isProduction ? 'strict' : 'lax',
      secure: isProduction,
    });
  },

  removeToken: (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY);
  },
};
