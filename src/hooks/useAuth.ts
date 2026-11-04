import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook providing authentication state and operations.
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
