import { createContext, ReactNode, useContext } from 'react';

type AuthContextProps = {
  username: string;
};
const AuthContext = createContext<AuthContextProps>({
  username: '',
});

export function useUsername() {
  const ctx = useContext(AuthContext);
  return ctx.username;
}

export function Auth({ children }: { children?: ReactNode }) {
  const cookies = new URLSearchParams(document.cookie);
  const loggedInUser: string | null = cookies.get('UNREED_USER');
  if (loggedInUser == null) {
    return (
      <div>
        Not logged in. <a href="/login">Login</a>
      </div>
    );
  } else {
    return (
      <AuthContext.Provider value={{ username: loggedInUser }}>{children}</AuthContext.Provider>
    );
  }
}
