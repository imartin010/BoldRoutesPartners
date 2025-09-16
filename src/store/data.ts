import { create } from 'zustand';
import developersData from '../data/developers.json';
import commissionsData from '../data/commissions.json';
import launchesData from '../data/launches.json';
import inventoryData from '../data/inventory.json';

interface Developer {
  id: string;
  name: string;
  logo: string | null;
  primaryPhone: string;
}

interface Commission {
  developerId: string;
  developerName: string;
  commissionPercent: number;
  projects: string;
}

interface Launch {
  id: string;
  developerId: string;
  projectName: string;
  area: string;
  minPrice: number;
  launchDateISO: string;
  phone: string;
}

interface InventoryItem {
  id: string;
  projectName: string;
  area: string;
  developerName: string;
  devSalesPhone: string;
}

interface PartnerApplication {
  id: string;
  fullName: string;
  phoneNumber: string;
  companyName: string;
  salesAgentsCount: number;
  hasRegisteredPapers: boolean;
  createdAt: string;
}

interface ClosedDeal {
  id: string;
  developerName: string;
  projectName: string;
  clientFullName: string;
  unitCode: string;
  developerSalesName: string;
  developerPhone: string;
  dealValue: number;
  fileNames: string[];
  createdAt: string;
}

interface DataStore {
  developers: Developer[];
  commissions: Commission[];
  launches: Launch[];
  inventory: InventoryItem[];
  partnerApplications: PartnerApplication[];
  closedDeals: ClosedDeal[];
  
  // Actions
  loadFromLocalStorage: () => void;
  addPartnerApplication: (application: Omit<PartnerApplication, 'id' | 'createdAt'>) => void;
  addClosedDeal: (deal: Omit<ClosedDeal, 'id' | 'createdAt'>) => void;
  loadLiveCommissions: () => Promise<void>;
  
  // Selectors
  getDeveloperById: (id: string) => Developer | undefined;
  getCommissionByDeveloperId: (developerId: string) => Commission | undefined;
  getCommissionByDeveloperName: (name: string) => Commission | undefined;
}

export const useDataStore = create<DataStore>((set, get) => ({
  developers: developersData as Developer[],
  commissions: commissionsData as Commission[],
  launches: launchesData as Launch[],
  inventory: inventoryData as InventoryItem[],
  partnerApplications: [],
  closedDeals: [],

  loadFromLocalStorage: () => {
    try {
      const applications = localStorage.getItem('brp_partner_applications');
      const deals = localStorage.getItem('brp_closed_deals');
      
      set({
        partnerApplications: applications ? JSON.parse(applications) : [],
        closedDeals: deals ? JSON.parse(deals) : [],
      });
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  },

  addPartnerApplication: (application) => {
    const newApplication: PartnerApplication = {
      ...application,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedApplications = [...get().partnerApplications, newApplication];
    set({ partnerApplications: updatedApplications });
    
    try {
      localStorage.setItem('brp_partner_applications', JSON.stringify(updatedApplications));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  addClosedDeal: (deal) => {
    const newDeal: ClosedDeal = {
      ...deal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedDeals = [...get().closedDeals, newDeal];
    set({ closedDeals: updatedDeals });
    
    try {
      localStorage.setItem('brp_closed_deals', JSON.stringify(updatedDeals));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getDeveloperById: (id) => {
    return get().developers.find(dev => dev.id === id);
  },

  getCommissionByDeveloperId: (developerId) => {
    return get().commissions.find(comm => comm.developerId === developerId);
  },

  getCommissionByDeveloperName: (name) => {
    return get().commissions.find(comm => comm.developerName === name);
  },

  loadLiveCommissions: async () => {
    try {
      // Import the admin API function
      const { listCommissionRates } = await import('../api/admin');
      
      // Load commission rates from database
      const dbRates = await listCommissionRates({ page: 1, pageSize: 1000 });
      
      // Start with base commissions from JSON
      const baseCommissions = [...commissionsData] as Commission[];
      
      // Override with database rates where they exist
      if (dbRates.rows && dbRates.rows.length > 0) {
        const updatedCommissions = baseCommissions.map(jsonComm => {
          // Look for a database override for this developer
          const dbOverride = dbRates.rows.find(dbRate => 
            dbRate.developers?.name?.toLowerCase() === jsonComm.developerName.toLowerCase() && 
            !dbRate.project_id // Only general rates, not project-specific
          );
          
          if (dbOverride) {
            // Override the JSON rate with database rate
            return {
              ...jsonComm,
              commissionPercent: dbOverride.percentage
            };
          }
          
          return jsonComm;
        });
        
        set({ commissions: updatedCommissions });
      }
    } catch (error) {
      console.error('Failed to load live commissions:', error);
      // Fall back to JSON data if there's an error
      set({ commissions: commissionsData as Commission[] });
    }
  },
}));
