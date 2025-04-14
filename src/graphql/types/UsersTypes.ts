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

/**
* Represents the input for creating a new user.
* This should match the input type defined in your GraphQL schema.
*/
export interface CreateUserInput {
    role: string;
    surname: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    address_name: string;
    address_phone: string;
    state: string;
    city: string;
    district: string;
    address: string;
    branch_id: string;
    client_type: string;
    balance: number;
    currency: string;
    userType: string;
    name: string;
}

/**
* Represents the response from the createUser mutation.
* This should match the output type defined in your GraphQL schema.
*/
export interface CreateUserResponse {
    createUser: {
        id: string;
        number: string;
        message: string;
    };
}