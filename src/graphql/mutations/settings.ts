import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries

export const DELETE_RATING = gql`
    mutation DeleteRating($id: String!) {
        deleteRating(id: $id) {
            id
            status
            message
        }
    }
`;

