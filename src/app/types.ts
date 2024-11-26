// Table Type
export interface Table {
    tableNumber: number;
    num_seats: number;
    available: boolean;
  }
  
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
    updateSeats: (id: number, num_seats: number) => void;
    removeTable: (id: number) => void;
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