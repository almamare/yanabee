// src/graphql/queries/users.ts
import { gql } from "@apollo/client";


// This query is used to fetch a list of users from the system. It takes optional parameters such as page, limit, and search to filter the results.
export const GET_USER = gql`
    query User($user_id: String!) {
        user(user_id: $user_id) {
            user {
                name
                surname
                phone
                email
            }
        }
    }
`;
