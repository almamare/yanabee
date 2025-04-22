import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries


export const CREATE_PRODUCT = gql`
    mutation CreateProduct(
        $name: String!
        $category_id: String!
        $short_desc: String
        $description: String
        $discount_price: String
        $regular_price: String
        $discount: Int
        $total: Int!
        $damaged: Int
        $returned: Int
        $sold: Int
    ) {
        createProduct(
        name: $name
        category_id: $category_id
        short_desc: $short_desc
        description: $description
        discount_price: $discount_price
        regular_price: $regular_price
        discount: $discount
        total: $total
        damaged: $damaged
        returned: $returned
        sold: $sold
        ) {
        id
        number
        message
        }
    }
`;