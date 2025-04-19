import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries

// Define the query to get a list of ratings
export const RATINGS_QUERY = gql`
    query Ratings($role: String, $search: String, $page: Int, $limit: Int) {
        ratings(role: $role, search: $search, page: $page, limit: $limit) {
        total
        pages
        items {
            id
            user
            role
            rating
            feedback
            created_at
            }
        }
    }
`;

// Define the query to get a list of advertisements
export const ADVERTISEMENTS_QUERY = gql`
    query Advertisements($role: String, $search: String, $page: Int, $limit: Int) {
        advertisements(role: $role, search: $search, page: $page, limit: $limit) {
        total
        pages
        items {
            id
            title
            img
            role
            created_at
            updated_at
        }
        }
    }
`;

// Define the query to get a list of payment methods, order types, and settings
export const PAYMENT_SETTINGS_STATES_QUERY = gql`
    query PaymentMethods {
        paymentMethods {
            id
            method_name
            description
        }
        orderTypes {
            id
            type_name
            description
        }
        settings {
            id
            role
            title
            support_phone
            support_email
            description
            privacy_policy
            terms_of_use
            content
            about
        }
        states {
            state_code
            state_name
        }
    }
`;

// Define the query to get a list of cities by state code
export const GET_CITIES_BY_STATE = gql`
    query getCitiesByState($state_code: String) {
        cities(state_code: $state_code) {
            city_code
            city_name
        }
    }
`;

// Define the query to get a list of districts by city code
export const GET_DISTRICTS_BY_CITY = gql`
    query getDistrictsByCity($city_code: String) {
        districts(city_code: $city_code) {
            district_id
            district_name
        }
    }
`;

// Define the query to get a list of branches by district ID
export const GET_STATES = gql`
    query States {
        states {
            state_code
            state_name
        }
    }
`;

// Define the query to get a list of cities by state code
export const CITIES_QUERY = gql`
    query Cities($state_code: String!) {
        cities(state_code: $state_code) {
            city_code
            city_name
        }
    }
`;

// Define the query to get a list of districts by city code
export const GET_SETTINGS = gql`
    query Settings {
        settings {
            id
            title
            support_phone
            support_email
            description
            privacy_policy
            terms_of_use
            content
            about
        }
    }
`;

// Define the query to get a list of tutorials
export const TUTORIALS_QUERY = gql`
    query Tutorials($role: String, $search: String, $page: Int, $limit: Int) {
        tutorials(role: $role, search: $search, page: $page, limit: $limit) {
            total
            pages
            items {
            id
            title
            content
            url
            role
            created_at
            updated_at
            }
        }
    }
`;

// Define the query to get a specific tutorial by ID
export const GET_TUTORIAL = gql`
    query Tutorial($id: String!) {
        tutorial(id: $id) {
            id
            title
            content
            url
            role
            created_at
            updated_at
        }
    }
`;