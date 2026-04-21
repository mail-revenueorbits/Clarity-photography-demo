
export enum PaymentType {
  FULL = 'Full',
  SPLIT = 'Split'
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PARTIAL = 'Partial',
  PAID = 'Paid'
}

export enum ClientSource {
  ADS = 'Ads',
  SOCIAL_MEDIA = 'Social Media',
  REFERRAL = 'Referral',
  WALK_IN = 'Walk-in',
  OTHER = 'Other'
}

export enum LeadSource {
  META = 'META',
  TIKTOK = 'Tiktok',
  GOOGLE = 'Google',
  WALK_IN = 'Walk-In',
  OTHER = 'Other'
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  note: string;
  isFollowUpRequired: boolean;
  followUpDate?: string; // YYYY-MM-DD
  createdAt: string;
  isDeleted?: boolean;
}

export interface PaymentDetails {
  type: PaymentType;
  totalAmount: number;
  depositAmount?: number;
  depositPaid: boolean;
  remainingPaid: boolean;
}

export interface Session {
  id: string;
  clientNumber: string; 
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  sessionType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isCustomSlot: boolean;
  isDeleted?: boolean;
  deliverables: string;
  deliverableDueDate: string; // YYYY-MM-DD
  isDelivered: boolean;
  babyBirthday?: string; // YYYY-MM-DD
  source: ClientSource;
  package: string;
  notes: string;
  payment: PaymentDetails;
  createdAt: number;
}

export const STANDARD_SLOTS = [
  { id: 1, start: '10:00', end: '12:00', label: 'Morning Session' },
  { id: 2, start: '13:00', end: '15:00', label: 'Afternoon Session' },
  { id: 3, start: '16:00', end: '18:00', label: 'Evening Session' }
];

export const SESSION_TYPE_OPTIONS = [
  'Maternity Photography',
  'Newborn Photography',
  'Cake Smash'
];

export const PACKAGE_PRESETS = [
  {
    name: 'Maternity Memorable',
    sessionType: 'Maternity Photography',
    price: 10000,
    deliverables: '30-40 min session\nSpouse & 1st baby included\nAccess to all props\nProfessional make-up & hair\nFree Gown (2 choices)\n6 concepts/posing\n12 edited high-quality pictures\nAll raw pictures provided\nPaper album x 1 (4x6)',
  },
  {
    name: 'Maternity Bronze',
    sessionType: 'Maternity Photography',
    price: 15500,
    deliverables: '1.5 hr session\nSpouse & 1st baby included\nAccess to all props\nProfessional make-up & hair\nFree Gown (3 choices)\n12 concepts/posing\n20 edited high-quality pictures\nAll raw pictures provided\nPhoto frame x 1 (12x18\")\nPaper album x 1 (4x6)',
  },
  {
    name: 'Newborn Basic',
    sessionType: 'Newborn Photography',
    price: 12000,
    deliverables: 'Session lasting for 1 hour 15 min (Tentative)\n6 retouched (edited) high quality images\n(4 baby portraits & 2 family portraits)\nAll the necessary newborn swaddles & props included\nSingle family portraits included (Dad, Mom & Baby)\nPhoto Frame x 1 sized (12x15)\n\nAdditional:\n• Rs.250 each for the extra edited pictures\n• Rs. 1700 each for extra portraits',
  },
  {
    name: 'Newborn Starter',
    sessionType: 'Newborn Photography',
    price: 14000,
    deliverables: '1.5 hr unrushed session\n10 edited high-quality pictures\nNecessary dresses, swaddles & props included\nAll raw pictures provided (100+)\nPhoto Frame x 1 (12x15\")\nShort TikTok reel x 1',
  },
  {
    name: 'Newborn Standard',
    sessionType: 'Newborn Photography',
    price: 22000,
    deliverables: '2.5 hr unrushed session\n16 edited high-quality pictures\nNecessary dresses, swaddles & props included\nAll raw pictures provided (200+)\nPhoto Frame x 1 (8x10\")\nKarizma Album x 1 (8x12\")\nShort TikTok reel x 1',
  },
  {
    name: 'Newborn Premium',
    sessionType: 'Newborn Photography',
    price: 30000,
    deliverables: '3.5 hr unrushed session\n20 edited high-quality pictures\nNecessary dresses, swaddles & props included\nAll raw pictures provided (200+)\nPhoto Frame x 1 (12x15\")\nKarizma Album x 1 (12x15\")\nShort TikTok reel x 1',
  },
  {
    name: 'Cake Smash Standard',
    sessionType: 'Cake Smash',
    price: 14000,
    deliverables: '1.5 hr unrushed session\n16 + 2 extra edited pictures\nCake included (Sugarless/Eggless)\nCake smash setup x 1\nAll raw pictures provided (100+)\nPaper Photo Album x 1 (4x6\")\nPhoto Frame x 1 (12x15\")',
  },
  {
    name: 'Cake Smash Premium',
    sessionType: 'Cake Smash',
    price: 23000,
    deliverables: '2 hr unrushed session\n21 + 2 extra edited pictures\nCake included (Sugarless/Eggless)\nCake smash setup x 1\nAll raw pictures provided (100+)\nKarizma Album x 1 (12x15\")\nPhoto Frame x 1 (12x15\")',
  },
];

export const FOLLOW_UP_TYPES = [
  'Maternity Photography',
  'Newborn Photography',
  'Cake Smash'
];
