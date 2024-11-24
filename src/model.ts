
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
    reservationId: number
    restaurantId : number
    email: string
    day: Date
    seats: number
    time: number
    confirmationNumber: string

    constructor(reservationId: number, restaurantId : number, email: string, day: Date, seats: number, time: number, confirmationNumber: string){
        this.reservationId = reservationId
        this.restaurantId = restaurantId
        this.email = email 
        this.day = day
        this.seats = seats
        this.time = time
        this.confirmationNumber = confirmationNumber
    }    
}

export class Table{
    tableId: number
    localId: number
    restaurantId: number 
    numSeats: number 

    constructor(tableId: number, localId: number, restuarantId: number, numSeats: number){
        this.tableId = tableId
        this.localId = localId
        this.restaurantId = restuarantId
        this.numSeats = numSeats 
        
    }
}

export class Restaurant {
    restaurantId : number
    name : string 
    address : string
    numTables : number
    

    constructor(restaurantId: number, name: string, address: string, numTables: number, tables: Table) {
        this.restaurantId = restaurantId
        this.name = name;
        this.address = address;
        this.numTables = numTables;
      
    }
  }

  



