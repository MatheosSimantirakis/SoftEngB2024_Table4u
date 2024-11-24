export class Restaurant {
    name:string
    address:string
    numTables:number
    activated:boolean


    constructor(name:string, address:string, numTables:number, activated:boolean = false) {
        this.name = name
        this.address = address
        this.numTables = numTables
        this.activated = activated
    }
}