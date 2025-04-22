import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries

export const UPDATE_STORE = gql`
    mutation UpdateStore(
        $id: String!
        $parent_name: String
        $product_name: String
        $total: Int
        $damaged: Int
        $returned: Int
        $sold: Int
        $available: Int
    ) {
        updateStore(
            id: $id
            parent_name: $parent_name
            product_name: $product_name
            total: $total
            damaged: $damaged
            returned: $returned
            sold: $sold
            available: $available
        ) {
            id
            number
            message
        }
    }
`;