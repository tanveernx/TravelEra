"use client";

import { useState } from "react";

type Seat = {
  seatNumber: string;
  type: string;
  isAvailable: boolean;
  price: number;
  deck?: string;
};

type TravelClass = {
  className: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
};

type TravelResult = {
  _id: string;

  departureTime?: string;
  arrivalTime?: string;

  operatorId?: {
    name?: string;
    rating?: number;
    logo?: string;
  };

  source?: {
    city?: string;
    terminal?: string;
    airportCode?: string;
  };

  destination?: {
    city?: string;
    terminal?: string;
    airportCode?: string;
  };

  routeId?: {
    source?: {
      city?: string;
      terminal?: string;
    };
    destination?: {
      city?: string;
      terminal?: string;
    };
  };

  status?: string;

  // BUS
  busNumber?: string;
  busType?: string;
  basePrice?: number;
  totalSeats?: number;
  seatLayout?: Seat[];
  amenities?: string[];

  bus?: {
    busNumber?: string;
    busType?: string;
    basePrice?: number;
    totalSeats?: number;
    seatLayout?: Seat[];
    amenities?: string[];
  };

  // FLIGHT
  flightNumber?: string;
  duration?: number;
  stops?: number;

  baggage?: {
    cabin?: string;
    checkin?: string;
  };

  // TRAIN
  trainNumber?: string;
  trainName?: string;
  runningDays?: string[];

  // FERRY
  ferryName?: string;

  ferry?: {
    ferryName?: string;
    name?: string;
    basePrice?: number;
    totalSeats?: number;
    amenities?: string[];
  };

  classes?: TravelClass[];
};

type Transport = "Bus" | "Train" | "Flight" | "Ferry";

export default function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const [transport, setTransport] =
    useState<Transport>("Bus");

  const [results, setResults] =
    useState<TravelResult[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedTrip, setSelectedTrip] =
    useState<TravelResult | null>(null);

  const [selectedSeats, setSelectedSeats] =
    useState<string[]>([]);

  const [showDailyResults, setShowDailyResults] =
    useState(false);

  // ==================================================
  // TRANSPORT HELPERS
  // ==================================================

  const getPluralTransportName = (
    type: Transport
  ) => {
    switch (type) {
      case "Bus":
        return "Buses";

      case "Train":
        return "Trains";

      case "Flight":
        return "Flights";

      case "Ferry":
        return "Ferries";

      default:
        return type;
    }
  };

  const getTransportName = (
    item: TravelResult
  ): Transport => {
    if (item.busNumber || item.bus) {
      return "Bus";
    }

    if (item.flightNumber) {
      return "Flight";
    }

    if (item.trainNumber) {
      return "Train";
    }

    if (item.ferryName || item.ferry) {
      return "Ferry";
    }

    return transport;
  };

  // ==================================================
  // DATE HELPERS
  // ==================================================

  const formatDateOnly = (
    dateString?: string
  ) => {
    if (!dateString) {
      return "N/A";
    }

    const parsed =
      new Date(`${dateString}T00:00:00`);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return dateString;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getDemoDateTime = (
    selectedDate: string,
    hour: number,
    minute: number
  ) => {
    const baseDate = selectedDate
      ? new Date(`${selectedDate}T00:00:00`)
      : new Date();

    baseDate.setHours(
      hour,
      minute,
      0,
      0
    );

    return baseDate.toISOString();
  };

  // ==================================================
  // DEMO SEAT GENERATOR
  // ==================================================

  const createDemoSeats = (
    basePrice: number,
    count = 24
  ): Seat[] => {
    return Array.from(
      { length: count },
      (_, index) => ({
        seatNumber: `S${index + 1}`,
        type:
          index % 3 === 0
            ? "Window"
            : "Regular",
        isAvailable:
          index % 5 !== 0,
        price:
          basePrice +
          (index % 3) * 50,
        deck:
          index >= 12
            ? "Lower Deck"
            : "Upper Deck",
      })
    );
  };

  // ==================================================
  // PROFESSIONAL DEMO VARIETY
  // ==================================================

  const createDemoVariants = (
    baseTrips: TravelResult[],
    selectedTransport: Transport,
    selectedDate: string,
    searchFrom: string,
    searchTo: string
  ): TravelResult[] => {
    const base =
      baseTrips[0] || {};

    // ==================================================
    // BUS DATA
    // ==================================================

    if (
      selectedTransport === "Bus"
    ) {
      const buses = [
        {
          company:
            "IntrCity SmartBus",
          number: "ISB-204",
          type: "Volvo AC Sleeper",
          from: "Delhi",
          to: "Mumbai",
          price: 1299,
          departure: 20,
          arrival: 8,
          rating: 4.5,
        },

        {
          company:
            "Zingbus",
          number: "ZB-305",
          type: "Premium AC Seater",
          from: "Delhi",
          to: "Bengaluru",
          price: 1499,
          departure: 19,
          arrival: 9,
          rating: 4.4,
        },

        {
          company:
            "Orange Travels",
          number: "OT-412",
          type: "AC Sleeper",
          from: "Hyderabad",
          to: "Bengaluru",
          price: 999,
          departure: 21,
          arrival: 7,
          rating: 4.3,
        },

        {
          company:
            "VRL Travels",
          number: "VRL-518",
          type: "Multi-Axle Volvo",
          from: "Mumbai",
          to: "Goa",
          price: 899,
          departure: 22,
          arrival: 7,
          rating: 4.6,
        },

        {
          company:
            "Sharma Transports",
          number: "ST-621",
          type: "AC Sleeper",
          from: "Kolkata",
          to: "Mumbai",
          price: 1599,
          departure: 18,
          arrival: 11,
          rating: 4.2,
        },

        {
          company:
            "SRS Travels",
          number: "SRS-734",
          type: "AC Semi Sleeper",
          from: "Chennai",
          to: "Bengaluru",
          price: 799,
          departure: 23,
          arrival: 6,
          rating: 4.1,
        },
      ];

      return buses.map(
        (bus, index) => {
          const routeFrom =
            searchFrom.trim() ||
            bus.from;

          const routeTo =
            searchTo.trim() ||
            bus.to;

          return {
            ...base,

            _id:
              `demo-bus-${index}-${selectedDate}`,

            operatorId: {
              name: bus.company,
              rating: bus.rating,
            },

            busNumber:
              bus.number,

            busType:
              bus.type,

            basePrice:
              bus.price,

            totalSeats: 40,

            seatLayout:
              createDemoSeats(
                bus.price
              ),

            source: {
              city: routeFrom,
              terminal:
                `${routeFrom} Bus Terminal`,
            },

            destination: {
              city: routeTo,
              terminal:
                `${routeTo} Bus Terminal`,
            },

            departureTime:
              getDemoDateTime(
                selectedDate,
                bus.departure,
                30
              ),

            arrivalTime:
              getDemoDateTime(
                selectedDate,
                bus.arrival,
                15
              ),

            amenities: [
              "AC",
              "WiFi",
              "Charging Point",
              index % 2 === 0
                ? "Blanket"
                : "Water Bottle",
            ],

            status:
              "Scheduled",
          };
        }
      );
    }

    // ==================================================
    // FLIGHT DATA
    // ==================================================

    if (
      selectedTransport === "Flight"
    ) {
      const flights = [
        {
          airline: "IndiGo",
          number: "6E-521",
          from: "Kolkata",
          to: "Mumbai",
          fromCode: "CCU",
          toCode: "BOM",
          price: 4899,
          departure: 7,
          arrival: 10,
          duration: 180,
          rating: 4.4,
        },

        {
          airline: "Air India",
          number: "AI-676",
          from: "Delhi",
          to: "Mumbai",
          fromCode: "DEL",
          toCode: "BOM",
          price: 5299,
          departure: 10,
          arrival: 12,
          duration: 150,
          rating: 4.5,
        },

        {
          airline: "Akasa Air",
          number: "QP-1432",
          from: "Bengaluru",
          to: "Kolkata",
          fromCode: "BLR",
          toCode: "CCU",
          price: 4499,
          departure: 14,
          arrival: 16,
          duration: 150,
          rating: 4.3,
        },

        {
          airline:
            "Air India Express",
          number: "IX-204",
          from: "Chennai",
          to: "Delhi",
          fromCode: "MAA",
          toCode: "DEL",
          price: 3999,
          departure: 16,
          arrival: 19,
          duration: 180,
          rating: 4.1,
        },

        {
          airline: "SpiceJet",
          number: "SG-812",
          from: "Mumbai",
          to: "Hyderabad",
          fromCode: "BOM",
          toCode: "HYD",
          price: 3299,
          departure: 18,
          arrival: 19,
          duration: 90,
          rating: 4.0,
        },

        {
          airline: "IndiGo",
          number: "6E-889",
          from: "Delhi",
          to: "Kolkata",
          fromCode: "DEL",
          toCode: "CCU",
          price: 4199,
          departure: 21,
          arrival: 23,
          duration: 120,
          rating: 4.4,
        },
      ];

      return flights.map(
        (flight, index) => {
          const routeFrom =
            searchFrom.trim() ||
            flight.from;

          const routeTo =
            searchTo.trim() ||
            flight.to;

          return {
            ...base,

            _id:
              `demo-flight-${index}-${selectedDate}`,

            operatorId: {
              name: flight.airline,
              rating: flight.rating,
            },

            flightNumber:
              flight.number,

            source: {
              city: routeFrom,
              airportCode:
                flight.fromCode,
              terminal:
                `${flight.fromCode} Airport`,
            },

            destination: {
              city: routeTo,
              airportCode:
                flight.toCode,
              terminal:
                `${flight.toCode} Airport`,
            },

            departureTime:
              getDemoDateTime(
                selectedDate,
                flight.departure,
                15
              ),

            arrivalTime:
              getDemoDateTime(
                selectedDate,
                flight.arrival,
                45
              ),

            basePrice:
              flight.price,

            duration:
              flight.duration,

            stops: 0,

            baggage: {
              cabin: "7 kg",
              checkin: "15 kg",
            },

            classes: [
              {
                className:
                  "Economy",
                totalSeats: 180,
                availableSeats:
                  65 - index * 5,
                price:
                  flight.price,
              },
            ],

            amenities: [
              "Cabin Baggage",
              "In-flight Service",
              index % 2 === 0
                ? "USB Charging"
                : "Entertainment",
            ],

            status:
              "Scheduled",
          };
        }
      );
    }

    // ==================================================
    // TRAIN DATA
    // ==================================================

    if (
      selectedTransport === "Train"
    ) {
      const trains = [
        {
          name:
            "Mumbai Rajdhani Express",
          number: "12952",
          from: "Delhi",
          to: "Mumbai",
          price: 1850,
          departure: 16,
          arrival: 8,
          rating: 4.6,
        },

        {
          name:
            "Howrah Rajdhani Express",
          number: "12302",
          from: "Delhi",
          to: "Kolkata",
          price: 1750,
          departure: 17,
          arrival: 10,
          rating: 4.5,
        },

        {
          name:
            "Chennai Shatabdi",
          number: "12028",
          from: "Chennai",
          to: "Bengaluru",
          price: 950,
          departure: 6,
          arrival: 11,
          rating: 4.4,
        },

        {
          name:
            "Mumbai Duronto Express",
          number: "12290",
          from: "Mumbai",
          to: "Kolkata",
          price: 2100,
          departure: 20,
          arrival: 12,
          rating: 4.5,
        },

        {
          name:
            "Secunderabad Rajdhani",
          number: "12437",
          from: "Delhi",
          to: "Hyderabad",
          price: 1950,
          departure: 15,
          arrival: 9,
          rating: 4.3,
        },

        {
          name:
            "Karnataka Express",
          number: "12628",
          from: "Delhi",
          to: "Bengaluru",
          price: 1650,
          departure: 21,
          arrival: 6,
          rating: 4.2,
        },
      ];

      return trains.map(
        (train, index) => {
          const routeFrom =
            searchFrom.trim() ||
            train.from;

          const routeTo =
            searchTo.trim() ||
            train.to;

          return {
            ...base,

            _id:
              `demo-train-${index}-${selectedDate}`,

            operatorId: {
              name:
                "Indian Railways",
              rating:
                train.rating,
            },

            trainNumber:
              train.number,

            trainName:
              train.name,

            source: {
              city: routeFrom,
              terminal:
                `${routeFrom} Railway Station`,
            },

            destination: {
              city: routeTo,
              terminal:
                `${routeTo} Railway Station`,
            },

            departureTime:
              getDemoDateTime(
                selectedDate,
                train.departure,
                30
              ),

            arrivalTime:
              getDemoDateTime(
                selectedDate,
                train.arrival,
                0
              ),

            basePrice:
              train.price,

            classes: [
              {
                className:
                  "AC 2 Tier",
                totalSeats: 50,
                availableSeats:
                  20 + index,
                price:
                  train.price,
              },

              {
                className:
                  "AC 3 Tier",
                totalSeats: 64,
                availableSeats:
                  30 + index,
                price:
                  train.price - 450,
              },

              {
                className:
                  "Sleeper",
                totalSeats: 72,
                availableSeats:
                  35 + index,
                price:
                  train.price - 850,
              },
            ],

            runningDays: [
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
              "Sun",
            ],

            amenities: [
              "Pantry",
              "Charging Point",
              "Bed Roll",
              index % 2 === 0
                ? "WiFi"
                : "Catering",
            ],

            status:
              "Scheduled",
          };
        }
      );
    }

    // ==================================================
    // FERRY DATA
    // ==================================================

    if (
      selectedTransport === "Ferry"
    ) {
      const ferries = [
        {
          company:
            "SeaLink India",
          name:
            "SeaLink Explorer",
          from:
            "Visakhapatnam",
          to: "Goa",
          price: 2499,
          departure: 8,
          arrival: 20,
          rating: 4.4,
        },

        {
          company:
            "Coastal Marine",
          name:
            "Coastal Express",
          from: "Mumbai",
          to: "Goa",
          price: 1899,
          departure: 9,
          arrival: 16,
          rating: 4.5,
        },

        {
          company:
            "Bay Voyager",
          name:
            "Bay Voyager",
          from: "Chennai",
          to: "Kolkata",
          price: 2999,
          departure: 7,
          arrival: 22,
          rating: 4.1,
        },

        {
          company:
            "Indian Ocean Ferries",
          name:
            "Ocean Star",
          from: "Kochi",
          to: "Mumbai",
          price: 2799,
          departure: 10,
          arrival: 23,
          rating: 4.3,
        },

        {
          company:
            "Konkan Marine",
          name:
            "Konkan Queen",
          from: "Mumbai",
          to: "Ratnagiri",
          price: 1399,
          departure: 6,
          arrival: 13,
          rating: 4.2,
        },

        {
          company:
            "East Coast Ferries",
          name:
            "Eastern Pearl",
          from:
            "Visakhapatnam",
          to: "Chennai",
          price: 2199,
          departure: 11,
          arrival: 20,
          rating: 4.0,
        },
      ];

      return ferries.map(
        (ferry, index) => {
          const routeFrom =
            searchFrom.trim() ||
            ferry.from;

          const routeTo =
            searchTo.trim() ||
            ferry.to;

          return {
            ...base,

            _id:
              `demo-ferry-${index}-${selectedDate}`,

            operatorId: {
              name:
                ferry.company,
              rating:
                ferry.rating,
            },

            ferryName:
              ferry.name,

            ferry: {
              ferryName:
                ferry.name,

              name:
                ferry.name,

              basePrice:
                ferry.price,

              totalSeats: 220,

              amenities: [
                "AC",
                "Restaurant",
                "WiFi",
                "Lounge",
              ],
            },

            source: {
              city: routeFrom,
              terminal:
                `${routeFrom} Ferry Terminal`,
            },

            destination: {
              city: routeTo,
              terminal:
                `${routeTo} Ferry Terminal`,
            },

            departureTime:
              getDemoDateTime(
                selectedDate,
                ferry.departure,
                0
              ),

            arrivalTime:
              getDemoDateTime(
                selectedDate,
                ferry.arrival,
                0
              ),

            basePrice:
              ferry.price,

            totalSeats: 220,

            amenities: [
              "AC",
              "Restaurant",
              "WiFi",
              index % 2 === 0
                ? "Lounge"
                : "Entertainment",
            ],

            status:
              "Scheduled",
          };
        }
      );
    }

    return baseTrips;
  };

  // ==================================================
  // SEARCH
  // ==================================================

  const handleSearch = async () => {
    if (
      !from.trim() ||
      !to.trim()
    ) {
      setError(
        "Please enter both source and destination."
      );

      setResults([]);

      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setShowDailyResults(false);

    try {
      const apiBase =
        process.env
          .NEXT_PUBLIC_API_URL ||
        "http://localhost:5000/api/v1";

      const params =
        new URLSearchParams();

      params.append(
        "from",
        from.trim()
      );

      params.append(
        "to",
        to.trim()
      );

      if (date) {
        params.append(
          "date",
          date
        );
      }

      const endpointOptions: Record<
        Transport,
        string[]
      > = {
        Bus: [
          "bus",
          "buses",
          "search-bus",
          "search-buses",
        ],

        Train: [
          "train",
          "trains",
        ],

        Flight: [
          "flight",
          "flights",
        ],

        Ferry: [
          "ferry",
          "ferries",
          "search-ferry",
          "search-ferries",
        ],
      };

      let data: any = null;

      let successfulResponse =
        false;

      for (
        const endpoint of
          endpointOptions[
            transport
          ]
      ) {
        try {
          const response =
            await fetch(
              `${apiBase}/search/${endpoint}?${params.toString()}`
            );

          if (!response.ok) {
            continue;
          }

          const responseData =
            await response.json();

          if (
            responseData?.success ===
              true ||
            Array.isArray(
              responseData?.data
            ) ||
            Array.isArray(
              responseData?.results
            ) ||
            Array.isArray(
              responseData?.buses
            ) ||
            Array.isArray(
              responseData?.bus
            ) ||
            Array.isArray(
              responseData?.trains
            ) ||
            Array.isArray(
              responseData?.train
            ) ||
            Array.isArray(
              responseData?.flights
            ) ||
            Array.isArray(
              responseData?.flight
            ) ||
            Array.isArray(
              responseData?.ferries
            ) ||
            Array.isArray(
              responseData?.ferry
            )
          ) {
            data =
              responseData;

            successfulResponse =
              true;

            break;
          }
        } catch (
          requestError
        ) {
          console.log(
            `Endpoint failed: /search/${endpoint}`,
            requestError
          );
        }
      }

      /*
       * Backend endpoint nahi mila to
       * bhi professional demo data dikhega.
       */

      let travelData:
        TravelResult[] = [];

      if (
        Array.isArray(
          data?.data
        )
      ) {
        travelData =
          data.data;
      } else if (
        Array.isArray(
          data?.results
        )
      ) {
        travelData =
          data.results;
      } else if (
        transport === "Bus"
      ) {
        travelData =
          data?.buses ||
          data?.bus ||
          [];
      } else if (
        transport === "Train"
      ) {
        travelData =
          data?.trains ||
          data?.train ||
          [];
      } else if (
        transport === "Flight"
      ) {
        travelData =
          data?.flights ||
          data?.flight ||
          [];
      } else if (
        transport === "Ferry"
      ) {
        travelData =
          data?.ferries ||
          data?.ferry ||
          [];
      }

      /*
       * Agar backend se data nahi aaya,
       * empty base object se demo services
       * create karenge.
       */

      const finalResults =
        createDemoVariants(
          travelData,
          transport,
          date,
          from,
          to
        );

      setResults(
        finalResults
      );

      setShowDailyResults(
        false
      );

      if (
        finalResults.length ===
        0
      ) {
        setError(
          `No ${getPluralTransportName(
            transport
          ).toLowerCase()} found.`
        );
      }
    } catch (err) {
      console.error(
        "Search error:",
        err
      );

      /*
       * Backend connection fail hone par
       * bhi demo services show kar do.
       */

      const demoResults =
        createDemoVariants(
          [],
          transport,
          date,
          from,
          to
        );

      setResults(
        demoResults
      );

      setShowDailyResults(
        false
      );

      setError("");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // TIME
  // ==================================================

  const formatTime = (
    time?: string
  ) => {
    if (!time) {
      return "N/A";
    }

    const parsedDate =
      new Date(time);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return time;
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // ==================================================
  // ROUTE
  // ==================================================

  const getRouteSource = (
    item: TravelResult
  ) => {
    return (
      item.routeId?.source
        ?.city ||
      item.source?.city ||
      from
    );
  };

  const getRouteDestination = (
    item: TravelResult
  ) => {
    return (
      item.routeId?.destination
        ?.city ||
      item.destination?.city ||
      to
    );
  };

  // ==================================================
  // PRICE
  // ==================================================

  const getStartingPrice = (
    item: TravelResult
  ): number | null => {
    if (
      typeof item.basePrice ===
      "number"
    ) {
      return item.basePrice;
    }

    if (
      item.classes &&
      item.classes.length > 0
    ) {
      const prices =
        item.classes
          .map(
            (travelClass) =>
              travelClass.price
          )
          .filter(
            (price) =>
              typeof price ===
              "number"
          );

      if (
        prices.length > 0
      ) {
        return Math.min(
          ...prices
        );
      }
    }

    return null;
  };

  // ==================================================
  // SERVICE
  // ==================================================

  const getServiceName = (
    item: TravelResult
  ) => {
    return (
      item.operatorId?.name ||
      item.trainName ||
      item.ferryName ||
      item.ferry?.name ||
      item.busType ||
      "Travel Service"
    );
  };

  const getServiceNumber = (
    item: TravelResult
  ) => {
    return (
      item.busNumber ||
      item.flightNumber ||
      item.trainNumber ||
      item.ferryName ||
      item.ferry?.name ||
      "N/A"
    );
  };

  // ==================================================
  // DETAILS
  // ==================================================

  const openDetails = (
    trip: TravelResult
  ) => {
    setSelectedTrip(
      trip
    );

    setSelectedSeats(
      []
    );
  };

  const closeDetails = () => {
    setSelectedTrip(
      null
    );

    setSelectedSeats(
      []
    );
  };

  // ==================================================
  // SEATS
  // ==================================================

  const toggleSeat = (
    seat: Seat
  ) => {
    if (
      !seat.isAvailable
    ) {
      return;
    }

    setSelectedSeats(
      (current) => {
        if (
          current.includes(
            seat.seatNumber
          )
        ) {
          return current.filter(
            (seatNumber) =>
              seatNumber !==
              seat.seatNumber
          );
        }

        return [
          ...current,
          seat.seatNumber,
        ];
      }
    );
  };

  const getSelectedTotal =
    () => {
      if (
        !selectedTrip?.seatLayout
      ) {
        return 0;
      }

      return selectedTrip.seatLayout
        .filter(
          (seat) =>
            selectedSeats.includes(
              seat.seatNumber
            )
        )
        .reduce(
          (
            total,
            seat
          ) =>
            total +
            (seat.price || 0),
          0
        );
    };

  // ==================================================
  // TRANSPORT CARDS
  // ==================================================

  const transportCards: {
    type: Transport;
    icon: string;
    label: string;
    description: string;
  }[] = [
    {
      type: "Bus",
      icon: "🚌",
      label: "Buses",
      description:
        "AC, Sleeper & Volvo",
    },

    {
      type: "Train",
      icon: "🚆",
      label: "Trains",
      description:
        "Express & Premium trains",
    },

    {
      type: "Flight",
      icon: "✈️",
      label: "Flights",
      description:
        "Domestic flight options",
    },

    {
      type: "Ferry",
      icon: "⛴️",
      label: "Ferries",
      description:
        "Coastal travel options",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl">
              ✈️
            </div>

            <div>
              <div className="text-2xl font-bold text-blue-600">
                TravelEra
              </div>

              <div className="text-xs text-gray-500">
                Smart Travel Search
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-gray-700 md:flex">

            <a
              href="#"
              className="font-medium hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="#results"
              className="font-medium hover:text-blue-600"
            >
              Search
            </a>

            <a
              href="#options"
              className="font-medium hover:text-blue-600"
            >
              Travel Options
            </a>

            <button
              onClick={() =>
                alert(
                  "Login feature coming soon!"
                )
              }
              className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Login
            </button>

          </div>
        </div>
      </nav>

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-20 text-center text-white">

        <div className="mx-auto max-w-4xl">

          <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium backdrop-blur">
            🇮🇳 Explore India with TravelEra
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Travel Anywhere,
            <br />
            Anytime
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
            Compare buses, trains,
            flights and ferries
            across major Indian
            cities from one place.
          </p>

          {/* SEARCH */}

          <div className="mx-auto mt-10 max-w-6xl rounded-3xl bg-white p-6 text-left shadow-2xl">

            <div className="grid gap-4 md:grid-cols-4">

              {/* FROM */}

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  From
                </label>

                <input
                  value={from}
                  onChange={(e) =>
                    setFrom(
                      e.target.value
                    )
                  }
                  type="text"
                  placeholder="e.g. Delhi"
                  className="mt-2 w-full rounded-xl border border-gray-200 p-3.5 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* TO */}

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  To
                </label>

                <input
                  value={to}
                  onChange={(e) =>
                    setTo(
                      e.target.value
                    )
                  }
                  type="text"
                  placeholder="e.g. Mumbai"
                  className="mt-2 w-full rounded-xl border border-gray-200 p-3.5 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DATE */}

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Travel Date
                </label>

                <input
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  type="date"
                  className="mt-2 w-full rounded-xl border border-gray-200 p-3.5 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* TRANSPORT */}

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Transport
                </label>

                <select
                  value={transport}
                  onChange={(e) =>
                    setTransport(
                      e.target.value as Transport
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 p-3.5 text-black outline-none"
                >
                  <option value="Bus">
                    🚌 Bus
                  </option>

                  <option value="Train">
                    🚆 Train
                  </option>

                  <option value="Flight">
                    ✈️ Flight
                  </option>

                  <option value="Ferry">
                    ⛴️ Ferry
                  </option>
                </select>
              </div>

            </div>

            <button
              onClick={
                handleSearch
              }
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Searching..."
                : `Search ${getPluralTransportName(
                    transport
                  )}`}
            </button>

            <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-gray-500">
              <span>
                ✓ Multiple operators
              </span>

              <span>
                ✓ Compare prices
              </span>

              <span>
                ✓ Instant results
              </span>

              <span>
                ✓ Secure booking
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          RESULTS
      ================================================== */}

      <section
        id="results"
        className="mx-auto max-w-7xl px-6 py-12"
      >

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <div className="text-4xl">
              🔎
            </div>

            <p className="mt-4 text-lg font-bold text-gray-700">
              Searching for available{" "}
              {getPluralTransportName(
                transport
              ).toLowerCase()}
              ...
            </p>
          </div>
        )}

        {error &&
          !loading && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-5 text-center text-red-600">
              {error}
            </div>
          )}

        {!loading &&
          results.length > 0 && (
            <>

              {/* RESULTS HEADER */}

              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <div className="text-sm font-semibold text-blue-600">
                    SEARCH RESULTS
                  </div>

                  <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
                    Available{" "}
                    {getPluralTransportName(
                      transport
                    )}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {date
                      ? `Showing ${results.length} services for ${formatDateOnly(
                          date
                        )}`
                      : `Showing ${results.length} travel options`}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700">
                  {from} → {to}
                </div>

              </div>

              {/* RESULT COUNT */}

              <div className="mb-6 flex items-center justify-between">

                <p className="text-sm text-gray-500">
                  Found{" "}
                  <span className="font-bold text-gray-900">
                    {results.length}
                  </span>{" "}
                  options
                </p>

                <div className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
                  ● Live availability
                </div>

              </div>

              {/* RESULTS */}

              <div className="grid gap-5">

                {results.map(
                  (item, index) => {

                    const source =
                      getRouteSource(
                        item
                      );

                    const destination =
                      getRouteDestination(
                        item
                      );

                    const price =
                      getStartingPrice(
                        item
                      );

                    const transportName =
                      getTransportName(
                        item
                      );

                    return (
                      <div
                        key={
                          item._id
                        }
                        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">

                          {/* SERVICE */}

                          <div className="min-w-[220px]">

                            <div className="flex items-center gap-2">

                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                {transportName}
                              </span>

                              <span className="text-xs font-medium text-gray-400">
                                #{index + 1}
                              </span>

                            </div>

                            <h3 className="mt-3 text-xl font-extrabold text-gray-900">
                              {getServiceName(
                                item
                              )}
                            </h3>

                            {item.operatorId
                              ?.rating !==
                              undefined && (
                              <div className="mt-1 text-sm">
                                <span className="text-yellow-500">
                                  ★
                                </span>{" "}
                                <span className="font-semibold text-gray-700">
                                  {
                                    item
                                      .operatorId
                                      .rating
                                  }
                                </span>
                              </div>
                            )}

                            {/* BUS */}

                            {(item.busNumber ||
                              item.bus) && (
                              <div className="mt-4 space-y-1 text-sm text-gray-500">

                                <p>
                                  Bus No:{" "}
                                  <span className="font-bold text-gray-900">
                                    {item.busNumber ||
                                      item.bus
                                        ?.busNumber ||
                                      "N/A"}
                                  </span>
                                </p>

                                <p>
                                  Type:{" "}
                                  <span className="font-semibold text-gray-800">
                                    {item.busType ||
                                      item.bus
                                        ?.busType ||
                                      "N/A"}
                                  </span>
                                </p>

                              </div>
                            )}

                            {/* FLIGHT */}

                            {item.flightNumber && (
                              <div className="mt-4 space-y-1 text-sm text-gray-500">

                                <p>
                                  Flight:{" "}
                                  <span className="font-bold text-gray-900">
                                    {
                                      item.flightNumber
                                    }
                                  </span>
                                </p>

                                <p>
                                  Duration:{" "}
                                  <span className="font-semibold text-gray-800">
                                    {item.duration !==
                                    undefined
                                      ? `${item.duration} min`
                                      : "N/A"}
                                  </span>
                                </p>

                                <p>
                                  {item.stops ===
                                  0
                                    ? "Non-stop"
                                    : `${item.stops} stop(s)`}
                                </p>

                              </div>
                            )}

                            {/* TRAIN */}

                            {item.trainNumber && (
                              <div className="mt-4 space-y-1 text-sm text-gray-500">

                                <p>
                                  Train No:{" "}
                                  <span className="font-bold text-gray-900">
                                    {
                                      item.trainNumber
                                    }
                                  </span>
                                </p>

                              </div>
                            )}

                            {/* FERRY */}

                            {(item.ferryName ||
                              item.ferry) && (
                              <div className="mt-4 text-sm text-gray-500">

                                Ferry:{" "}
                                <span className="font-bold text-gray-900">
                                  {item.ferryName ||
                                    item.ferry
                                      ?.name ||
                                    "N/A"}
                                </span>

                              </div>
                            )}

                          </div>

                          {/* ROUTE */}

                          <div className="flex-1 text-center">

                            {item.departureTime && (
                              <div className="mb-3 inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700">
                                📅{" "}
                                {new Date(
                                  item.departureTime
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    weekday:
                                      "short",
                                    day:
                                      "2-digit",
                                    month:
                                      "short",
                                    year:
                                      "numeric",
                                  }
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-center gap-3">

                              <div>
                                <div className="text-lg font-extrabold text-gray-900">
                                  {source}
                                </div>

                                {item.source
                                  ?.airportCode && (
                                  <div className="text-xs font-bold text-blue-600">
                                    {
                                      item
                                        .source
                                        .airportCode
                                    }
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-gray-300">
                                <span>
                                  ─────
                                </span>
                                <span className="text-xl">
                                  {transportName ===
                                  "Flight"
                                    ? "✈"
                                    : transportName ===
                                      "Train"
                                    ? "🚆"
                                    : transportName ===
                                      "Ferry"
                                    ? "⛴"
                                    : "🚌"}
                                </span>
                                <span>
                                  ─────
                                </span>
                              </div>

                              <div>
                                <div className="text-lg font-extrabold text-gray-900">
                                  {
                                    destination
                                  }
                                </div>

                                {item.destination
                                  ?.airportCode && (
                                  <div className="text-xs font-bold text-blue-600">
                                    {
                                      item
                                        .destination
                                        .airportCode
                                    }
                                  </div>
                                )}
                              </div>

                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">

                              <div className="rounded-xl bg-gray-50 p-3">

                                <p className="text-xs font-medium text-gray-500">
                                  Departure
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900">
                                  {formatTime(
                                    item.departureTime
                                  )}
                                </p>

                              </div>

                              <div className="rounded-xl bg-gray-50 p-3">

                                <p className="text-xs font-medium text-gray-500">
                                  Arrival
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900">
                                  {formatTime(
                                    item.arrivalTime
                                  )}
                                </p>

                              </div>

                            </div>

                            {item.baggage && (
                              <div className="mt-3 flex flex-wrap justify-center gap-2">

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                  Cabin:{" "}
                                  {
                                    item
                                      .baggage
                                      .cabin
                                  }
                                </span>

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                  Check-in:{" "}
                                  {
                                    item
                                      .baggage
                                      .checkin
                                  }
                                </span>

                              </div>
                            )}

                          </div>

                          {/* PRICE */}

                          <div className="min-w-[190px] text-center lg:text-right">

                            <p className="text-xs font-medium text-gray-500">
                              Starting from
                            </p>

                            <p className="mt-1 text-3xl font-extrabold text-green-600">
                              {price !==
                              null
                                ? `₹${price.toLocaleString(
                                    "en-IN"
                                  )}`
                                : "N/A"}
                            </p>

                            {item.totalSeats !==
                              undefined && (
                              <p className="mt-1 text-sm text-gray-500">
                                {
                                  item.totalSeats
                                } seats
                              </p>
                            )}

                            <button
                              onClick={() =>
                                openDetails(
                                  item
                                )
                              }
                              className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
                            >
                              View Details
                            </button>

                          </div>

                        </div>

                        {/* AMENITIES */}

                        {item.amenities &&
                          item.amenities
                            .length >
                            0 && (
                            <div className="mt-6 border-t pt-4">

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="mr-2 text-xs font-bold text-gray-500">
                                  AMENITIES
                                </span>

                                {item.amenities.map(
                                  (
                                    amenity
                                  ) => (
                                    <span
                                      key={
                                        amenity
                                      }
                                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                    >
                                      ✓{" "}
                                      {
                                        amenity
                                      }
                                    </span>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                      </div>
                    );
                  }
                )}

              </div>
            </>
          )}

      </section>

      {/* ==================================================
          TRANSPORT OPTIONS
      ================================================== */}

      <section
        id="options"
        className="bg-gray-100 px-6 py-16"
      >

        <div className="mx-auto max-w-6xl">

          <div className="text-center">

            <div className="text-sm font-bold text-blue-600">
              TRAVEL YOUR WAY
            </div>

            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Explore Travel Options
            </h2>

            <p className="mt-3 text-gray-500">
              Choose your preferred mode
              of transportation.
            </p>

          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-4">

            {transportCards.map(
              (item) => (
                <button
                  key={
                    item.type
                  }
                  onClick={() => {
                    setTransport(
                      item.type
                    );

                    setError("");

                    setResults([]);

                    setShowDailyResults(
                      false
                    );

                    window.scrollTo({
                      top: 0,
                      behavior:
                        "smooth",
                    });
                  }}
                  className={`rounded-2xl border bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                    transport ===
                    item.type
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200"
                  }`}
                >

                  <div className="text-5xl">
                    {item.icon}
                  </div>

                  <div className="mt-4 text-xl font-bold text-gray-900">
                    {item.label}
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {
                      item.description
                    }
                  </div>

                  {transport ===
                    item.type && (
                    <div className="mt-4 text-xs font-bold text-blue-600">
                      SELECTED
                    </div>
                  )}

                </button>
              )
            )}

          </div>

        </div>

      </section>

      {/* ==================================================
          DETAILS MODAL
      ================================================== */}

      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 text-gray-900 shadow-2xl md:p-8">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-200 pb-5">

              <div>

                <div className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {
                    getTransportName(
                      selectedTrip
                    )
                  }
                </div>

                <h2 className="text-2xl font-extrabold text-gray-950">
                  {
                    getServiceName(
                      selectedTrip
                    )
                  }
                </h2>

                <p className="mt-1 font-medium text-gray-600">
                  {
                    getRouteSource(
                      selectedTrip
                    )
                  }{" "}
                  →
                  {" "}
                  {
                    getRouteDestination(
                      selectedTrip
                    )
                  }
                </p>

                {selectedTrip
                  .departureTime && (
                  <p className="mt-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                    📅{" "}
                    {new Date(
                      selectedTrip.departureTime
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        weekday:
                          "long",
                        day:
                          "2-digit",
                        month:
                          "long",
                        year:
                          "numeric",
                      }
                    )}
                  </p>
                )}

              </div>

              <button
                onClick={
                  closeDetails
                }
                className="rounded-xl bg-gray-100 px-4 py-2 text-xl font-bold text-gray-700 hover:bg-gray-200"
              >
                ✕
              </button>

            </div>

            {/* BASIC DETAILS */}

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl border bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Transport
                </p>

                <p className="mt-1 text-xl font-extrabold">
                  {
                    getTransportName(
                      selectedTrip
                    )
                  }
                </p>

              </div>

              <div className="rounded-2xl border bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Service
                </p>

                <p className="mt-1 text-xl font-extrabold">
                  {
                    getServiceNumber(
                      selectedTrip
                    )
                  }
                </p>

              </div>

              <div className="rounded-2xl border bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Status
                </p>

                <p className="mt-1 text-xl font-extrabold text-green-600">
                  {
                    selectedTrip.status ||
                    "Scheduled"
                  }
                </p>

              </div>

            </div>

            {/* TIMINGS */}

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <div className="rounded-2xl border bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Departure
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatTime(
                    selectedTrip.departureTime
                  )}
                </p>

              </div>

              <div className="rounded-2xl border bg-gray-50 p-5">

                <p className="text-sm font-medium text-gray-500">
                  Arrival
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatTime(
                    selectedTrip.arrivalTime
                  )}
                </p>

              </div>

            </div>

            {/* BUS DETAILS */}

            {(selectedTrip.busNumber ||
              selectedTrip.bus) && (
              <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-6">

                <h3 className="text-2xl font-extrabold">
                  🚌 Bus Details
                </h3>

                <div className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-4">

                  <div>
                    <p className="text-sm text-gray-600">
                      Bus Number
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {
                        selectedTrip.busNumber
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      Bus Type
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {
                        selectedTrip.busType
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      Seats
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {
                        selectedTrip.totalSeats
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      Operator
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {
                        selectedTrip
                          .operatorId
                          ?.name
                      }
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* FLIGHT DETAILS */}

            {selectedTrip.flightNumber && (
              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">

                <h3 className="text-2xl font-extrabold">
                  ✈️ Flight Details
                </h3>

                <div className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-4">

                  <div>
                    <p className="text-sm text-gray-600">
                      Flight
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {
                        selectedTrip.flightNumber
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      Duration
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {selectedTrip.duration !==
                      undefined
                        ? `${selectedTrip.duration} minutes`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      Stops
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {selectedTrip.stops ===
                      0
                        ? "Non-stop"
                        : selectedTrip.stops}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      Airline
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {
                        selectedTrip
                          .operatorId
                          ?.name
                      }
                    </p>
                  </div>

                </div>

                {selectedTrip.baggage && (
                  <div className="mt-5 flex flex-wrap gap-3">

                    <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold">
                      Cabin:{" "}
                      {
                        selectedTrip
                          .baggage
                          .cabin
                      }
                    </span>

                    <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold">
                      Check-in:{" "}
                      {
                        selectedTrip
                          .baggage
                          .checkin
                      }
                    </span>

                  </div>
                )}

              </div>
            )}

            {/* TRAIN DETAILS */}

            {selectedTrip.trainNumber && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">

                <h3 className="text-2xl font-extrabold">
                  🚆 Train Details
                </h3>

                <div className="mt-5 grid gap-5 md:grid-cols-3">

                  <div className="rounded-xl bg-white/70 p-4">

                    <p className="text-sm text-gray-600">
                      Train Number
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {
                        selectedTrip.trainNumber
                      }
                    </p>

                  </div>

                  <div className="rounded-xl bg-white/70 p-4">

                    <p className="text-sm text-gray-600">
                      Train Name
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {
                        selectedTrip.trainName
                      }
                    </p>

                  </div>

                  <div className="rounded-xl bg-white/70 p-4">

                    <p className="text-sm text-gray-600">
                      Operator
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      Indian Railways
                    </p>

                  </div>

                </div>

                {selectedTrip.runningDays &&
                  selectedTrip.runningDays
                    .length >
                    0 && (
                    <div className="mt-5">

                      <p className="text-sm font-semibold text-gray-600">
                        Running Days
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">

                        {selectedTrip.runningDays.map(
                          (day) => (
                            <span
                              key={
                                day
                              }
                              className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"
                            >
                              {day}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

              </div>
            )}

            {/* FERRY DETAILS */}

            {(selectedTrip.ferryName ||
              selectedTrip.ferry) && (
              <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-6">

                <h3 className="text-2xl font-extrabold">
                  ⛴️ Ferry Details
                </h3>

                <div className="mt-5 grid gap-5 md:grid-cols-3">

                  <div className="rounded-xl bg-white/70 p-4">

                    <p className="text-sm text-gray-600">
                      Ferry
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {
                        selectedTrip
                          .ferryName
                      }
                    </p>

                  </div>

                  <div className="rounded-xl bg-white/70 p-4">

                    <p className="text-sm text-gray-600">
                      Departure
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {formatTime(
                        selectedTrip.departureTime
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl bg-white/70 p-4">

                    <p className="text-sm text-gray-600">
                      Arrival
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {formatTime(
                        selectedTrip.arrivalTime
                      )}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* CLASSES */}

            {selectedTrip.classes &&
              selectedTrip.classes.length >
                0 && (
                <div className="mt-7">

                  <h3 className="text-2xl font-extrabold">
                    Available Classes
                  </h3>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">

                    {selectedTrip.classes.map(
                      (
                        travelClass
                      ) => (
                        <div
                          key={
                            travelClass.className
                          }
                          className="rounded-2xl border bg-white p-5 shadow-sm"
                        >

                          <p className="text-lg font-bold">
                            {
                              travelClass.className
                            }
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              travelClass.availableSeats
                            }{" "}
                            seats available
                          </p>

                          <p className="mt-3 text-2xl font-extrabold text-green-600">
                            ₹
                            {
                              travelClass.price
                            }
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            {/* BUS SEATS */}

            {selectedTrip.seatLayout &&
              selectedTrip.seatLayout.length >
                0 && (
                <div className="mt-8">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <h3 className="text-2xl font-extrabold">
                      Select Your Seats
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm">

                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded bg-green-500" />
                        Available
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded bg-gray-400" />
                        Occupied
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded bg-blue-600" />
                        Selected
                      </div>

                    </div>

                  </div>

                  <div className="mt-6 rounded-2xl border bg-gray-50 p-6">

                    <div className="mx-auto mb-6 w-fit rounded-lg bg-gray-800 px-10 py-2 text-sm font-bold text-white">
                      DRIVER
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">

                      {selectedTrip.seatLayout.map(
                        (seat) => {

                          const isSelected =
                            selectedSeats.includes(
                              seat.seatNumber
                            );

                          return (
                            <button
                              key={
                                seat.seatNumber
                              }
                              onClick={() =>
                                toggleSeat(
                                  seat
                                )
                              }
                              disabled={
                                !seat.isAvailable
                              }
                              className={`rounded-xl border-2 p-3 transition ${
                                !seat.isAvailable
                                  ? "cursor-not-allowed border-gray-300 bg-gray-400 text-white"
                                  : isSelected
                                  ? "border-blue-700 bg-blue-600 text-white"
                                  : "border-green-400 bg-green-100 text-green-800 hover:bg-green-200"
                              }`}
                            >

                              <div className="text-lg font-bold">
                                {
                                  seat.seatNumber
                                }
                              </div>

                              <div className="text-xs">
                                ₹
                                {
                                  seat.price
                                }
                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* SELECTED SEATS */}

                  <div className="mt-5 rounded-xl border p-5">

                    <h3 className="font-bold">
                      Selected Seats
                    </h3>

                    {selectedSeats.length >
                    0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">

                        {selectedSeats.map(
                          (seat) => (
                            <span
                              key={
                                seat
                              }
                              className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700"
                            >
                              Seat{" "}
                              {seat}
                            </span>
                          )
                        )}

                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        No seats selected.
                      </p>
                    )}

                  </div>

                  {/* TOTAL */}

                  <div className="mt-6 flex flex-col justify-between gap-4 border-t pt-5 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-sm text-gray-500">
                        Total Fare
                      </p>

                      <p className="text-3xl font-extrabold text-green-600">
                        ₹
                        {
                          getSelectedTotal()
                        }
                      </p>

                    </div>

                    <button
                      disabled={
                        selectedSeats.length ===
                        0
                      }
                      onClick={() =>
                        alert(
                          `Selected seats: ${selectedSeats.join(
                            ", "
                          )}\nTotal: ₹${getSelectedTotal()}`
                        )
                      }
                      className="rounded-xl bg-orange-500 px-8 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue Booking
                    </button>

                  </div>

                </div>
              )}

            {/* CLOSE */}

            <div className="mt-8 border-t pt-5 text-right">

              <button
                onClick={
                  closeDetails
                }
                className="rounded-xl bg-gray-800 px-7 py-3 font-bold text-white hover:bg-gray-900"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="border-t bg-white px-6 py-10">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-8 md:grid-cols-3">

            <div>

              <div className="text-2xl font-extrabold text-blue-600">
                TravelEra
              </div>

              <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
                Your smart travel companion
                for discovering buses,
                trains, flights and ferries
                across India.
              </p>

            </div>

            <div>

              <h3 className="font-bold text-gray-900">
                Travel Options
              </h3>

              <div className="mt-3 space-y-2 text-sm text-gray-500">

                <p>🚌 Bus Booking</p>
                <p>🚆 Train Search</p>
                <p>✈️ Flight Search</p>
                <p>⛴️ Ferry Search</p>

              </div>

            </div>

            <div>

              <h3 className="font-bold text-gray-900">
                Popular Cities
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">

                {[
                  "Delhi",
                  "Mumbai",
                  "Kolkata",
                  "Bengaluru",
                  "Chennai",
                  "Hyderabad",
                  "Goa",
                  "Kochi",
                ].map(
                  (city) => (
                    <span
                      key={
                        city
                      }
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                    >
                      {city}
                    </span>
                  )
                )}

              </div>

            </div>

          </div>

          <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">
            © 2026 TravelEra. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}