import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries

// Define the mutation to create a rating
export const DELETE_RATING = gql`
    mutation DeleteRating($id: String!) {
        deleteRating(id: $id) {
            id
            status
            message
        }
    }
`;

// Define the mutation to delete an advertisement
export const CREATE_ADVERTISEMENT = gql`
    mutation CreateAdvertisement($title: String!, $img: String!, $role: String!) {
        createAdvertisement(title: $title, img: $img, role: $role) {
            id
            number
            message
        }
    }
`;

// Define the mutation to delete an advertisement
export const DELETE_ADVERTISEMENT = gql`
    mutation DeleteAdvertisement($id: String!) {
        deleteAdvertisement(id: $id) {
            id
            status
            message
        }
    }
`;

// Define the mutation to create a payment method
export const CREATE_PAYMENT_METHOD = gql`
    mutation CreatePaymetMethod($method_name: String! $description: String) {
        createPaymetMethod(method_name: $method_name description: $description) {
            id
            number
            message
        }
    }
`;

// Define the mutation to create an order type
export const DELETE_PAYMENT_METHOD = gql`
    mutation DeletePaymentMethod($id: String!) {
        deletePaymentMethod(id: $id) {
            id
            status
            message
        }
    }
`;

// Define the mutation to create an order type
export const CREATE_ORDER_TYPE = gql`
    mutation CreateOrderType($type_name: String!, $description: String) {
        createOrderType(type_name: $type_name, description: $description) {
            id
            number 
            message 
        }
    }
`;

// Define the mutation to delete an order type
export const DELETE_ORDER_TYPE = gql`
    mutation DeleteOrderType($id: String!) {
        deleteOrderType(id: $id) {
            id
            status
            message
        }
    }
`;

// Define the mutation to create a state
export const CREATE_CITY = gql`
    mutation CreateCity($state_code: String!, $city_name: String!) {
        createCity(state_code: $state_code, city_name: $city_name) {
            id
            number
            message
        }
    }
`;

// Define the mutation to create a state
export const DELETE_CITY = gql`
    mutation DeleteCity($city_code: Int!) {
        deleteCity(city_code: $city_code) {
            id
            status
            message
        }
    }
`;

// Define the mutation to create a district
export const CREATE_DISTRICT = gql`
  mutation CreateDistrict($city_code: Int!, $district_name: String!) {
    createDistrict(city_code: $city_code, district_name: $district_name) {
      id
      message
      number
    }
  }
`;

// Define the mutation to delete a district
export const DELETE_DISTRICT = gql`
    mutation DeleteDistrict($district_id: Int!) {
        deleteDistrict(district_id: $district_id) {
            id
            status
            message
        }
    }
`;

// Mutation: update settings
export const UPDATE_SETTINGS = gql`
    mutation UpdateSettings(
        $setting_id: String
        $title: String
        $support_phone: String
        $support_email: String
        $description: String
        $privacy_policy: String
        $terms_of_use: String
        $content: String
        $about: String
    ) {
        updateSettings(
        setting_id: $setting_id
        title: $title
        support_phone: $support_phone
        support_email: $support_email
        description: $description
        privacy_policy: $privacy_policy
        terms_of_use: $terms_of_use
        content: $content
        about: $about
        ) {
        id
        number
        message
        }
    }
`;

// Define the mutation to create a tutorial
export const UPDATE_TUTORIAL = gql`
    mutation UpdateTutorial($id: String!, $title: String!, $content: String!, $url: String!) {
        updateTutorial(id: $id, title: $title, content: $content, url: $url) {
            id
            number
            message
        }
    }
`;

// Define the mutation to delete a tutorial
export const DELETE_TUTORIAL = gql`
    mutation DeleteTutorial($id: String!) {
        deleteTutorial(id: $id) {
            id
            status
            message
        }
    }
`;

// Define the mutation to create a tutorial
export const CREATE_TUTORIAL = gql`
    mutation CreateTutorial(
        $title: String!
        $content: String!
        $url: String!
        $role: String!
    ) {
        createTutorial(title: $title, content: $content, url: $url, role: $role) {
        id
        number
        message
        }
    }
`;
