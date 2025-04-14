
import { Branch, State, City, District } from './statesType';

/**
* @description User response type
* This should match the output type defined in your GraphQL schema.
*/
export interface UserResponse {
    user: User;
    address: Address;
    balance: Balance;
    client: Client;
    states: State[];
    cities: City[];
    districts: District[];
    branches: Branch[];
}


/**
 * @description User variables type
 * This should match the input type defined in your GraphQL schema.
 */
export interface UserVariables {
    user_id: string;
}

/**
 * @description User types
 * This should match the input type defined in your GraphQL schema.
 */
export interface User {
    id: string;
    name: string;
    surname: string;
    phone: string;
    email: string;
    code: string;
    number: number;
    role: string;
    user_type: string;
    status: string;
    created_at: string;
    updated_at: string;
}

/**
 * @description Address type
 * This should match the input type defined in your GraphQL schema.
 */
export interface Address {
    id: string;
    name: string;
    phone: string;
    address_type: string;
    state: string;
    city: string;
    district: string;
    address: string;
    created_at: string;
    updated_at: string;
}

/**
 * @description Balance type
 * This should match the input type defined in your GraphQL schema.
 */
export interface Balance {
    id: string;
    amount: number;
    currency: string;
    created_at: string;
    updated_at: string;
}

/**
 * @description Client type
 * This should match the input type defined in your GraphQL schema.
 */
export interface Client {
    name: string;
    number: string;
    level: number;
    client_type: string;
    parent_name: string | null;
    parent_number: string | null;
    parent_level: number | null;
    branch_name: string | null;
    created_at: string;
    updated_at: string;
}

// Interfaces for UpdatePassword mutation

/** 
 * Variables required to perform the updatePassword mutation.
 */
export interface UpdatePasswordVariables {
    user_id: string;
    password: string;
}

/**
 * The shape of the data returned by the updatePassword mutation.
 */
export interface UpdatePasswordResponse {
    updatePassword: {
        id: string;
        number: string;
        message: string;
    };
}
