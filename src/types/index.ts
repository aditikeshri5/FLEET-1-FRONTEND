export interface User {
  id: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'manufacturer' | 'transporter';
  company_name?: string;
  // 🚨 These are the "Auto-fill" fields
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}