
export class Consumer {
    email: string
    reservation: Reservation

    constructor(email: string, reservation : Reservation){
        this.email = email
        this.reservation = reservation
    }
}

export class Manager{
    name: string
    restaurant: Restaurant

    constructor(name: string, restaurant: Restaurant){
        this.name = name
        this.restaurant = restaurant
    }
}

export class Admin{
    name: string
    username: string 
    password: string 
    
    constructor(name : string, username: string, password: string){
        this.name = name
        this.username = username
        this.password = password
    }
}

export class Reservation{
    seats: number 
    table: Table
    time: number
    id: number
    confirmationCode: number

    constructor(seats: number, table: Table, time: number, id: number, confirmationCode: number){
        this.seats = seats
        this.table = table
        this.time = time
        this.id = id
        this.confirmationCode = confirmationCode
    }
    
}

export class Table{
    id: number
    num_seats: number 
    available: boolean

    constructor(id: number, num_seats: number, available: boolean){
        this.id = id
        this.num_seats = num_seats 
        this.available = available
    }
}


export class Restaurant {
    name : string 
    address : string
    numTables : number
    tables : Table

    constructor(name: string, address: string, numTables: number, tables: Table) {
      this.name = name;
      this.address = address;
      this.numTables = numTables;
      this.tables = tables;
    }
  }

  



