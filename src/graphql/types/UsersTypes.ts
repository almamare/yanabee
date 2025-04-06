/**
 * Represents a single user object from the query.
 */
export interface User {
    id: string;         // or number, depending on your schema
    name: string;
    surname: string;
    phone: string;
    email: string;
    code: string;
    number: string;
    role: string;
    user_type: string;
    status: string;
    created_at: string; // or Date if you convert them in your code
    updated_at: string; // or Date if you convert them in your code
  }
  
  /**
   * Represents the top-level users query response.
   */
  export interface UsersResponse {
    total: number;
    pages: number;
    items: User[];
  }
  