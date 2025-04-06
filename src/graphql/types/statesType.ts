// locationTypes.ts
// ----------------

// Interfaces for your location data
export interface State {
    state_code: string;
    state_name: string;
  }
  
  export interface City {
    city_code: string;
    city_name: string;
  }
  
  export interface District {
    district_id: string;
    district_name: string;
  }

  export interface Branch {
    name: string;
    user_id: string;
  }
  
  // This is the shape of the data returned by your GraphQL query:
  export interface LocationData {
    states: State[];
    cities: City[];
    districts: District[];
    branches: Branch[];
  }
  
  // This is the shape of the variables you will pass to the query:
  export interface LocationVariables {
    stateCode?: string | null;
    cityCode?: string | null;
    stateName?: string | null;
  }
  