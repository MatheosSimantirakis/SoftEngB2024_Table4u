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

export class Table {
    tableId: number;
    restaurantId: number;
    tableNumber: number;
    seats: number;
    available: boolean;
  
    constructor(tableId: number, restaurantId: number, tableNumber: number, seats: number, available: boolean = true) {
      this.tableId = tableId;
      this.restaurantId = restaurantId;
      this.tableNumber = tableNumber;
      this.seats = seats;
      this.available = available;
    }
  }


export class Restaurant {
    restaurantId : number
    name : string 
    address : string
    activated : boolean
    startTime : string
    endTime : string
    
    constructor(restaurantId: number, name: string, address: string, activated: boolean, startTime: string, endTime: string) {
        this.restaurantId = restaurantId
        this.name = name;
        this.address = address;
        this.activated = activated
        this.startTime = startTime
        this.endTime = endTime
    }
  }

  export class OpenDays{
    dayId: number
    restaurantId : number 
    openDate : Date

    constructor(dayId : number, restaurantId : number, openDate : Date){
        this.dayId = dayId
        this.restaurantId = restaurantId
        this.openDate = openDate

    }
  }

  



