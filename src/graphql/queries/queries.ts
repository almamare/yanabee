import { gql } from '@apollo/client'; // Import the gql tag from Apollo Client for use in queries

// Define the query to get a manager by ID
export const GET_MANAGER_QUERY = gql`
  query GetManager($id: Int!) {
    manager(id: $id) {
      manager_id
      manager_no
      name
      surname
      email
      phone
      role
      status
      created_at
      updated_at
    }
  }
`;

// Define the query to get a list of managers
export const SHIPMENTS_QUERY = gql`
  query Shipments($search: String, $status: String, $page: Int, $limit: Int) {
    shipments(search: $search, status: $status, page: $page, limit: $limit) {
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
        label               
      }
    }
  }
`;


// Define the query to get a shipment by ID
export const SHIPMENT_QUERY = gql`
  query Shipment($shipment_id: String!) {
    shipment(shipment_id: $shipment_id) {
      order {
        shipment {
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
          label
          branches {
            sender {
              id name phone state city district address
            }
            received {
              id name phone state city district address
            }
          }
        }
        customers {
          sender {
            id name phone state city district address
          }
          received {
            id name phone state city district address
          }
        }
        items {
          id name price quantity amount status
        }
        invoices {
          id invoice_no payment_method currency amount shipping_price total status received_by created_at updated_at
        }
        tracking {
          id tracking_no status tracking_type tracking note location updated_by updated_at
        }
      }
    }
  }
`;

// Define the query to get a list of users
export const USERS_QUERY = gql`
    query Users($role: String!, $search: String, $page: Int, $limit: Int) {
        users(role: $role, search: $search, page: $page, limit: $limit) {
            total
            pages
            items {
                id
                name
                surname
                phone
                email
                code
                number
                role
                user_type
                status
                created_at
                updated_at
            }
        }
    }
`;

// Define the query to get a list of users
export const GET_LOCATIONS = gql`
    query States($stateCode: String, $cityCode: String, $stateName: String) {
        states {
            state_code
            state_name
        }
        cities(state_code: $stateCode) {
            city_code
            city_name
        }
        districts(city_code: $cityCode) {
            district_id
            district_name
        }
        branches(state_name: $stateName) {
            user_id
            name
        }
    }
`;