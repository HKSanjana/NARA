export interface Province {
  id: string;
  pId: string;
}

export interface CardData {
  imageUrl: string;
  title: string;
  content: string;
  buttonLink: string;
}

export const provinces: Province[] = [
  { id: "western", pId: "western-province" },
  { id: "central", pId: "central-province" },
  { id: "southern", pId: "southern-province" },
  { id: "northern", pId: "northern-province" },
  { id: "eastern", pId: "eastern-province" },
  { id: "northwestern", pId: "northwestern-province" },
  { id: "northcentral", pId: "northcentral-province" },
  { id: "uva", pId: "uva-province" },
  { id: "sabaragamuwa", pId: "sabaragamuwa-province" },
];

export const cardData: { [key: string]: CardData } = {
  default: {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Sri_Lanka.svg",
    title: "Sri Lanka",
    content: "Sri Lanka, officially the Democratic Socialist Republic of Sri Lanka, is an island country in South Asia, located in the Indian Ocean southwest of the Bay of Bengal and southeast of the Arabian Sea. It is known for its rich cultural heritage, stunning landscapes, and biodiversity.",
    buttonLink: "https://www.wikiwand.com/en/Sri_Lanka",
  },
  "western-province": {
    imageUrl: "assets/images/map/colombo.jpg",
    title: "Western Province",
    content: "Immerse yourself in the timeless charm of Colombo's bustling streets, unwind on the golden shores of Negombo, and explore the sacred mysteries of Kalutara's temples. Discover the beauty of Western Province!",
    buttonLink: "Provinces/Western.html",
  },
  "central-province": {
    imageUrl: "assets/images/map/kandy.jpg",
    title: "Central Province",
    content: "Discover the heart of Sri Lanka's cultural richness and natural beauty in Central Province! From ancient citadels to misty mountains and lush tea estates, this region offers a captivating blend of history and nature. Explore the sacred Temple of the Tooth in Kandy, a UNESCO World Heritage Site, or hike through the stunning landscapes of Nuwara Eliya. Don't miss the chance to wander through the lush tea plantations and witness the breathtaking waterfalls that dot the landscape. Central Province is a truly unforgettable destination for every traveler.",
    buttonLink: "Provinces/Central.html",
  },
  "southern-province": {
    imageUrl: "assets/images/map/galle.jpg",
    title: "Southern Province",
    content: "Experience the ultimate coastal getaway in Sri Lanka's Southern Province! From the historic Galle Fort, a UNESCO World Heritage Site, to the breathtaking beaches of Mirissa and Unawatuna, this region offers an array of experiences. Discover ancient temples, witness vibrant wildlife at Yala National Park, and indulge in thrilling water sports. Southern Province is a paradise for sun-seekers and adventure enthusiasts alike.",
    buttonLink: "Provinces/Southern.html",
  },
  "northern-province": {
    imageUrl: "assets/images/map/jaffna.jpg",
    title: "Northern Province",
    content: "Discover the unique cultural heritage of Sri Lanka's Northern Province, a region with a rich history and vibrant traditions. Explore the historic city of Jaffna, known for its ancient temples, colonial architecture, and delicious cuisine. Visit the beautiful islands surrounding the Jaffna Peninsula, or delve into the region's spiritual side at the Nallur Kandaswamy Temple. Northern Province offers a glimpse into a different side of Sri Lanka, with its distinct landscapes and warm hospitality.",
    buttonLink: "Provinces/Northern.html",
  },
  "eastern-province": {
    imageUrl: "assets/images/map/trinco.jpg",
    title: "Eastern Province",
    content: "Unwind on the pristine beaches of Sri Lanka's Eastern Province, a hidden gem waiting to be explored. From the tranquil shores of Trincomalee to the surfing paradise of Arugam Bay, this region is a haven for beach lovers and water sports enthusiasts. Discover ancient temples, explore vibrant coral reefs, and witness the unique culture of the East. Eastern Province offers a perfect blend of natural beauty and adventure.",
    buttonLink: "Provinces/Eastern.html",
  },
  "northwestern-province": {
    imageUrl: "assets/images/map/puttalam.jpg",
    title: "Northwestern Province",
    content: "Discover the untamed beauty of Sri Lanka's Northwestern Province, a region of rugged landscapes and rich cultural heritage. Explore the ancient city of Anuradhapura, a UNESCO World Heritage Site, or delve into the region's spiritual side at the Yapahuwa Rock Fortress. Witness the breathtaking beauty of Wilpattu National Park, home to a diverse range of wildlife, including leopards and elephants. Northwestern Province offers a unique blend of history, nature, and adventure.",
    buttonLink: "Provinces/Northwestern.html",
  },
  "northcentral-province": {
    imageUrl: "assets/images/map/anuradhapura.jpg",
    title: "North Central Province",
    content: "Embark on a journey through history and spirituality in Sri Lanka's North Central Province. Explore the ancient city of Anuradhapura, a UNESCO World Heritage Site, and marvel at its magnificent stupas and ancient reservoirs. Discover the sacred city of Polonnaruwa, another UNESCO World Heritage Site, and witness the grandeur of its ancient ruins. North Central Province is a must-visit destination for anyone interested in Sri Lanka's rich history and cultural heritage.",
    buttonLink: "Provinces/Northcentral.html",
  },
  "uva-province": {
    imageUrl: "assets/images/map/uva.jpg",
    title: "Uva Province",
    content: "Embrace the allure of Uva Province in Sri Lanka, a haven of natural wonders and cultural treasures. From the majestic splendor of Ella's breathtaking landscapes to the ancient grandeur of Buduruwagala's rock carvings, this province beckons with its diverse charm.",
    buttonLink: "Provinces/Uva.html",
  },
  "sabaragamuwa-province": {
    imageUrl: "assets/images/map/sabaragamuwa.jpg",
    title: "Sabaragamuwa Province",
    content: "Explore the serene Sabaragamuva Province in Sri Lanka, where nature's beauty and cultural wonders await. From mist-covered Adam's Peak to enchanting Udawalawe National Park, discover hidden gems like Aluvihara Rock Temple and Horton Plains. Find tranquility in this breathtaking province.",
    buttonLink: "Provinces/Sabaragamuwa.html",
  },
};