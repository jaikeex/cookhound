import { useLazyQuery } from '@apollo/client';
import type { ApolloError } from '@apollo/client';
import { LOGIN_QUERY } from 'core/graphql';
import { useDispatch } from 'react-redux';
import { setLogin } from 'store/authSlice';
import { setMessage } from 'utils';

interface IUseLogin {
  login: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
}

export const useLogin = (): IUseLogin => {
  const dispatch = useDispatch();

  const [loginQuery, { loading }] = useLazyQuery(LOGIN_QUERY, {
    fetchPolicy: 'no-cache'
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await loginQuery({
      variables: { email, password }
    });

    if (response && response.data) {
      dispatch(setLogin({ user: response.data.login.user }));
      return true;
    }

    return false;
  };

  return { login, loading };
};