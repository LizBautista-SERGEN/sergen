
export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_access: boolean;
  business_name: string | null;
  last_login?: string | null;
}

export interface UsersTableProps {
  users: User[];
  loading: boolean;
  refreshUsers: () => void;
}
