import { useAuthContext } from '../context/AuthContext';

/** Custom hook untuk mengakses state autentikasi dan operasi login/logout/register. */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
