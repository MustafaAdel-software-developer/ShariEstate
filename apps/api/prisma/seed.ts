import { PrismaClient, UserRole, ListingType, PropertyType, ListingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CA_CITIES = [
  { name: 'Los Angeles', slug: 'los-angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'San Francisco', slug: 'san-francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'San Diego', slug: 'san-diego', lat: 32.7157, lng: -117.1611 },
  { name: 'Sacramento', slug: 'sacramento', lat: 38.5816, lng: -121.4944 },
  { name: 'San Jose', slug: 'san-jose', lat: 37.3382, lng: -121.8863 },
  { name: 'Oakland', slug: 'oakland', lat: 37.8044, lng: -122.2712 },
  { name: 'Irvine', slug: 'irvine', lat: 33.6846, lng: -117.8265 },
  { name: 'Pasadena', slug: 'pasadena', lat: 34.1478, lng: -118.1445 },
];

const FEATURES = [
  'Hardwood Floors', 'Swimming Pool', 'Garage', 'Fireplace', 'Central AC',
  'Updated Kitchen', 'Walk-in Closet', 'Smart Home', 'Solar Panels', 'Garden',
];

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
];

const CA_NEIGHBORHOODS: Record<string, { name: string; slug: string }[]> = {
  'los-angeles': [
    { name: 'Hollywood', slug: 'hollywood' },
    { name: 'Silver Lake', slug: 'silver-lake' },
    { name: 'Venice', slug: 'venice' },
  ],
  'san-francisco': [
    { name: 'Mission District', slug: 'mission-district' },
    { name: 'Pacific Heights', slug: 'pacific-heights' },
    { name: 'Noe Valley', slug: 'noe-valley' },
  ],
  'san-diego': [
    { name: 'La Jolla', slug: 'la-jolla' },
    { name: 'North Park', slug: 'north-park' },
    { name: 'Gaslamp Quarter', slug: 'gaslamp-quarter' },
  ],
  'sacramento': [
    { name: 'Midtown', slug: 'midtown' },
    { name: 'East Sacramento', slug: 'east-sacramento' },
  ],
  'san-jose': [
    { name: 'Willow Glen', slug: 'willow-glen' },
    { name: 'Almaden Valley', slug: 'almaden-valley' },
  ],
  'oakland': [
    { name: 'Rockridge', slug: 'rockridge' },
    { name: 'Lake Merritt', slug: 'lake-merritt' },
  ],
  'irvine': [
    { name: 'Woodbridge', slug: 'woodbridge' },
    { name: 'Turtle Rock', slug: 'turtle-rock' },
  ],
  'pasadena': [
    { name: 'Old Pasadena', slug: 'old-pasadena' },
    { name: 'South Pasadena', slug: 'south-pasadena' },
  ],
};

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@realestate.com' },
    update: {},
    create: {
      email: 'admin@realestate.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.admin,
    },
  });

  const agentUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah.johnson@realestate.com' },
      update: {},
      create: {
        email: 'sarah.johnson@realestate.com',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: UserRole.agent,
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.chen@realestate.com' },
      update: {},
      create: {
        email: 'mike.chen@realestate.com',
        passwordHash,
        firstName: 'Mike',
        lastName: 'Chen',
        role: UserRole.agent,
      },
    }),
    prisma.user.upsert({
      where: { email: 'emily.rodriguez@realestate.com' },
      update: {},
      create: {
        email: 'emily.rodriguez@realestate.com',
        passwordHash,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        role: UserRole.agent,
      },
    }),
  ]);

  await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Buyer',
      role: UserRole.buyer,
    },
  });

  const brokerage = await prisma.brokerage.upsert({
    where: { slug: 'pacific-homes-realty' },
    update: {},
    create: {
      name: 'Pacific Homes Realty',
      slug: 'pacific-homes-realty',
      website: 'https://pacifichomes.example.com',
    },
  });

  const agents = await Promise.all(
    agentUsers.map((user, i) =>
      prisma.agentProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          slug: `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`,
          bio: `Licensed California real estate agent with ${5 + i * 3} years of experience helping clients find their dream homes.`,
          phone: `(555) 010-${1000 + i}`,
          licenseNumber: `CA-DRE-${100000 + i}`,
          brokerageId: brokerage.id,
        },
      }),
    ),
  );

  const california = await prisma.state.upsert({
    where: { slug: 'california' },
    update: { enabled: true },
    create: {
      name: 'California',
      slug: 'california',
      abbreviation: 'CA',
      enabled: true,
      heroTitle: 'Find Your Dream Home in California',
      heroSubtitle: 'Explore thousands of properties across the Golden State — from coastal condos to mountain retreats.',
      seoTitle: 'California Real Estate | Homes for Sale & Rent',
      seoDescription: 'Browse California homes for sale and rent. Search listings in Los Angeles, San Francisco, San Diego, and more.',
    },
  });

  const cities = await Promise.all(
    CA_CITIES.map((c) =>
      prisma.city.upsert({
        where: { stateId_slug: { stateId: california.id, slug: c.slug } },
        update: {},
        create: {
          name: c.name,
          slug: c.slug,
          stateId: california.id,
          seoTitle: `${c.name}, CA Real Estate`,
          seoDescription: `Find homes for sale and rent in ${c.name}, California.`,
        },
      }),
    ),
  );

  const neighborhoodByCitySlug = new Map<string, { id: string; slug: string }[]>();

  for (const city of cities) {
    const defs = CA_NEIGHBORHOODS[city.slug] || [];
    const created = await Promise.all(
      defs.map((n) =>
        prisma.neighborhood.upsert({
          where: { cityId_slug: { cityId: city.id, slug: n.slug } },
          update: {},
          create: { name: n.name, slug: n.slug, cityId: city.id },
        }),
      ),
    );
    neighborhoodByCitySlug.set(city.slug, created.map((n) => ({ id: n.id, slug: n.slug })));
  }

  const propertyTypes = [PropertyType.house, PropertyType.condo, PropertyType.townhouse, PropertyType.house, PropertyType.condo];
  const listingTypes = [ListingType.sale, ListingType.sale, ListingType.rent, ListingType.sale, ListingType.rent];

  let listingCount = 0;
  for (const city of cities) {
    const cityMeta = CA_CITIES.find((c) => c.slug === city.slug)!;
    for (let i = 0; i < 4; i++) {
      listingCount++;
      const propertyType = propertyTypes[i % propertyTypes.length];
      const listingType = listingTypes[i % listingTypes.length];
      const beds = 2 + (i % 4);
      const baths = 1 + (i % 3);
      const sqft = 900 + i * 350 + city.name.length * 10;
      const price = listingType === ListingType.rent
        ? 2500 + i * 800 + beds * 300
        : 450000 + i * 125000 + beds * 50000;

      const lat = cityMeta.lat + (Math.random() - 0.5) * 0.08;
      const lng = cityMeta.lng + (Math.random() - 0.5) * 0.08;
      const agent = agents[listingCount % agents.length];
      const cityNeighborhoods = neighborhoodByCitySlug.get(city.slug) || [];
      const neighborhood = cityNeighborhoods.length
        ? cityNeighborhoods[listingCount % cityNeighborhoods.length]
        : undefined;

      const listing = await prisma.listing.create({
        data: {
          title: `${beds}BR ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${city.name}`,
          description: `Beautiful ${propertyType} located in the heart of ${city.name}, California. This ${beds} bedroom, ${baths} bathroom home features modern amenities, great natural light, and convenient access to schools, shopping, and dining. Perfect for ${listingType === ListingType.rent ? 'renters' : 'buyers'} looking for quality living in ${city.name}.`,
          listingType,
          propertyType,
          status: ListingStatus.active,
          price,
          beds,
          baths,
          sqft,
          yearBuilt: 1985 + (i * 5),
          address: `${1200 + listingCount * 17} ${['Oak', 'Maple', 'Pine', 'Cedar'][i % 4]} Street`,
          zip: `9${String(1000 + listingCount).slice(-4)}`,
          lat,
          lng,
          isFeatured: listingCount <= 6,
          stateId: california.id,
          cityId: city.id,
          neighborhoodId: neighborhood?.id,
          agentId: agent.id,
          features: {
            create: FEATURES.slice(i, i + 3).map((name) => ({ name })),
          },
          images: {
            create: [
              { url: IMAGE_URLS[i % IMAGE_URLS.length], sortOrder: 0, isCover: true, alt: 'Front exterior' },
              { url: IMAGE_URLS[(i + 1) % IMAGE_URLS.length], sortOrder: 1, isCover: false, alt: 'Living room' },
              { url: IMAGE_URLS[(i + 2) % IMAGE_URLS.length], sortOrder: 2, isCover: false, alt: 'Kitchen' },
            ],
          },
        },
      });

      await prisma.priceHistory.create({
        data: { listingId: listing.id, price, status: ListingStatus.active, note: 'Listed' },
      });
    }
  }

  // Seed all US states (disabled except California) for multi-state rollout
  const US_STATES = [
    ['Alabama', 'alabama', 'AL'], ['Alaska', 'alaska', 'AK'], ['Arizona', 'arizona', 'AZ'],
    ['Arkansas', 'arkansas', 'AR'], ['Colorado', 'colorado', 'CO'], ['Connecticut', 'connecticut', 'CT'],
    ['Delaware', 'delaware', 'DE'], ['Florida', 'florida', 'FL'], ['Georgia', 'georgia', 'GA'],
    ['Hawaii', 'hawaii', 'HI'], ['Idaho', 'idaho', 'ID'], ['Illinois', 'illinois', 'IL'],
    ['Indiana', 'indiana', 'IN'], ['Iowa', 'iowa', 'IA'], ['Kansas', 'kansas', 'KS'],
    ['Kentucky', 'kentucky', 'KY'], ['Louisiana', 'louisiana', 'LA'], ['Maine', 'maine', 'ME'],
    ['Maryland', 'maryland', 'MD'], ['Massachusetts', 'massachusetts', 'MA'], ['Michigan', 'michigan', 'MI'],
    ['Minnesota', 'minnesota', 'MN'], ['Mississippi', 'mississippi', 'MS'], ['Missouri', 'missouri', 'MO'],
    ['Montana', 'montana', 'MT'], ['Nebraska', 'nebraska', 'NE'], ['Nevada', 'nevada', 'NV'],
    ['New Hampshire', 'new-hampshire', 'NH'], ['New Jersey', 'new-jersey', 'NJ'], ['New Mexico', 'new-mexico', 'NM'],
    ['New York', 'new-york', 'NY'], ['North Carolina', 'north-carolina', 'NC'], ['North Dakota', 'north-dakota', 'ND'],
    ['Ohio', 'ohio', 'OH'], ['Oklahoma', 'oklahoma', 'OK'], ['Oregon', 'oregon', 'OR'],
    ['Pennsylvania', 'pennsylvania', 'PA'], ['Rhode Island', 'rhode-island', 'RI'], ['South Carolina', 'south-carolina', 'SC'],
    ['South Dakota', 'south-dakota', 'SD'], ['Tennessee', 'tennessee', 'TN'], ['Texas', 'texas', 'TX'],
    ['Utah', 'utah', 'UT'], ['Vermont', 'vermont', 'VT'], ['Virginia', 'virginia', 'VA'],
    ['Washington', 'washington', 'WA'], ['West Virginia', 'west-virginia', 'WV'], ['Wisconsin', 'wisconsin', 'WI'],
    ['Wyoming', 'wyoming', 'WY'],
  ];

  for (const [name, slug, abbr] of US_STATES) {
    await prisma.state.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        abbreviation: abbr,
        enabled: false,
        seoTitle: `${name} Real Estate`,
        seoDescription: `Browse homes for sale and rent in ${name}.`,
      },
    });
  }

  console.log(`Seeded: 1 active state (California), ${US_STATES.length + 1} total states, ${cities.length} cities, ${listingCount} listings, neighborhoods in CA cities`);
  console.log('Demo accounts (password: Password123!):');
  console.log('  admin@realestate.com (admin)');
  console.log('  sarah.johnson@realestate.com (agent)');
  console.log('  buyer@example.com (buyer)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
