import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const utc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day));
const rupees = (amount: number) => amount * 100;

type Day = { title: string; body: string; stay?: string; altitudeM?: number; distanceKm?: number };

type SeedTour = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  description: string;
  region: string;
  difficulty: "EASY" | "MODERATE" | "CHALLENGING" | "EXPERT";
  durationDays: number;
  groupSizeMax: number;
  minAge?: number;
  basePrice: number;
  artVariant: string;
  featured?: boolean;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: Day[];
  departures: { start: [number, number, number]; capacity: number; status?: "SCHEDULED" | "GUARANTEED"; seatsBooked?: number }[];
};

const STANDARD_INCLUSIONS = [
  "All accommodation as listed",
  "All meals on trip (breakfast, lunch, dinner)",
  "Private transport throughout",
  "Experienced local trip leader",
  "Permits, entry fees and forest charges",
  "First-aid kit, oximeter and supplementary oxygen where relevant",
];

const STANDARD_EXCLUSIONS = [
  "Flights and trains to the start point",
  "Travel insurance (mandatory)",
  "Personal trekking gear and clothing",
  "Anything of a personal nature",
  "Tips for the crew",
];

const TOURS: SeedTour[] = [
  {
    slug: "spiti-valley-winter-circuit",
    title: "Spiti Valley Winter Circuit",
    tagline: "Frozen waterfalls, 1,000-year-old monasteries, and the quietest road in India.",
    summary:
      "Eight days through the cold desert — Tabo, Kaza, Key and Kibber — in the season when the passes close and Spiti belongs to the people who live there.",
    description:
      "Winter is the honest version of Spiti. The Kunzum pass is shut, the tourists are gone, and the valley drops to -20°C at night. We go in slowly from Shimla along the old Hindustan-Tibet road, acclimatising as we climb, and stay with families we have worked with for years.\n\nThis is a comfortable trip in difficult conditions: heated homestays, hot food, a vehicle with winter tyres and a driver who has done this road a hundred times. What you need to bring is tolerance for cold and a bit of patience with altitude.\n\nDays are short and unhurried — a monastery in the morning, a frozen river walk after lunch, and the clearest night sky in the country once the sun goes down.",
    region: "Himachal",
    difficulty: "CHALLENGING",
    durationDays: 8,
    groupSizeMax: 10,
    minAge: 14,
    basePrice: rupees(32500),
    artVariant: "peaks",
    featured: true,
    highlights: [
      "Sleep at 4,200 m in Kibber, one of the highest villages in the world",
      "Butter tea with the monks at Key Gompa",
      "Walk a frozen stretch of the Pin river",
      "Cross the Chicham bridge, the highest in Asia",
      "Stargazing from the Komic plateau with zero light pollution",
      "A real chance of spotting blue sheep and, with luck, a snow leopard",
    ],
    inclusions: STANDARD_INCLUSIONS,
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Shimla to Narkanda", body: "Meet at Shimla in the morning and drive to Narkanda through apple country. Easy first day to let everyone settle in.", stay: "Guesthouse, Narkanda", altitudeM: 2708 },
      { title: "Narkanda to Kalpa", body: "Follow the Sutlej along the old Hindustan-Tibet road into Kinnaur. Afternoon walk through Kalpa's cedar forest under Kinner Kailash.", stay: "Homestay, Kalpa", altitudeM: 2960 },
      { title: "Kalpa to Tabo", body: "The long, spectacular drive into the cold desert. Vegetation thins out, the gorge narrows, and Spiti begins at Sumdo.", stay: "Homestay, Tabo", altitudeM: 3280, distanceKm: 190 },
      { title: "Tabo and Dhankar", body: "Morning at the 996 AD Tabo monastery and its mud-wall murals. Afternoon at Dhankar, built on a crumbling spur above the river confluence.", stay: "Homestay, Tabo", altitudeM: 3280 },
      { title: "Tabo to Kaza via Pin Valley", body: "Detour into the Pin valley for a walk on the frozen river, then on to Kaza for the night.", stay: "Guesthouse, Kaza", altitudeM: 3800 },
      { title: "Key, Kibber and Chicham", body: "Key Gompa in the morning, then up to Kibber for the night. Cross the Chicham bridge on the way — 150 m above the gorge floor.", stay: "Homestay, Kibber", altitudeM: 4205 },
      { title: "Komic, Hikkim and Langza", body: "The high triangle: the world's highest post office at Hikkim, fossils at Langza, and a long night under the stars at Komic.", stay: "Homestay, Langza", altitudeM: 4400 },
      { title: "Kaza to Shimla", body: "Early start for the long drive back down the valley. Trip ends in Shimla by evening.", altitudeM: 2276 },
    ],
    departures: [
      { start: [2026, 12, 20], capacity: 10, status: "GUARANTEED", seatsBooked: 6 },
      { start: [2027, 1, 17], capacity: 10, seatsBooked: 2 },
      { start: [2027, 2, 14], capacity: 10, status: "GUARANTEED", seatsBooked: 4 },
    ],
  },
  {
    slug: "chadar-frozen-zanskar",
    title: "Chadar: The Frozen Zanskar",
    tagline: "Six days walking up a frozen river, the way the Zanskaris always have.",
    summary:
      "The hardest and the most extraordinary thing we run. You walk on the ice sheet of the Zanskar river through a limestone gorge, sleeping in caves, at -25°C.",
    description:
      "For a few weeks each winter the Zanskar river freezes hard enough to walk on, and the gorge becomes the only route out of Zanskar. Locals have used it for centuries. The ice is never the same twice: some days it is glass, some days it is slush and you walk the bank.\n\nThis is a genuine expedition. You carry a daypack, the porters carry the rest, and we camp in riverside caves and on sand bars. Nights are brutally cold. Days are short, flat and mesmerising — vertical walls, frozen waterfalls, and the sound of the ice moving under you.\n\nWe require previous high-altitude trekking experience and a doctor's clearance. Acclimatisation in Leh is not optional, which is why the itinerary front-loads three days there.",
    region: "Ladakh",
    difficulty: "EXPERT",
    durationDays: 9,
    groupSizeMax: 8,
    minAge: 18,
    basePrice: rupees(38000),
    artVariant: "valley",
    featured: true,
    highlights: [
      "Walk 60+ km on the frozen Zanskar river",
      "Camp in riverside caves used by Zanskari traders for generations",
      "The frozen Nerak waterfall, 20 m of solid ice",
      "Three acclimatisation days in Leh with monastery visits",
      "Tiny group — maximum eight walkers",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Porters for main luggage", "Four-season tents and sleeping bags rated to -30°C", "Gumboots and crampons on loan"],
    exclusions: [...STANDARD_EXCLUSIONS, "Mandatory medical clearance certificate"],
    itinerary: [
      { title: "Arrive Leh", body: "Fly in to Leh and do nothing at all. Rest is the work today.", stay: "Hotel, Leh", altitudeM: 3500 },
      { title: "Leh acclimatisation", body: "Gentle walk around the old town, Leh palace and Shanti Stupa. Gear check in the evening.", stay: "Hotel, Leh", altitudeM: 3500 },
      { title: "Monasteries and medicals", body: "Drive out to Thiksey and Hemis, then the compulsory medical check with the local administration.", stay: "Hotel, Leh", altitudeM: 3500 },
      { title: "Leh to Shingra Koma", body: "Drive to Chilling and start walking on the ice. Short first day to find your feet.", stay: "Camp, Shingra Koma", altitudeM: 3100, distanceKm: 9 },
      { title: "Shingra Koma to Tibb Cave", body: "Deep into the gorge. Walls close in to a few metres in places and the light goes blue.", stay: "Cave camp, Tibb", altitudeM: 3200, distanceKm: 14 },
      { title: "Tibb to Nerak", body: "The big day, ending below the frozen Nerak waterfall. Coldest night of the trip.", stay: "Camp, Nerak", altitudeM: 3390, distanceKm: 13 },
      { title: "Nerak back to Tibb", body: "Turn around and retrace the gorge. Same river, completely different ice.", stay: "Cave camp, Tibb", altitudeM: 3200, distanceKm: 13 },
      { title: "Tibb to Chilling and Leh", body: "Final stretch on the ice, then the drive back to a hot shower in Leh.", stay: "Hotel, Leh", altitudeM: 3500 },
      { title: "Depart Leh", body: "Morning transfer to the airport.", altitudeM: 3500 },
    ],
    departures: [
      { start: [2027, 1, 24], capacity: 8, status: "GUARANTEED", seatsBooked: 5 },
      { start: [2027, 2, 7], capacity: 8, seatsBooked: 1 },
      { start: [2027, 2, 21], capacity: 8, seatsBooked: 0 },
    ],
  },
  {
    slug: "kedarkantha-summit-trek",
    title: "Kedarkantha Summit Trek",
    tagline: "A first Himalayan summit that genuinely feels like one.",
    summary:
      "Six days from Sankri through pine and snow to a 3,800 m summit with a 360° view of the Gangotri and Swargarohini ranges. The best beginner winter trek in India.",
    description:
      "Kedarkantha earns its reputation. The walking is forgiving, the campsites are beautiful, and the summit morning — a steep hour in the dark, then sunrise over a wall of 6,000 m peaks — is a proper mountain experience.\n\nWe run it with a maximum of 14 walkers, two guides, and campsites away from the busiest meadows. In December and January there is deep snow from Juda ka Talab upwards, and we carry microspikes for everyone.\n\nIf you have never slept in a tent or walked at altitude, this is the trip to start with.",
    region: "Uttarakhand",
    difficulty: "MODERATE",
    durationDays: 6,
    groupSizeMax: 14,
    minAge: 10,
    basePrice: rupees(12900),
    artVariant: "forest",
    highlights: [
      "Summit morning at 3,800 m, usually in snow",
      "Camp beside the frozen Juda ka Talab lake",
      "Views of Swargarohini, Bandarpunch and Black Peak from the top",
      "Short daily distances — good for a first trek",
      "Microspikes and gaiters provided in winter",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Tents, sleeping bags and mats", "Microspikes and gaiters in winter months"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Dehradun to Sankri", body: "Long but lovely drive along the Tons river into the Govind Pashu Vihar park.", stay: "Guesthouse, Sankri", altitudeM: 1950, distanceKm: 200 },
      { title: "Sankri to Juda ka Talab", body: "Climb through oak and pine to the frozen lake. Four hours, steady gradient.", stay: "Camp, Juda ka Talab", altitudeM: 2700, distanceKm: 4 },
      { title: "Juda ka Talab to Kedarkantha base", body: "Short day up to the base meadow. Afternoon free to walk the ridge behind camp.", stay: "Camp, Kedarkantha base", altitudeM: 3400, distanceKm: 4 },
      { title: "Summit day", body: "Pre-dawn start for the summit, sunrise at the top, then all the way down to Hargaon.", stay: "Camp, Hargaon", altitudeM: 3810, distanceKm: 10 },
      { title: "Hargaon to Sankri", body: "Easy descent through forest back to the village. Hot shower and a bonfire.", stay: "Guesthouse, Sankri", altitudeM: 1950, distanceKm: 6 },
      { title: "Sankri to Dehradun", body: "Drive back down. Trip ends at Dehradun railway station by evening.", altitudeM: 640 },
    ],
    departures: [
      { start: [2026, 12, 13], capacity: 14, status: "GUARANTEED", seatsBooked: 11 },
      { start: [2026, 12, 27], capacity: 14, status: "GUARANTEED", seatsBooked: 8 },
      { start: [2027, 1, 10], capacity: 14, seatsBooked: 3 },
      { start: [2027, 1, 31], capacity: 14, seatsBooked: 0 },
    ],
  },
  {
    slug: "hampta-pass-chandratal",
    title: "Hampta Pass & Chandratal",
    tagline: "Walk from green Kullu to the moonscape of Lahaul in four days.",
    summary:
      "A crossover trek with the most dramatic change of scenery in the Himalaya — pine forest and waterfalls on one side of the pass, bare rock and glacier on the other.",
    description:
      "Hampta is a short trek that feels much bigger than it is. You start in the Kullu valley among birch and wildflowers, climb a narrow gorge, cross the 4,270 m pass, and drop into Lahaul where nothing grows and everything is rock.\n\nWe finish with a drive to Chandratal — the crescent moon lake at 4,300 m — and a night under what is, on a clear evening, the best sky in Himachal.\n\nGood second trek. Not technical, but the pass day is long and the descent on the Lahaul side is steep.",
    region: "Himachal",
    difficulty: "MODERATE",
    durationDays: 5,
    groupSizeMax: 12,
    minAge: 12,
    basePrice: rupees(11500),
    artVariant: "valley",
    highlights: [
      "Cross the 4,270 m Hampta pass",
      "Two completely different landscapes in a single day",
      "Camp at Chandratal, the crescent moon lake",
      "Balu ka Ghera meadow under the Deo Tibba face",
      "Hot springs stop at Vashisht on the final day",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Tents, sleeping bags and mats"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Manali to Jobra and Chika", body: "Short drive up the 42 hairpins to Jobra, then an easy walk along the Rani nallah to Chika.", stay: "Camp, Chika", altitudeM: 3100, distanceKm: 2 },
      { title: "Chika to Balu ka Ghera", body: "Follow the river through boulder fields and water crossings into a wide meadow below the pass.", stay: "Camp, Balu ka Ghera", altitudeM: 3600, distanceKm: 8 },
      { title: "Over Hampta Pass to Shea Goru", body: "The big day. Steep climb to the pass, lunch at the top if the weather holds, then a sharp descent into Lahaul.", stay: "Camp, Shea Goru", altitudeM: 4270, distanceKm: 13 },
      { title: "Shea Goru to Chatru, drive to Chandratal", body: "Walk out to the road head at Chatru, then drive to Chandratal for the night.", stay: "Camp, Chandratal", altitudeM: 4300 },
      { title: "Chandratal to Manali", body: "Sunrise at the lake, then the drive back over Rohtang. Stop at the Vashisht hot springs before the trip ends.", altitudeM: 2050 },
    ],
    departures: [
      { start: [2027, 6, 13], capacity: 12, seatsBooked: 2 },
      { start: [2027, 6, 27], capacity: 12, seatsBooked: 0 },
    ],
  },
  {
    slug: "leh-to-hanle-dark-sky",
    title: "Leh to Hanle: Dark Sky Road Trip",
    tagline: "Nine days across Ladakh to India's first dark sky reserve.",
    summary:
      "A high-altitude road trip through Nubra, Pangong and Changthang to Hanle — where the Indian Astronomical Observatory sits at 4,500 m under the darkest sky in the country.",
    description:
      "This is the road trip people imagine when they think of Ladakh, with one addition: we finish in Hanle, deep in Changthang, inside India's first dark sky reserve. No street lights, no towns, no haze. On a moonless night you can read by the Milky Way.\n\nWe go slowly and in the right order — Leh first, then Nubra, then Pangong, then Hanle — so acclimatisation is built into the route rather than left to luck. Vehicles are Innovas or Xylos with experienced Ladakhi drivers, and we stay in homestays wherever there is a family willing to host us.\n\nInner Line Permits for Hanle and Nubra are included and we handle the paperwork.",
    region: "Ladakh",
    difficulty: "MODERATE",
    durationDays: 9,
    groupSizeMax: 12,
    minAge: 12,
    basePrice: rupees(44000),
    artVariant: "canyon",
    featured: true,
    highlights: [
      "Two nights in the Hanle dark sky reserve with a telescope and an astronomy guide",
      "Khardung La and the Nubra dunes at Hunder",
      "Sunrise over Pangong Tso from the quiet eastern shore",
      "Diskit monastery and the 32 m Maitreya Buddha",
      "Homestays in Changthang with Changpa herder families",
      "All Inner Line Permits handled for you",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Inner Line Permits for Nubra, Pangong and Hanle", "Astronomy session with telescope at Hanle"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Arrive Leh", body: "Airport transfer and a full rest day. Short evening walk to the market if you are feeling fine.", stay: "Hotel, Leh", altitudeM: 3500 },
      { title: "Leh acclimatisation", body: "Sham valley loop — Magnetic Hill, the Indus-Zanskar confluence and Alchi monastery. Low and easy by design.", stay: "Hotel, Leh", altitudeM: 3500 },
      { title: "Leh to Nubra over Khardung La", body: "Over the 5,359 m pass and down into the Nubra valley. Afternoon at the Hunder dunes.", stay: "Camp, Hunder", altitudeM: 3050 },
      { title: "Nubra: Diskit and Turtuk", body: "Diskit monastery in the morning, then out to Turtuk, one of the few Balti villages on the Indian side.", stay: "Homestay, Turtuk", altitudeM: 2980 },
      { title: "Nubra to Pangong via Shyok", body: "The rough, beautiful Shyok river road straight to Pangong, avoiding the backtrack to Leh.", stay: "Camp, Spangmik", altitudeM: 4250 },
      { title: "Pangong to Hanle", body: "Along the lake to Chushul, then south into Changthang. Wild, empty, and full of kiang.", stay: "Homestay, Hanle", altitudeM: 4500 },
      { title: "Hanle", body: "Visit the observatory, walk to Hanle monastery, sleep in the afternoon. Night is for the sky.", stay: "Homestay, Hanle", altitudeM: 4500 },
      { title: "Hanle to Tso Moriri", body: "Across the Changthang plateau to Tso Moriri and the Korzok village.", stay: "Homestay, Korzok", altitudeM: 4530 },
      { title: "Tso Moriri to Leh", body: "Long drive back via Tso Kar and the Taglang La. Trip ends in Leh.", altitudeM: 3500 },
    ],
    departures: [
      { start: [2027, 5, 16], capacity: 12, seatsBooked: 4 },
      { start: [2027, 6, 20], capacity: 12, status: "GUARANTEED", seatsBooked: 7 },
      { start: [2027, 9, 5], capacity: 12, seatsBooked: 1 },
    ],
  },
  {
    slug: "valley-of-flowers-hemkund",
    title: "Valley of Flowers & Hemkund Sahib",
    tagline: "Three hundred species of wildflower in one hanging valley.",
    summary:
      "Six days in the Bhyundar valley during the monsoon bloom, with a side climb to the glacial lake and gurudwara at Hemkund Sahib at 4,330 m.",
    description:
      "The Valley of Flowers is a UNESCO site and a genuinely strange place — a high hanging valley that spends ten months under snow and then explodes into bloom for eight weeks. Blue poppies, cobra lilies, potentilla, and a river running through the middle of it.\n\nWe base in Ghangaria for three nights so you can walk into the valley twice, in different weather, and still have a day for Hemkund. Monsoon means rain; we plan around it rather than pretending it won't happen.\n\nNo camping on this one — tea-house and guesthouse accommodation throughout.",
    region: "Uttarakhand",
    difficulty: "MODERATE",
    durationDays: 6,
    groupSizeMax: 14,
    minAge: 10,
    basePrice: rupees(15400),
    artVariant: "forest",
    highlights: [
      "Two full days inside the Valley of Flowers national park",
      "Hemkund Sahib at 4,330 m — the highest gurudwara in the world",
      "Peak bloom timed departures in July and August",
      "Guesthouse beds every night, no camping",
      "Botanist-led walk on one of the valley days",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "National park permits for two valley entries"],
    exclusions: [...STANDARD_EXCLUSIONS, "Pony or porter hire on the Ghangaria climb"],
    itinerary: [
      { title: "Haridwar to Joshimath", body: "Drive up the Alaknanda through Devprayag and Rudraprayag. Long day in the car.", stay: "Hotel, Joshimath", altitudeM: 1890 },
      { title: "Joshimath to Ghangaria", body: "Short drive to Govindghat, then the 9 km walk up to Ghangaria.", stay: "Guesthouse, Ghangaria", altitudeM: 3050, distanceKm: 9 },
      { title: "Valley of Flowers", body: "Full day in the valley with a botanist. Walk as far as the Pushpawati river crossing.", stay: "Guesthouse, Ghangaria", altitudeM: 3600, distanceKm: 10 },
      { title: "Hemkund Sahib", body: "Steep 6 km climb to the lake and the gurudwara. Langar lunch, then back down.", stay: "Guesthouse, Ghangaria", altitudeM: 4330, distanceKm: 12 },
      { title: "Ghangaria to Joshimath", body: "Second short walk into the valley mouth if the weather is good, then down to Govindghat and Joshimath.", stay: "Hotel, Joshimath", altitudeM: 1890 },
      { title: "Joshimath to Haridwar", body: "The drive back down. Trip ends at Haridwar station.", altitudeM: 314 },
    ],
    departures: [
      { start: [2027, 7, 18], capacity: 14, seatsBooked: 3 },
      { start: [2027, 8, 8], capacity: 14, status: "GUARANTEED", seatsBooked: 9 },
    ],
  },
  {
    slug: "meghalaya-living-root-bridges",
    title: "Meghalaya: Living Root Bridges",
    tagline: "The wettest place on earth, and the bridges it grew.",
    summary:
      "Seven days in the Khasi and Jaintia hills — root bridges the Khasi have trained for generations, limestone caves, and the double-decker at Nongriat.",
    description:
      "Meghalaya is the easiest trip we run and one of the most surprising. The Khasi have been training ficus roots across rivers for hundreds of years, and the bridges are alive and still growing. Getting to the best of them means a 3,500-step descent into the Nongriat gorge, which you will feel the next morning.\n\nWe stay in village homestays, eat what the family eats, and swim in the blue pools below Rainbow Falls. We also go caving at Mawmluh and visit Mawlynnong, which claims to be the cleanest village in Asia and has reasonable grounds for it.\n\nNo altitude, no technical walking. Just humidity, stairs and good food.",
    region: "North East",
    difficulty: "EASY",
    durationDays: 7,
    groupSizeMax: 12,
    basePrice: rupees(26800),
    artVariant: "forest",
    highlights: [
      "The double-decker living root bridge at Nongriat",
      "Swim in the blue pools under Rainbow Falls",
      "Caving in the Mawmluh limestone system",
      "Village homestays in Nongriat and Mawlynnong",
      "Dawki's glass-clear Umngot river",
      "Nohkalikai, India's tallest plunge waterfall",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Caving equipment and local cave guide"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Arrive Guwahati, drive to Shillong", body: "Pick-up at Guwahati airport and the drive up to Shillong via Umiam lake.", stay: "Hotel, Shillong", altitudeM: 1496 },
      { title: "Shillong to Cherrapunji", body: "Mawkdok viewpoint, Nohkalikai falls, and an afternoon in the Mawmluh cave.", stay: "Homestay, Cherrapunji", altitudeM: 1430 },
      { title: "Down to Nongriat", body: "The famous 3,500 steps down into the gorge. Afternoon at the double-decker bridge.", stay: "Homestay, Nongriat", altitudeM: 600 },
      { title: "Rainbow Falls", body: "Walk upstream to Rainbow Falls and swim in the pools. Back to Nongriat for a second night.", stay: "Homestay, Nongriat", altitudeM: 600, distanceKm: 8 },
      { title: "Nongriat to Mawlynnong", body: "Climb back out of the gorge and drive to Mawlynnong. Visit the Riwai root bridge.", stay: "Homestay, Mawlynnong", altitudeM: 1100 },
      { title: "Dawki and Shnongpdeng", body: "Boat on the Umngot river, then an afternoon of cliff jumping and kayaking at Shnongpdeng.", stay: "Riverside camp, Shnongpdeng", altitudeM: 200 },
      { title: "Back to Guwahati", body: "Drive back via Shillong. Airport drops in the evening.", altitudeM: 55 },
    ],
    departures: [
      { start: [2026, 11, 15], capacity: 12, status: "GUARANTEED", seatsBooked: 8 },
      { start: [2027, 2, 21], capacity: 12, seatsBooked: 2 },
      { start: [2027, 3, 14], capacity: 12, seatsBooked: 0 },
    ],
  },
  {
    slug: "sandakphu-ridge-walk",
    title: "Sandakphu Ridge Walk",
    tagline: "Four of the world's five highest mountains from a single ridge.",
    summary:
      "Seven days on the Singalila ridge along the Nepal border, with Everest, Kanchenjunga, Lhotse and Makalu on the skyline and rhododendron forest underfoot.",
    description:
      "Sandakphu is the highest point in West Bengal and the only place in India where you can see Everest and Kanchenjunga in the same frame. The 'Sleeping Buddha' — the Kanchenjunga massif laid out like a reclining figure — is the view people come for, and in clear winter air it is absurd.\n\nThe walking is on a ridge that straddles the Indian-Nepali border, so you cross back and forth all day and stop for tea in whichever country has the nearer kettle. Accommodation is trekkers' huts and homestays with hot water bottles and a lot of blankets.\n\nIt is a long trek rather than a hard one, but the Sandakphu to Phalut stretch is exposed and cold.",
    region: "North East",
    difficulty: "CHALLENGING",
    durationDays: 7,
    groupSizeMax: 12,
    minAge: 12,
    basePrice: rupees(18200),
    artVariant: "peaks",
    highlights: [
      "Everest, Lhotse, Makalu and Kanchenjunga from Sandakphu at sunrise",
      "Walk the Indian-Nepali border ridge for three days",
      "Rhododendron and magnolia forest in the Singalila park",
      "Homestays and trekkers' huts throughout",
      "Red panda habitat — a genuine, if unlikely, chance",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Singalila national park permits"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "NJP to Maneybhanjang", body: "Drive up from the plains through Mirik tea estates to the trailhead village.", stay: "Homestay, Maneybhanjang", altitudeM: 2130 },
      { title: "Maneybhanjang to Tumling", body: "Climb past Chitrey and Meghma into Nepal for the night at Tumling.", stay: "Homestay, Tumling", altitudeM: 2970, distanceKm: 11 },
      { title: "Tumling to Kalipokhri", body: "Through the Singalila park proper, in and out of Nepal, to the black lake at Kalipokhri.", stay: "Trekkers' hut, Kalipokhri", altitudeM: 3186, distanceKm: 14 },
      { title: "Kalipokhri to Sandakphu", body: "Short but steep day up the Bikebhanjang wall to Sandakphu. Sunset from the ridge.", stay: "Trekkers' hut, Sandakphu", altitudeM: 3636, distanceKm: 6 },
      { title: "Sandakphu to Phalut", body: "The best day — a long, high, exposed ridge walk with Kanchenjunga on your left the whole way.", stay: "Trekkers' hut, Phalut", altitudeM: 3600, distanceKm: 21 },
      { title: "Phalut to Srikhola", body: "Long descent through Gorkhey and Samanden, two of the prettiest villages on the route.", stay: "Homestay, Srikhola", altitudeM: 1980, distanceKm: 16 },
      { title: "Srikhola to NJP", body: "Drive back down via Darjeeling. Trip ends at New Jalpaiguri.", altitudeM: 120 },
    ],
    departures: [
      { start: [2026, 11, 22], capacity: 12, status: "GUARANTEED", seatsBooked: 7 },
      { start: [2026, 12, 20], capacity: 12, seatsBooked: 4 },
      { start: [2027, 4, 11], capacity: 12, seatsBooked: 1 },
    ],
  },
  {
    slug: "thar-desert-road-trip",
    title: "Thar Desert Road Trip",
    tagline: "Jodhpur to Jaisalmer the long way round, sleeping in the dunes.",
    summary:
      "Six days across western Rajasthan — step wells, a living fort, abandoned villages and two nights under canvas in the Sam and Khuri dunes.",
    description:
      "Most people do Jaisalmer in a day and a camel ride. We take six, go west of the highway, and spend the nights where there is nothing at all.\n\nThe route runs Jodhpur to Osian, out to the Khichan crane grounds, through Khuri and Sam, into Jaisalmer and its still-inhabited fort, then back via Kuldhara, the village abandoned overnight in 1825. We travel in 4x4s with local drivers and eat in homes rather than hotels wherever we can arrange it.\n\nEasy days, cold nights in winter, and the best food of any trip we run.",
    region: "Rajasthan",
    difficulty: "EASY",
    durationDays: 6,
    groupSizeMax: 12,
    basePrice: rupees(22400),
    artVariant: "dunes",
    highlights: [
      "Two nights in desert camps at Khuri and Sam",
      "Jaisalmer fort, one of the last inhabited forts in the world",
      "Thousands of demoiselle cranes at Khichan in winter",
      "Kuldhara, abandoned in a single night in 1825",
      "Mehrangarh in Jodhpur and the Toorji step well",
      "Folk music from Manganiyar musicians at the dune camp",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Camel ride at Sam dunes", "Folk music evening"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Arrive Jodhpur", body: "Afternoon at Mehrangarh and the Toorji step well, then dinner in the old city.", stay: "Haveli, Jodhpur", altitudeM: 234 },
      { title: "Jodhpur to Khichan via Osian", body: "The 8th-century Osian temples, then the crane feeding grounds at Khichan.", stay: "Homestay, Khichan", altitudeM: 280 },
      { title: "Khichan to Khuri", body: "Deep into the desert. Afternoon walk out to the dunes behind the village.", stay: "Desert camp, Khuri", altitudeM: 180 },
      { title: "Khuri to Sam dunes", body: "Slow morning, then across to the Sam dunes for camels, sunset and music.", stay: "Desert camp, Sam", altitudeM: 170 },
      { title: "Sam to Jaisalmer", body: "Kuldhara on the way in, then the whole afternoon inside the Jaisalmer fort.", stay: "Haveli, Jaisalmer", altitudeM: 225 },
      { title: "Jaisalmer to Jodhpur", body: "Drive back across the desert. Trip ends at Jodhpur airport or station.", altitudeM: 234 },
    ],
    departures: [
      { start: [2026, 11, 8], capacity: 12, status: "GUARANTEED", seatsBooked: 9 },
      { start: [2026, 12, 6], capacity: 12, seatsBooked: 5 },
      { start: [2027, 2, 7], capacity: 12, seatsBooked: 2 },
    ],
  },
  {
    slug: "konkan-coast-ride",
    title: "Konkan Coast Ride: Goa to Gokarna",
    tagline: "Five days of empty beaches, backwater ferries and coastal highway.",
    summary:
      "A relaxed motorcycle and 4x4 trip down the Konkan coast from South Goa to Gokarna, crossing estuaries by ferry and sleeping a hundred metres from the sea.",
    description:
      "The coastal road south of Goa is one of the best rides in India and almost nobody does it. Red laterite cliffs, cashew forest, river ferries that take four cars at a time, and beaches you have to walk twenty minutes to reach.\n\nYou can ride your own bike, take one of ours, or sit in the support 4x4 — we run all three on every departure. Distances are short, 90 to 140 km a day, so there is time to stop and swim.\n\nWe finish at Gokarna with a boat to Half Moon and Paradise beaches, which you cannot reach by road at all.",
    region: "Coastal",
    difficulty: "EASY",
    durationDays: 5,
    groupSizeMax: 10,
    minAge: 18,
    basePrice: rupees(17500),
    artVariant: "coast",
    highlights: [
      "Four river ferry crossings between Goa and Karwar",
      "Beach shacks at Agonda, Palolem and Om",
      "Boat trip to Half Moon and Paradise beaches",
      "Ride a Himalayan, a Classic, or take the support vehicle",
      "Short riding days with long swimming stops",
    ],
    inclusions: ["4 nights beachside accommodation", "All breakfasts and dinners", "Support 4x4 and mechanic", "Ferry and toll charges", "Ride leader", "Boat trip at Gokarna"],
    exclusions: [...STANDARD_EXCLUSIONS, "Motorcycle hire and fuel (₹1,500/day for a Himalayan)", "Lunches on riding days"],
    itinerary: [
      { title: "South Goa briefing and Agonda", body: "Meet at Madgaon, bike check and briefing, then a short first run down to Agonda.", stay: "Beach huts, Agonda" },
      { title: "Agonda to Palolem and Galgibaga", body: "Easy day with a long stop at the turtle beach at Galgibaga.", stay: "Beach huts, Palolem", distanceKm: 40 },
      { title: "Palolem to Karwar", body: "Cross into Karnataka, two ferries, and the cliff road into Karwar.", stay: "Hotel, Karwar", distanceKm: 95 },
      { title: "Karwar to Gokarna", body: "The best riding of the trip through cashew forest and estuary. Afternoon on Om beach.", stay: "Beach huts, Gokarna", distanceKm: 70 },
      { title: "Gokarna beaches and depart", body: "Morning boat to Half Moon and Paradise, then drops at Gokarna Road station.", },
    ],
    departures: [
      { start: [2026, 11, 29], capacity: 10, seatsBooked: 6 },
      { start: [2027, 1, 10], capacity: 10, status: "GUARANTEED", seatsBooked: 8 },
      { start: [2027, 2, 14], capacity: 10, seatsBooked: 1 },
    ],
  },
  {
    slug: "tarsar-marsar-lakes",
    title: "Tarsar Marsar Alpine Lakes",
    tagline: "Three alpine lakes, eight days, and almost nobody else.",
    summary:
      "Kashmir's best trek — a loop out of Aru through the Lidderwat valley to the Tarsar, Marsar and Sundersar lakes, camping beside each one.",
    description:
      "Tarsar Marsar is the trek the Kashmir Great Lakes trek should be: the same meadows and the same water, with a fraction of the people. You camp directly on the shore of Tarsar, which very few treks let you do.\n\nThe route climbs out of the pine forest at Aru into the Lidderwat valley, crosses two 4,000 m passes, and visits three lakes that each look entirely different depending on the hour. Shepherd families are on the meadows all summer and the trail is theirs first.\n\nFit walkers only — there are two long pass days — but nothing technical and no exposure.",
    region: "Kashmir",
    difficulty: "CHALLENGING",
    durationDays: 8,
    groupSizeMax: 12,
    minAge: 14,
    basePrice: rupees(24900),
    artVariant: "valley",
    featured: true,
    highlights: [
      "Camp on the shore of Tarsar lake",
      "View Marsar from the ridge above, usually through mist",
      "Cross the Tarsar and Sundersar passes above 4,000 m",
      "Meadow camps at Lidderwat and Shekwas",
      "Gujjar and Bakarwal shepherd settlements along the route",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Tents, sleeping bags and mats", "Pack ponies for main luggage"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Srinagar to Aru", body: "Drive via Pahalgam to the village of Aru. Gear check and an acclimatisation walk.", stay: "Guesthouse, Aru", altitudeM: 2400 },
      { title: "Aru to Lidderwat", body: "Gentle climb along the Lidder through pine forest into open meadow.", stay: "Camp, Lidderwat", altitudeM: 2730, distanceKm: 10 },
      { title: "Lidderwat to Shekwas", body: "Follow the river up past shepherd huts to a meadow camp under the ridge.", stay: "Camp, Shekwas", altitudeM: 3350, distanceKm: 6 },
      { title: "Shekwas to Tarsar", body: "Short, beautiful day ending on the shore of Tarsar lake.", stay: "Camp, Tarsar", altitudeM: 3800, distanceKm: 5 },
      { title: "Tarsar to Sundersar", body: "Over the Tarsar pass and down to Sundersar, the smallest and quietest of the three.", stay: "Camp, Sundersar", altitudeM: 3900, distanceKm: 8 },
      { title: "Marsar and back to Homwas", body: "Early climb to the Marsar viewpoint, then a long descent to Homwas.", stay: "Camp, Homwas", altitudeM: 3200, distanceKm: 13 },
      { title: "Homwas to Aru", body: "Walk out through Lidderwat to Aru. Hot shower and a proper meal.", stay: "Guesthouse, Aru", altitudeM: 2400, distanceKm: 13 },
      { title: "Aru to Srinagar", body: "Drive back to Srinagar, with a houseboat night available as an add-on.", altitudeM: 1585 },
    ],
    departures: [
      { start: [2027, 7, 4], capacity: 12, seatsBooked: 3 },
      { start: [2027, 7, 25], capacity: 12, status: "GUARANTEED", seatsBooked: 8 },
      { start: [2027, 8, 22], capacity: 12, seatsBooked: 0 },
    ],
  },
  {
    slug: "dzukou-valley-hornbill",
    title: "Dzukou Valley & Hornbill Festival",
    tagline: "The valley of flowers of the north east, plus Nagaland's big week.",
    summary:
      "Six days combining the Dzukou valley trek on the Nagaland-Manipur border with the Hornbill Festival at Kisama, where all sixteen Naga tribes gather.",
    description:
      "Dzukou is a strange, perfect place — a wide valley of rolling bamboo at 2,400 m that turns green-gold in winter, with a stream you have to break the ice on to collect water.\n\nWe time this trip to the first week of December so you get the valley and the Hornbill Festival in one trip. Hornbill is a lot: sixteen tribes, morungs, log drums, chilli-eating contests and a great deal of rice beer. We stay in Kohima and go out to Kisama each day.\n\nThe trek is two days with a cave or guesthouse night in the valley. Expect frost.",
    region: "North East",
    difficulty: "MODERATE",
    durationDays: 6,
    groupSizeMax: 12,
    minAge: 14,
    basePrice: rupees(28600),
    artVariant: "canyon",
    highlights: [
      "Two days in the Dzukou valley with a night at the rest house",
      "Three days at the Hornbill Festival in Kisama",
      "Khonoma, Asia's first green village",
      "The Kohima war cemetery",
      "Naga food — smoked pork, bamboo shoot and raja chilli",
    ],
    inclusions: [...STANDARD_INCLUSIONS, "Hornbill Festival entry for three days", "Nagaland permits"],
    exclusions: STANDARD_EXCLUSIONS,
    itinerary: [
      { title: "Dimapur to Kohima", body: "Pick-up at Dimapur and the climb to Kohima. Afternoon at the war cemetery.", stay: "Homestay, Kohima", altitudeM: 1444 },
      { title: "Trek to Dzukou valley", body: "Drive to Viswema and climb the steep trail to the valley rim, then down into the valley itself.", stay: "Rest house, Dzukou", altitudeM: 2452, distanceKm: 9 },
      { title: "Dzukou valley and out", body: "Morning walk up the valley to the cross-border ridge, then out via the Jakhama trail to Kohima.", stay: "Homestay, Kohima", altitudeM: 1444, distanceKm: 11 },
      { title: "Hornbill Festival", body: "Full day at Kisama — morungs, log drum ceremonies and the main arena performances.", stay: "Homestay, Kohima", altitudeM: 1444 },
      { title: "Khonoma and Hornbill", body: "Morning at Khonoma green village, afternoon back at the festival for the night carnival.", stay: "Homestay, Kohima", altitudeM: 1444 },
      { title: "Kohima to Dimapur", body: "Drive back down for afternoon flights and trains.", altitudeM: 260 },
    ],
    departures: [
      { start: [2026, 12, 1], capacity: 12, status: "GUARANTEED", seatsBooked: 10 },
      { start: [2027, 12, 1], capacity: 12, seatsBooked: 0 },
    ],
  },
];

const REVIEWS = [
  { authorName: "Ananya Deshpande", authorLocation: "Pune", rating: 5, tourSlug: "spiti-valley-winter-circuit", body: "I have been to Spiti twice in summer and it is not the same place in January. The homestay in Kibber had a bukhari going all night and the family fed us until we begged them to stop. Mohit watched everyone's altitude like a hawk and turned one day around when a guest wasn't right. That is the bit I'd pay for again." },
  { authorName: "Tom Whitaker", authorLocation: "Bristol, UK", rating: 5, tourSlug: "chadar-frozen-zanskar", body: "Nine days and I am still thinking about the sound the ice makes. Hard trip, properly cold, and organised far better than the two other operators I compared. The three days in Leh first are not padding, they are the reason nobody on our group got sick." },
  { authorName: "Rhea Mathew", authorLocation: "Bengaluru", rating: 5, tourSlug: "kedarkantha-summit-trek", body: "First trek ever and I was terrified of being the slowest. Two guides meant somebody stayed with me the whole way up on summit morning without making it a thing. Sunrise at the top is worth every one of those steps." },
  { authorName: "Imran Qureshi", authorLocation: "Hyderabad", rating: 4, tourSlug: "thar-desert-road-trip", body: "The Khichan cranes and the Manganiyar musicians at Sam were the highlights, not the fort. Only note: the Jodhpur to Khichan drive is longer than it looks on the itinerary. Food all week was outstanding." },
  { authorName: "Sarah Lin", authorLocation: "Singapore", rating: 5, tourSlug: "meghalaya-living-root-bridges", body: "Those 3,500 steps are real and my legs knew about it for days. Worth it. Swimming at Rainbow Falls with nobody else there, and the Nongriat homestay family treating us like returning relatives." },
  { authorName: "Vikram Nair", authorLocation: "Mumbai", rating: 5, tourSlug: "tarsar-marsar-lakes", body: "Camping on the shore of Tarsar is the single best night I have had in a tent. We passed maybe nine other trekkers in eight days. Compare that to the Great Lakes trek and it is not close." },
];

const ENQUIRIES = [
  { name: "Priya Raghavan", email: "priya.raghavan@example.com", phone: "+91 98201 11223", tourSlug: "spiti-valley-winter-circuit", subject: "January departure for 4 people", message: "Hi — we are a group of four friends looking at the 17 January Spiti departure. Two of us have been to Leh before, the other two have not been above 3,000 m. Is that going to be a problem? Also can you arrange pick-up from Chandigarh instead of Shimla?", status: "NEW" as const },
  { name: "Daniel Okonkwo", email: "d.okonkwo@example.com", phone: "+44 7700 900123", tourSlug: "chadar-frozen-zanskar", subject: "Chadar fitness requirements", message: "I am 54 and have done Kilimanjaro and Everest base camp, both without issues. Is the Chadar realistic for me? What exactly does the medical clearance need to cover, and can I get it done in the UK or does it have to be in Leh?", status: "IN_PROGRESS" as const },
  { name: "Meghna Shah", email: "meghna.shah@example.com", tourSlug: "valley-of-flowers-hemkund", subject: "Best week for the bloom", message: "Which of the two July/August departures usually has better flowers? Happy to be flexible on dates to catch peak bloom.", status: "NEW" as const },
  { name: "Corporate Offsite — Zeta Labs", email: "people@example.com", phone: "+91 80 4567 8900", subject: "Custom trip for 22 people", message: "We are looking for a 3-4 day offsite for 22 engineers in March, somewhere within driving distance of Bengaluru or a short flight. Mix of fitness levels, some will not walk much at all. Can you put together something custom with a quote?", status: "CLOSED" as const },
];

async function main() {
  console.log("Clearing existing data…");
  await prisma.bookingGuest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.departure.deleteMany();
  await prisma.itineraryDay.deleteMany();
  await prisma.review.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSetting.deleteMany();

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@blackhawkadventures.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "blackhawk-admin-2026";

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Rakesh Rohilla",
      passwordHash: hashSync(adminPassword, 12),
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      email: "ops@blackhawkadventures.com",
      name: "Operations Desk",
      passwordHash: hashSync("blackhawk-ops-2026", 12),
      role: "EDITOR",
    },
  });
  console.log(`Created admin: ${adminEmail} / ${adminPassword}`);

  const tourIdsBySlug = new Map<string, string>();

  for (const tour of TOURS) {
    const created = await prisma.tour.create({
      data: {
        slug: tour.slug,
        title: tour.title,
        tagline: tour.tagline,
        summary: tour.summary,
        description: tour.description,
        region: tour.region,
        difficulty: tour.difficulty,
        durationDays: tour.durationDays,
        groupSizeMax: tour.groupSizeMax,
        minAge: tour.minAge,
        basePriceCents: tour.basePrice,
        currency: "INR",
        artVariant: tour.artVariant,
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        gallery: [],
        featured: tour.featured ?? false,
        published: true,
        itinerary: {
          create: tour.itinerary.map((day, index) => ({
            dayNumber: index + 1,
            title: day.title,
            body: day.body,
            stay: day.stay,
            altitudeM: day.altitudeM,
            distanceKm: day.distanceKm,
          })),
        },
        departures: {
          create: tour.departures.map((departure) => {
            const start = utc(...departure.start);
            const end = new Date(start);
            end.setUTCDate(end.getUTCDate() + tour.durationDays - 1);
            const seatsBooked = departure.seatsBooked ?? 0;
            return {
              startDate: start,
              endDate: end,
              capacity: departure.capacity,
              seatsBooked,
              status: seatsBooked >= departure.capacity ? ("FULL" as const) : (departure.status ?? "SCHEDULED"),
            };
          }),
        },
      },
    });
    tourIdsBySlug.set(tour.slug, created.id);
    console.log(`  tour: ${tour.title}`);
  }

  for (const review of REVIEWS) {
    await prisma.review.create({
      data: {
        tourId: tourIdsBySlug.get(review.tourSlug),
        authorName: review.authorName,
        authorLocation: review.authorLocation,
        rating: review.rating,
        body: review.body,
        published: true,
      },
    });
  }
  console.log(`Created ${REVIEWS.length} reviews`);

  for (const enquiry of ENQUIRIES) {
    await prisma.enquiry.create({
      data: {
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        tourId: enquiry.tourSlug ? tourIdsBySlug.get(enquiry.tourSlug) : undefined,
        subject: enquiry.subject,
        message: enquiry.message,
        status: enquiry.status,
        handledAt: enquiry.status === "CLOSED" ? new Date() : undefined,
      },
    });
  }
  console.log(`Created ${ENQUIRIES.length} enquiries`);

  // A few bookings so the dashboard has something real in it. Seats were
  // already accounted for in each departure's seatsBooked above.
  const spitiDeparture = await prisma.departure.findFirst({
    where: { tour: { slug: "spiti-valley-winter-circuit" } },
    orderBy: { startDate: "asc" },
    include: { tour: true },
  });
  const kedarDeparture = await prisma.departure.findFirst({
    where: { tour: { slug: "kedarkantha-summit-trek" } },
    orderBy: { startDate: "asc" },
    include: { tour: true },
  });

  const seedBookings = [
    {
      departure: spitiDeparture,
      reference: "BHA-K7MQ2X",
      guests: 2,
      status: "CONFIRMED" as const,
      paymentStatus: "PAID" as const,
      customerName: "Ananya Deshpande",
      customerEmail: "ananya.deshpande@example.com",
      customerPhone: "+91 98220 44556",
      customerCountry: "India",
      travellers: [
        { fullName: "Ananya Deshpande", age: 31, isLead: true },
        { fullName: "Kabir Deshpande", age: 34, dietary: "Vegetarian" },
      ],
    },
    {
      departure: spitiDeparture,
      reference: "BHA-R3WDY9",
      guests: 1,
      status: "PENDING" as const,
      paymentStatus: "DEPOSIT_PAID" as const,
      customerName: "Lukas Berger",
      customerEmail: "lukas.berger@example.com",
      customerPhone: "+49 151 2345678",
      customerCountry: "Germany",
      notes: "Arriving in Delhi two days early, happy to meet the group in Shimla.",
      travellers: [{ fullName: "Lukas Berger", age: 42, isLead: true }],
    },
    {
      departure: kedarDeparture,
      reference: "BHA-T9FHC4",
      guests: 3,
      status: "CONFIRMED" as const,
      paymentStatus: "PAID" as const,
      customerName: "Rhea Mathew",
      customerEmail: "rhea.mathew@example.com",
      customerPhone: "+91 99000 77881",
      customerCountry: "India",
      travellers: [
        { fullName: "Rhea Mathew", age: 27, isLead: true },
        { fullName: "Nikhil Mathew", age: 29 },
        { fullName: "Sneha Pillai", age: 26, dietary: "No dairy" },
      ],
    },
  ];

  for (const booking of seedBookings) {
    if (!booking.departure) continue;
    const unitPriceCents = booking.departure.priceCents ?? booking.departure.tour.basePriceCents;
    await prisma.booking.create({
      data: {
        reference: booking.reference,
        departureId: booking.departure.id,
        tourTitle: booking.departure.tour.title,
        tourSlug: booking.departure.tour.slug,
        startDate: booking.departure.startDate,
        guests: booking.guests,
        unitPriceCents,
        totalCents: unitPriceCents * booking.guests,
        currency: booking.departure.tour.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        customerCountry: booking.customerCountry,
        notes: booking.notes,
        confirmedAt: booking.status === "CONFIRMED" ? new Date() : undefined,
        travellers: { create: booking.travellers },
      },
    });
  }
  console.log(`Created ${seedBookings.length} bookings`);

  const { SETTING_DEFAULTS } = await import("../src/lib/settings-defaults");
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await prisma.siteSetting.create({ data: { key, value } });
  }
  console.log("Created site settings");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\nSeed complete.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
