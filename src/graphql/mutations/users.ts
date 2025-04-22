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

// This mutation is used to update the password of an existing user. It takes the user ID and the new password as parameters.
export const UPDATE_PASSWORD_MUTATION = gql`
    mutation UpdatePassword ($user_id: String!, $password: String!) {
        updatePassword(user_id: $user_id, password: $password) {
            id
            number
            message
        }
    }
`;

// This mutation is used to update the branch of an existing user. It takes the user ID and the new branch ID as parameters.
export const UPDATE_BRANCH_MUTATION = gql`
    mutation UpdateBranch($user_id: String!, $branch_id: String!) {
        updateBranch(user_id: $user_id, branch_id: $branch_id) {
            id
            number
            message
        }
    }
`;

// This mutation is used to update the status of an existing user. It takes the user ID and the new status as parameters.
export const UPDATE_STATUS_MUTATION = gql`
    mutation UpdateStatus($user_id: String!, $status: String!) {
        updateStatus(user_id: $user_id, status: $status) {
            id
            number
            message
        }
    }
`;

export const UPDATE_ADDRESS_MUTATION = gql`
    mutation UpdateAddress(
        $user_id: String!
        $name: String!
        $phone: String!
        $state: String!
        $city: String!
        $district: String!
        $address: String!
    ) {
        updateAddress(
            user_id: $user_id
            name: $name
            phone: $phone
            state: $state
            city: $city
            district: $district
            address: $address
        ) {
            id
            number
            message
        }
    }
`;

// This mutation is used to update the details of an existing user. It takes the user ID and various other parameters such as name, surname, phone, and email.
export const UPDATE_USER = gql`
    mutation UpdateUser(
        $user_id: String!
        $name: String
        $surname: String
        $phone: String
        $email: String
    ) {
        updateUser(
        user_id: $user_id
        name: $name
        surname: $surname
        phone: $phone
        email: $email
        ) {
            id
            number
            message
        }
    }
`