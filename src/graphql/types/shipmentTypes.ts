export interface Address {
    id: string;
    name: string;
    phone: string;
    state: string;
    city: string;
    district: string;
    address: string;
}

export interface Branches {
    sender: Address;
    received: Address;
}

export interface Shipment {
    id: string;
    order_no: string;
    tracking_no: string;
    note?: string;
    amount: number;
    status: string;
    shipment_type: string;
    order_type: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    delivered_date?: string;
    label?: string;
    branches: Branches;
}

export interface Customer {
    sender: Address;
    received: Address;
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    amount: number;
    status: string;
}

export interface Invoice {
    id: string;
    invoice_no: string;
    payment_method: string;
    currency: string;
    amount: number;
    shipping_price: number;
    total: number;
    status: string;
    received_by: string;
    created_at: string;
    updated_at: string;
}

export interface Tracking {
    id: string;
    tracking_no: string;
    status: string;
    tracking_type: string;
    tracking: string;
    note?: string;
    location: string;
    updated_by: string;
    updated_at: string;
}

export interface Order {
    shipment: Shipment;
    customers: Customer;
    items: OrderItem[];
    invoices: Invoice[];
    tracking: Tracking[];
}

export interface ShipmentResponse {
    order: any;
    shipment: {
        order: Order;
    };
}
