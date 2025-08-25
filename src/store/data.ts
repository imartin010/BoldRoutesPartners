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
}));
