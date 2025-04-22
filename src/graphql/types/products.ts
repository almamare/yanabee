export interface Product {
    id: string;
    name: string;
    number: string;
    short_desc: string;
    description: string;
    discount_price: string;
    regular_price: string;
    discount: number;
    status: string;
    barcode: string;
    created_at: string;
    updated_at: string;
}

export interface ProductsResponse {
    products: {
        total: number;
        pages: number;
        items: Product[];
    };
}