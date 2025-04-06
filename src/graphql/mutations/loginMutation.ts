import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client

// Define the mutation to log in a user with a phone and password
export const LOGIN_MUTATION = gql`
    mutation Login($phone: String!, $password: String!) {
        login(phone: $phone, password: $password) {
            token
            expires
            manager {
                name
                surname
                email
                phone
                code
                number
                role
                type
                status
                created_at
            }
        }
    }
`;