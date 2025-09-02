export interface Notification {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  message?: string;
  data?: any; // jsonb in database
  read?: boolean;
  created_at?: string;
}
export interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}
export interface NotificationSlice {
  notifications: NotificationProps[];
  loading: boolean;
  error?: string;
}
