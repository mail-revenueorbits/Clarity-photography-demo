import { Lead } from '../types';
import { mockLeads } from './mockData';

const STORAGE_KEY = 'demo_leads_v3';

const getLeadsFromStorage = (): Lead[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockLeads));
    return mockLeads;
  }
  return JSON.parse(stored);
};

const saveLeadsToStorage = (leads: Lead[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
};

export const leadService = {
  async fetchLeads(): Promise<Lead[]> {
    const leads = getLeadsFromStorage();
    return leads.filter(l => !l.isDeleted).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
    const leads = getLeadsFromStorage();
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isDeleted: false
    };
    leads.unshift(newLead);
    saveLeadsToStorage(leads);
    return newLead;
  },

  async updateLead(lead: Lead): Promise<Lead> {
    const leads = getLeadsFromStorage();
    const index = leads.findIndex(l => l.id === lead.id);
    if (index > -1) {
      leads[index] = lead;
      saveLeadsToStorage(leads);
      return lead;
    }
    throw new Error('Lead not found');
  },

  async deleteLead(id: string): Promise<boolean> {
    const leads = getLeadsFromStorage();
    const index = leads.findIndex(l => l.id === id);
    if (index > -1) {
      leads[index].isDeleted = true;
      saveLeadsToStorage(leads);
      return true;
    }
    return false;
  }
};
