import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries


// src/graphql/queries/stores.ts
export const STORES_QUERY = gql`
    query Stores($store_type: String, $search: String, $page: Int, $limit: Int) {
        stores(store_type: $store_type, search: $search, page: $page, limit: $limit) {
            total
            pages
            items {
                id
                parent_name
                product_name
                total
                damaged
                returned
                sold
                available
                created_at
                updated_at
            }
        }
    }
`;

export const GET_STORE = gql`
    query Store($id: String!) {
        store(id: $id) {
            id
            parent_name         
            product_name         
            total               
            damaged              
            returned             
            sold                 
            available    
        }
    }
`;