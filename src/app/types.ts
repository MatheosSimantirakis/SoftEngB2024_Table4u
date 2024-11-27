// Table Type
export type Table = {
  tableId: number;
  tableNumber: number;
  seats: number;
  available: boolean;
  restaurantId?: number; 
  isNew?: boolean;
  saved?: boolean;
};

// Reservation Type
export interface Reservation {
  seats: number;
  table: Table;
  time: number;
  id: number;
  confirmationCode: number;
}

// Restaurant Type
export interface Restaurant {
  name: string;
  address: string;
  numTables: number;
  tables: Table[];
}

// Manager Type
export interface Manager {
  name: string;
  restaurant: Restaurant;
}

// Consumer Type
export interface Consumer {
  email: string;
  reservation: Reservation;
}

// Admin Type
export interface Admin {
  name: string;
  username: string;
  password: string;
}

// Component-Specific Props
export interface TableEntryProps {
  table: Table;
  updateSeats: (table: Table, seats: number) => void;
  removeTable: (id: number) => void;
  saveTable: (table: Table) => Promise<void>;
}


export interface DateEntryProps {
  date: string;
  index: number;
  removeDate: (index: number) => void;
}

export interface FormWrapperProps {
  title: string;
  children: React.ReactNode;
}