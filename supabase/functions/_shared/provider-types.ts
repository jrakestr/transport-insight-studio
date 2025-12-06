// Provider type classification for transit industry entities

export const PROVIDER_TYPES = {
  OPERATOR: 'operator',      // Companies that operate transit services (e.g., First Transit, MV Transportation)
  TECHNOLOGY: 'technology',  // Software/platform providers (e.g., Trapeze, Via, Swiftly)
  TNC: 'tnc',               // Transportation Network Companies (e.g., Uber, Lyft)
  OEM: 'oem',               // Vehicle/equipment manufacturers (e.g., New Flyer, Gillig, BYD)
  CONSULTANT: 'consultant', // Planning/advisory firms (e.g., WSP, AECOM)
  SERVICE: 'service',       // Other service providers (brokers, staffing, etc.)
} as const;

export type ProviderType = typeof PROVIDER_TYPES[keyof typeof PROVIDER_TYPES];

// Transit modes from NTD definitions
export const TRANSIT_MODES = [
  { value: 'MB', label: 'Bus' },
  { value: 'RB', label: 'Bus Rapid Transit' },
  { value: 'CB', label: 'Commuter Bus' },
  { value: 'DR', label: 'Demand Response' },
  { value: 'DT', label: 'Demand Response Taxi' },
  { value: 'VP', label: 'Vanpool' },
  { value: 'LR', label: 'Light Rail' },
  { value: 'HR', label: 'Heavy Rail' },
  { value: 'CR', label: 'Commuter Rail' },
  { value: 'SR', label: 'Streetcar Rail' },
  { value: 'TB', label: 'Trolleybus' },
  { value: 'FB', label: 'Ferryboat' },
  { value: 'MG', label: 'Monorail/Automated Guideway' },
  { value: 'CC', label: 'Cable Car' },
  { value: 'IP', label: 'Inclined Plane' },
  { value: 'PB', label: 'Publico' },
] as const;

export const TRANSIT_MODE_VALUES = TRANSIT_MODES.map(m => m.value);

// Software categories for technology providers
export const SOFTWARE_CATEGORIES = [
  { value: 'cad_avl', label: 'CAD/AVL' },
  { value: 'scheduling', label: 'Scheduling & Planning' },
  { value: 'fare_payment', label: 'Fare Payment' },
  { value: 'passenger_info', label: 'Passenger Information' },
  { value: 'fleet_management', label: 'Fleet Management' },
  { value: 'analytics', label: 'Analytics & BI' },
  { value: 'demand_response', label: 'Demand Response' },
  { value: 'microtransit', label: 'Microtransit' },
  { value: 'maintenance', label: 'Maintenance Management' },
  { value: 'safety', label: 'Safety & Security' },
  { value: 'ev_charging', label: 'EV Charging' },
  { value: 'other', label: 'Other' },
] as const;

// Helper to determine which table a provider should be routed to
export function getProviderTable(providerType: string): 'software_providers' | 'service_providers' {
  return providerType === PROVIDER_TYPES.TECHNOLOGY ? 'software_providers' : 'service_providers';
}

// Interface for extracted provider data
export interface ExtractedProvider {
  name: string;
  location?: string;
  provider_type: ProviderType;
  notes?: string;
  website?: string;
  // For technology providers only:
  software_category?: string;
  transit_modes?: string[];
}
