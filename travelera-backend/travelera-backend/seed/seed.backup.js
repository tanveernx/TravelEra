require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MONGO_URI } = require("../src/config/env");

const User = require("../src/models/User");
const Operator = require("../src/models/Operator");
const Route = require("../src/models/Route");
const Bus = require("../src/models/Bus");
const Car = require("../src/models/Car");
const Flight = require("../src/models/Flight");
const Train = require("../src/models/Train");
const Ferry = require("../src/models/Ferry");
const TempoTraveller = require("../src/models/TempoTraveller");
const Driver = require("../src/models/Driver");

function hoursFromNow(h) {
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("[Seed] Connected to MongoDB:", MONGO_URI);

  console.log("[Seed] Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Operator.deleteMany({}),
    Route.deleteMany({}),
    Bus.deleteMany({}),
    Car.deleteMany({}),
    Flight.deleteMany({}),
    Train.deleteMany({}),
    Ferry.deleteMany({}),
    TempoTraveller.deleteMany({}),
    Driver.deleteMany({})
  ]);

  // --- Users ---
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const userPassword = await bcrypt.hash("User@123", 12);

  const admin = await User.create({
    name: "Travel Era Admin",
    email: "admin@travelera.com",
    phone: "9999900000",
    password: adminPassword,
    role: "admin",
    isVerified: true
  });

  const demoUser = await User.create({
    name: "Ronak Kumar",
    email: "ronak@example.com",
    phone: "9999911111",
    password: userPassword,
    role: "user",
    isVerified: true
  });

  console.log("[Seed] Users created -> admin:", admin.email, "| user:", demoUser.email);

  // --- Operators (one per travel mode + a couple extra bus operators for multi-operator search) ---
  const [shreeTravels, vrlTravels, indigo, irctc, goaFerries, tempoOp, zoomCabs] = await Operator.insertMany([
    { name: "Shree Travels", type: "bus", contact: { email: "contact@shreetravels.com", phone: "9000000001" }, rating: 4.3, isVerified: true },
    { name: "VRL Travels", type: "bus", contact: { email: "contact@vrl.com", phone: "9000000002" }, rating: 4.1, isVerified: true },
    { name: "IndiGo", type: "flight", contact: { email: "contact@indigo.com", phone: "9000000003" }, rating: 4.5, isVerified: true },
    { name: "IRCTC", type: "train", contact: { email: "contact@irctc.com", phone: "9000000004" }, rating: 4.0, isVerified: true },
    { name: "Goa Ferries Co", type: "ferry", contact: { email: "contact@goaferries.com", phone: "9000000005" }, rating: 4.2, isVerified: true },
    { name: "Group Tour Vans", type: "tempo", contact: { email: "contact@grouptours.com", phone: "9000000006" }, rating: 4.4, isVerified: true },
    { name: "Zoom Self Drive", type: "car", contact: { email: "contact@zoomcabs.com", phone: "9000000007" }, rating: 4.0, isVerified: true }
  ]);

  console.log("[Seed] Operators created:", 7);

  // --- Routes ---
  const [delhiJaipurRoute, delhiMumbaiTrainRoute, mumbaiGoaFerryRoute] = await Route.insertMany([
    {
      operatorId: shreeTravels._id,
      source: { city: "Delhi", terminal: "Kashmiri Gate ISBT", lat: 28.6667, lng: 77.2167 },
      destination: { city: "Jaipur", terminal: "Sindhi Camp", lat: 26.9124, lng: 75.7873 },
      distanceKm: 280,
      estimatedDuration: 330,
      stops: [{ city: "Gurugram", arrivalOffsetMin: 45 }]
    },
    {
      operatorId: irctc._id,
      source: { city: "Delhi", terminal: "New Delhi Railway Station", lat: 28.6431, lng: 77.2197 },
      destination: { city: "Mumbai", terminal: "Mumbai Central", lat: 18.9696, lng: 72.8194 },
      distanceKm: 1384,
      estimatedDuration: 960,
      stops: [{ city: "Kota", arrivalOffsetMin: 300 }, { city: "Vadodara", arrivalOffsetMin: 720 }]
    },
    {
      operatorId: goaFerries._id,
      source: { city: "Mumbai", terminal: "Gateway of India", lat: 18.922, lng: 72.8347 },
      destination: { city: "Goa", terminal: "Panaji Jetty", lat: 15.4989, lng: 73.8278 },
      distanceKm: 460,
      estimatedDuration: 600,
      stops: []
    }
  ]);

  // Second bus operator on the SAME Delhi-Jaipur route (demonstrates multi-operator search)
  await Route.create({
    operatorId: vrlTravels._id,
    source: { city: "Delhi", terminal: "Anand Vihar ISBT", lat: 28.6469, lng: 77.3157 },
    destination: { city: "Jaipur", terminal: "Sindhi Camp", lat: 26.9124, lng: 75.7873 },
    distanceKm: 285,
    estimatedDuration: 345,
    stops: []
  }).then(async (vrlRoute) => {
    // --- Buses (2 operators, same route, different timing/price -> multi-operator search demo) ---
    await Bus.create({
      operatorId: shreeTravels._id,
      routeId: delhiJaipurRoute._id,
      busNumber: "RJ14-PA-1234",
      busType: "AC Sleeper",
      totalSeats: 30,
      seatLayout: Array.from({ length: 30 }, (_, i) => ({
        seatNumber: `S${i + 1}`,
        type: i < 15 ? "lower" : "upper",
        isAvailable: true,
        price: 800,
        deck: i < 15 ? "lower" : "upper"
      })),
      amenities: ["WiFi", "Charging Point", "Blanket"],
      departureTime: hoursFromNow(24),
      arrivalTime: hoursFromNow(29.5),
      basePrice: 800,
      status: "scheduled"
    });

    await Bus.create({
      operatorId: vrlTravels._id,
      routeId: vrlRoute._id,
      busNumber: "KA05-AB-5678",
      busType: "Non-AC Seater",
      totalSeats: 40,
      seatLayout: Array.from({ length: 40 }, (_, i) => ({
        seatNumber: `S${i + 1}`,
        type: "seater",
        isAvailable: true,
        price: 500,
        deck: "lower"
      })),
      amenities: ["Charging Point"],
      departureTime: hoursFromNow(24.5),
      arrivalTime: hoursFromNow(30.25),
      basePrice: 500,
      status: "scheduled"
    });
  });

  // --- Flights ---
  await Flight.create({
    operatorId: indigo._id,
    flightNumber: "6E-2031",
    source: { airportCode: "DEL", city: "Delhi" },
    destination: { airportCode: "BOM", city: "Mumbai" },
    departureTime: hoursFromNow(30),
    arrivalTime: hoursFromNow(32.2),
    duration: 130,
    stops: 0,
    classes: [
      { className: "Economy", totalSeats: 150, availableSeats: 150, price: 4500 },
      { className: "Business", totalSeats: 20, availableSeats: 20, price: 12000 }
    ],
    baggage: { cabin: "7kg", checkin: "15kg" },
    status: "scheduled"
  });

  // --- Trains ---
  await Train.create({
    operatorId: irctc._id,
    routeId: delhiMumbaiTrainRoute._id,
    trainNumber: "12951",
    trainName: "Mumbai Rajdhani Express",
    classes: [
      { className: "SL", totalSeats: 300, availableSeats: 300, price: 750 },
      { className: "3A", totalSeats: 150, availableSeats: 150, price: 1900 },
      { className: "2A", totalSeats: 80, availableSeats: 80, price: 2800 },
      { className: "1A", totalSeats: 24, availableSeats: 24, price: 4500 }
    ],
    runningDays: ["Mon", "Wed", "Fri", "Sun"],
    departureTime: hoursFromNow(20),
    arrivalTime: hoursFromNow(36),
    status: "scheduled"
  });

  // --- Ferries ---
  await Ferry.create({
    operatorId: goaFerries._id,
    routeId: mumbaiGoaFerryRoute._id,
    ferryName: "Konkan Sea Rider",
    classes: [
      { className: "Deck", totalSeats: 100, price: 600 },
      { className: "Cabin", totalSeats: 40, price: 1500 },
      { className: "Luxury", totalSeats: 10, price: 3000 }
    ],
    departureTime: hoursFromNow(15),
    arrivalTime: hoursFromNow(25),
    status: "scheduled"
  });

  // --- Cars (self-drive) ---
  await Car.insertMany([
    {
      operatorId: zoomCabs._id,
      model: "Maruti Swift",
      category: "Hatchback",
      transmission: "Manual",
      seatingCapacity: 5,
      fuelType: "Petrol",
      pricePerKm: 8,
      pricePerDay: 1800,
      currentLocation: { lat: 28.6139, lng: 77.209, city: "Delhi" },
      images: [],
      driverIncluded: false,
      isAvailable: true
    },
    {
      operatorId: zoomCabs._id,
      model: "Hyundai Creta",
      category: "SUV",
      transmission: "Automatic",
      seatingCapacity: 5,
      fuelType: "Diesel",
      pricePerKm: 14,
      pricePerDay: 3200,
      currentLocation: { lat: 28.6139, lng: 77.209, city: "Delhi" },
      images: [],
      driverIncluded: true,
      isAvailable: true
    }
  ]);

  // --- Tempo Travellers ---
  await TempoTraveller.create({
    operatorId: tempoOp._id,
    vehicleModel: "Force Tempo Traveller 12-Seater",
    seatingCapacity: 12,
    pricePerDay: 6000,
    pricePerKm: 18,
    driverIncluded: true,
    currentLocation: { lat: 28.6139, lng: 77.209, city: "Delhi" },
    amenities: ["AC", "Pushback Seats", "Music System"],
    isAvailable: true
  });

  // --- Drivers (Cab + Bike Taxi) ---
  await Driver.insertMany([
    {
      name: "Ramesh Kumar",
      phone: "9000011111",
      vehicleType: "cab",
      vehicleNumber: "DL01AB1111",
      licenseNumber: "DL-LIC-1111",
      currentLocation: { type: "Point", coordinates: [77.209, 28.6139] },
      isAvailable: true,
      rating: 4.6,
      isVerified: true
    },
    {
      name: "Suresh Yadav",
      phone: "9000022222",
      vehicleType: "bike",
      vehicleNumber: "DL02CD2222",
      licenseNumber: "DL-LIC-2222",
      currentLocation: { type: "Point", coordinates: [77.215, 28.62] },
      isAvailable: true,
      rating: 4.4,
      isVerified: true
    }
  ]);

  console.log("[Seed] Inventory seeded for all 8 travel modes.");
  console.log("[Seed] Done!");
  console.log("\nLogin credentials:");
  console.log("  Admin -> admin@travelera.com / Admin@123");
  console.log("  User  -> ronak@example.com / User@123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Error:", err);
  process.exit(1);
});
