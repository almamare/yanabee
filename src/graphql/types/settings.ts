
/**
 * @description Settings type
 * This should match the input type defined in your GraphQL schema.
 */
export interface Ratings {
    id: string;
    user: string;
    role: string;
    rating: number;
    feedback: string;
    created_at: string;
}