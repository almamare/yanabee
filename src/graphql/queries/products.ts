import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries


export const PRODUCTS_QUERY = gql`
    query Products($role_type: String, $search: String, $page: Int, $limit: Int) {
        products(role_type: $role_type, search: $search, page: $page, limit: $limit) {
            total
            pages
            items {
            id
            name
            number
            short_desc
            description
            discount_price
            regular_price
            discount
            status
            barcode
            created_at
            updated_at
            }
        }
    }
`;

