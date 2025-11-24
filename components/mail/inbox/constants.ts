import { AlertCircle, Receipt, ShoppingBag, Plane, Tag, Users, FileEdit } from 'lucide-react-native';

export const iconMap: Record<string, any> = {
  'alert-circle': AlertCircle,
  'receipt': Receipt,
  'shopping-bag': ShoppingBag,
  'plane': Plane,
  'tag': Tag,
  'users': Users,
  'file-text': FileEdit,
  'briefcase': FileEdit,
  'scale': FileEdit,
};

export const avatarColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export const mockContacts = [
  { name: 'John Smith', email: 'john.smith@company.com', initial: 'J', color: '#FF6B6B' },
  { name: 'Sarah Johnson', email: 'sarah.j@example.com', initial: 'S', color: '#4ECDC4' },
  { name: 'Michael Brown', email: 'mbrown@work.com', initial: 'M', color: '#45B7D1' },
  { name: 'Emily Davis', email: 'emily.davis@email.com', initial: 'E', color: '#96CEB4' },
  { name: 'David Wilson', email: 'dwilson@company.com', initial: 'D', color: '#FFEAA7' },
  { name: 'Lisa Anderson', email: 'lisa.a@domain.com', initial: 'L', color: '#DFE6E9' },
  { name: 'James Taylor', email: 'jtaylor@work.com', initial: 'J', color: '#74B9FF' },
  { name: 'Jessica Martinez', email: 'jmartinez@example.com', initial: 'J', color: '#A29BFE' },
];

export const defaultSearchHistory = [
  'Important',
  'Receipts',
  'Newsletter',
  'Work',
];

