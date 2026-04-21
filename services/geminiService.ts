// AI Features removed as per user request.
import { Session } from '../types';

export const generateInvoiceNote = async (session: Session): Promise<string> => {
  return "Thank you for your business.";
};

export const generateSessionInsights = async (sessions: Session[]): Promise<string> => {
  return "Insights are disabled.";
};