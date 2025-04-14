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