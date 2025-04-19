
// This file contains the TypeScript interfaces for the categories GraphQL API response.
export interface Category {
    id: string;
    name: string;
    description: string;
    category_type: string;
    img: string;
    created_at: string;
    updated_at: string;
}

// This interface represents the structure of the response from the categories query.
export interface CategoriesResponse {
    categories: {
        total: number;
        pages: number;
        items: Category[];
    };
}