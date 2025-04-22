'use client';

import { useRouter } from 'next/navigation';
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import Cookies from 'js-cookie';

const useCreateApolloClient = () => {
  const router = useRouter();

  // Create an HttpLink to your GraphQL endpoint
  const httpLink = new HttpLink({
    uri: 'http://localhost/admin/', // Replace with your GraphQL endpoint
  });

  // Create an authLink to set the Authorization header
  const authLink = setContext((_, { headers }) => {
    // Retrieve the token from cookies
    let token = '';
    if (typeof window !== 'undefined') {
      token = Cookies.get('token') || ''; // 'token' is the cookie name
    }

    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  // Create an errorLink to handle errors globally
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message }) => {
        if (message.includes('Unauthorized')) {
          // Redirect to login if unauthorized
          router.push('/login');
        }
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  // Combine the links
  const link = ApolloLink.from([authLink, errorLink, httpLink]);

  // Initialize Apollo Client
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });

  return client;
};

export default useCreateApolloClient;
