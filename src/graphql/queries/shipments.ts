import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries

// Define the query to get a shipment by ID
export const SHIPMENTS_QUERY = gql`
    query Shipments(
        $status: String
        $search: String
        $page: Int
        $limit: Int
        $shipment_type: String
    ) {
        shipments(
        status: $status
        search: $search
        page: $page
        limit: $limit
        shipment_type: $shipment_type
        ) {
        total
        pages
        items {
            id
            order_no
            tracking_no
            note
            amount
            status
            shipment_type
            order_type
            created_by
            created_at
            updated_at
            delivered_date
            }
        }
    }
`;


// Define the query to get a shipment by ID
export const SEARCH_SHIPMENTS = gql`
  query SearchShipment($order_no: String, $tracking_no: String, $created_at: String) {
    searchShipment(order_no: $order_no, tracking_no: $tracking_no, created_at: $created_at) {
      id
      order_no
      tracking_no
      note
      amount
      status
      role
      shipment_type
      archives
      order_type
      created_at
      updated_at
      delivered_date
    }
  }
`;
