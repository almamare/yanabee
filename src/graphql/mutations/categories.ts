import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries

// Define the mutation to create a new category
export const CREATE_CATEGORY = gql`
    mutation CreateCategory($parent_id: String $category_type: String! $name: String! $img: String $description: String) {
        createCategory( parent_id: $parent_id category_type: $category_type name: $name img: $img description: $description ) {
            id
            number
            message
        }
    }
`;

// Mutation: update an existing category
export const UPDATE_CATEGORY = gql`
    mutation UpdateCategory(
        $id: String!
        $name: String!
        $img: String
        $description: String
    ) {
        updateCategory(
        id: $id
        name: $name
        img: $img
        description: $description
        ) {
        id
        number
        message
        }
    }
`;

// Define the mutation to delete a category
export const DELETE_CATEGORY = gql`
    mutation DeleteCategory($id: String!) {
        deleteCategory(id: $id) {
            id
            status
            message
        }
    }
`;