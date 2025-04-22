import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries

// Define the query to get a list of categories
export const CATEGORIES_QUERY = gql`
    query Categories($category_type: String, $search: String, $page: Int, $limit: Int) {
        categories(category_type: $category_type, search: $search, page: $page, limit: $limit) {
            total
            pages
            items {
                id
                name
                description
                category_type
                img
                created_at
                updated_at
            }
        }
    }
`;

// Define the query to get a list of main categories
export const GET_MAIN_CATEGORIES = gql`
    query MainCategories($category_type: String!, $limit: Int) {
        categories(category_type: $category_type search: null page: null limit: $limit) {
            items {
                id
                name
            }
        }
    }
`;

// Define the query to get a single category by ID
export const GET_CATEGORY = gql`
    query Category($id: String!) {
        category(id: $id) {
            id
            name
            description
            category_type
            img
            created_at
            updated_at
        }
    }
`;

export const GET_SUB_CATEGORIES = gql`
  query SubCategories($parent_id: String!) {
    categories(parent_id: $parent_id, category_type: "فرعي") {
      items {
        id
        name
      }
    }
  }
`;