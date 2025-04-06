import { gql } from '@apollo/client';

// This mutation is used to create a new user in the system. It takes various parameters such as role, surname, phone, email, password, and address details.
export const CREATE_USER_MUTATION = gql`
    mutation CreateUser(
        $role: String!
        $surname: String!
        $phone: String!
        $email: String!
        $password: String!
        $confirmPassword: String!
        $address_name: String!
        $address_phone: String!
        $state: String!
        $city: String!
        $district: String!
        $address: String!
        $branch_id: String!
        $client_type: String!
        $balance: Int!
        $currency: String!
        $userType: String!
        $name: String!
    ) {
        createUser(
            role: $role
            surname: $surname
            phone: $phone
            email: $email
            password: $password
            confirmPassword: $confirmPassword
            address_name: $address_name
            address_phone: $address_phone
            state: $state
            city: $city
            district: $district
            address: $address
            branch_id: $branch_id
            client_type: $client_type
            balance: $balance
            currency: $currency
            userType: $userType
            name: $name
        ) {
            id
            number
            message
        }
    }
`;
