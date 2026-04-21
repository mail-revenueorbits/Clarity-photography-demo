import { Session } from '../types';
import { mockSessions } from './mockData';

const STORAGE_KEY = 'demo_sessions_v3';

const getSessionsFromStorage = (): Session[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSessions));
    return mockSessions;
  }
  return JSON.parse(stored);
};

const saveSessionsToStorage = (sessions: Session[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const sessionService = {
  async fetchSessions(): Promise<Session[]> {
    const sessions = getSessionsFromStorage();
    return sessions.filter(s => !s.isDeleted).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async fetchDeletedSessions(): Promise<Session[]> {
    const sessions = getSessionsFromStorage();
    return sessions.filter(s => s.isDeleted).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createSession(session: Session): Promise<Session | null> {
    const sessions = getSessionsFromStorage();
    const newSession = { ...session, id: crypto.randomUUID() };
    sessions.push(newSession);
    saveSessionsToStorage(sessions);
    return newSession;
  },

  async updateSession(session: Session): Promise<Session | null> {
    const sessions = getSessionsFromStorage();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index > -1) {
      sessions[index] = session;
      saveSessionsToStorage(sessions);
      return session;
    }
    return null;
  },

  async deleteSession(id: string): Promise<boolean> {
    const sessions = getSessionsFromStorage();
    const index = sessions.findIndex(s => s.id === id);
    if (index > -1) {
      sessions[index].isDeleted = true;
      saveSessionsToStorage(sessions);
      return true;
    }
    return false;
  },

  async restoreSession(id: string): Promise<boolean> {
    const sessions = getSessionsFromStorage();
    const index = sessions.findIndex(s => s.id === id);
    if (index > -1) {
      sessions[index].isDeleted = false;
      saveSessionsToStorage(sessions);
      return true;
    }
    return false;
  }
};
