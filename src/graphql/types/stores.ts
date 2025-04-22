
// This file contains the GraphQL types for the stores API.
export interface StoreItem {
    id: string;
    parent_name: string;
    product_name: string;
    total: number;
    damaged: number;
    returned: number;
    sold: number;
    available: number;
    created_at: string;
    updated_at: string;
}

// The StoresResponse interface defines the structure of the response from the stores API.
export interface StoresResponse {
    stores: {
        total: number;
        pages: number;
        items: StoreItem[];
    };
}