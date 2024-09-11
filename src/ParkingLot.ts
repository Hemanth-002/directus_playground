// Vehicle.ts
abstract class Vehicle {
    constructor(public regNo: string, public color: string) {}
    abstract getType(): string;
  }
  
  class Car extends Vehicle {
    getType(): string {
      return 'Car';
    }
  }
  
  class Bike extends Vehicle {
    getType(): string {
      return 'Bike';
    }
  }
  
  class Truck extends Vehicle {
    getType(): string {
      return 'Truck';
    }
  }
  
  // Slot.ts
  class Slot {
    constructor(public slotNo: number, public type: string, public isOccupied: boolean = false) {}
    park(): void {
      this.isOccupied = true;
    }
    unpark(): void {
      this.isOccupied = false;
    }
    isAvailable(): boolean {
      return !this.isOccupied;
    }
  }
  
  // Floor.ts
  class Floor {
    public slots: Slot[] = [];
    constructor(public floorNo: number, noOfSlots: number) {
      this.initializeSlots(noOfSlots);
    }
  
    private initializeSlots(noOfSlots: number): void {
      // Assume 1st slot is for Truck, next 2 for Bikes, rest for Cars
      for (let i = 1; i <= noOfSlots; i++) {
        let type: string;
        if (i === 1) type = 'Truck';
        else if (i <= 3) type = 'Bike';
        else type = 'Car';
        this.slots.push(new Slot(i, type));
      }
    }
  }
  
  // Ticket.ts
  class Ticket {
    constructor(public id: string, public vehicle: Vehicle, public floor: number, public slot: number) {}
  }
  
  // ParkingLot.ts
  class ParkingLot {
    public floors: Floor[] = [];
  
    constructor(public id: string, public noOfFloors: number, public noOfSlotsPerFloor: number) {
      this.initializeFloors();
    }
  
    private initializeFloors(): void {
      for (let i = 1; i <= this.noOfFloors; i++) {
        this.floors.push(new Floor(i, this.noOfSlotsPerFloor));
      }
    }
  
    findSlotForVehicle(vehicle: Vehicle): [number, number] | null {
      for (const floor of this.floors) {
        const slot = floor.slots.find((slot) => slot.type === vehicle.getType() && slot.isAvailable());
        if (slot) return [floor.floorNo, slot.slotNo];
      }
      return null;
    }
  
    parkVehicle(vehicle: Vehicle): Ticket | null {
      const slot = this.findSlotForVehicle(vehicle);
      if (slot) {
        const [floorNo, slotNo] = slot;
        this.floors[floorNo - 1].slots[slotNo - 1].park();
        return new Ticket(`${this.id}_${floorNo}_${slotNo}`, vehicle, floorNo, slotNo);
      }
      return null;
    }
  
    unparkVehicle(ticketId: string): boolean {
      const parts = ticketId.split('_');
      const floorNo = parseInt(parts[1]);
      const slotNo = parseInt(parts[2]);
  
      if (this.floors[floorNo - 1].slots[slotNo - 1].isOccupied) {
        this.floors[floorNo - 1].slots[slotNo - 1].unpark();
        return true;
      }
      return false;
    }
  
    displayFreeSlots(vehicleType: string): void {
      this.floors.forEach((floor) => {
        const freeSlots = floor.slots.filter((slot) => slot.type === vehicleType && slot.isAvailable());
        console.log(`Floor ${floor.floorNo}: ${freeSlots.length} free slots for ${vehicleType}`);
      });
    }
  
    displayOccupiedSlots(vehicleType: string): void {
      this.floors.forEach((floor) => {
        const occupiedSlots = floor.slots.filter((slot) => slot.type === vehicleType && !slot.isAvailable());
        console.log(`Floor ${floor.floorNo}: ${occupiedSlots.length} occupied slots for ${vehicleType}`);
      });
    }
  }
  
  // ParkingSystem.ts
  class ParkingSystem {
    private static instance: ParkingSystem;
    private parkingLot: ParkingLot;
  
    private constructor() {}
  
    static getInstance(): ParkingSystem {
      if (!ParkingSystem.instance) {
        ParkingSystem.instance = new ParkingSystem();
      }
      return ParkingSystem.instance;
    }
  
    createParkingLot(parkingLotId: string, noOfFloors: number, noOfSlotsPerFloor: number): void {
      this.parkingLot = new ParkingLot(parkingLotId, noOfFloors, noOfSlotsPerFloor);
      console.log(`Created parking lot with ID ${parkingLotId}`);
    }
  
    parkVehicle(vehicle: Vehicle): void {
      const ticket = this.parkingLot.parkVehicle(vehicle);
      if (ticket) {
        console.log(`Parked vehicle. Ticket ID: ${ticket.id}`);
      } else {
        console.log('No available slots for this vehicle type.');
      }
    }
  
    unparkVehicle(ticketId: string): void {
      const success = this.parkingLot.unparkVehicle(ticketId);
      console.log(success ? `Vehicle unparked from ticket ID: ${ticketId}` : 'Invalid ticket ID');
    }
  
    display(type: string, vehicleType: string): void {
      if (type === 'free_count') {
        this.parkingLot.displayFreeSlots(vehicleType);
      } else if (type === 'occupied_slots') {
        this
        this.parkingLot.displayOccupiedSlots(vehicleType);
    } else if (type === 'free_slots') {
      this.parkingLot.displayFreeSlots(vehicleType);
    } else {
      console.log('Invalid display type.');
    }
  }
}

// Main.ts (Entry point)
const parkingSystem = ParkingSystem.getInstance();

const commands: string[] = [
  'create_parking_lot PR1234 2 6',
  'park_vehicle Car KA-01-HH-1234 White',
  'park_vehicle Bike KA-01-HH-9999 Red',
  'park_vehicle Truck KA-01-BB-0001 Black',
  'display free_count Car',
  'display occupied_slots Bike',
  'unpark_vehicle PR1234_1_1',
  'exit',
];

commands.forEach((command) => {
  const parts = command.split(' ');
  const action = parts[0];

  switch (action) {
    case 'create_parking_lot':
      parkingSystem.createParkingLot(parts[1], parseInt(parts[2]), parseInt(parts[3]));
      break;
    case 'park_vehicle':
      const vehicleType = parts[1];
      const regNo = parts[2];
      const color = parts[3];
      let vehicle: Vehicle;
      if (vehicleType === 'Car') {
        vehicle = new Car(regNo, color);
      } else if (vehicleType === 'Bike') {
        vehicle = new Bike(regNo, color);
      } else if (vehicleType === 'Truck') {
        vehicle = new Truck(regNo, color);
      } else {
        console.log('Invalid vehicle type');
        break;
      }
      parkingSystem.parkVehicle(vehicle);
      break;
    case 'unpark_vehicle':
      parkingSystem.unparkVehicle(parts[1]);
      break;
    case 'display':
      parkingSystem.display(parts[1], parts[2]);
      break;
    case 'exit':
      console.log('Exiting...');
      break;
    default:
      console.log('Invalid command');
  }
});
  