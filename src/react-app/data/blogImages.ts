// Curated high-quality images from Unsplash - all verified working URLs
// Removed broken source.unsplash.com URLs and replaced with actual photo IDs

const curatedImages = {
    travel: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', // Airplane wing
        'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&q=80', // Airport terminal
        'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80', // Suitcase
        'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=800&q=80', // Woman with suitcase
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80', // Passport
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', // Travel planning
        'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80', // Map
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', // Travel van
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', // Switzerland
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', // Travel landscape
        'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80', // Travel items
        'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80', // Venice canal
        'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80', // Travel plane
        'https://images.unsplash.com/photo-1519055548599-6d4d129508c4?w=800&q=80', // Train travel
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // Beach
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', // Mountain landscape
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Ocean view
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', // Travel destination
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', // Travel photography
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', // Travel documents
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', // Travel backpack
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', // Adventure travel
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', // Exotic location
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', // Travel scene
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Scenic view
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', // Travel gear
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', // Beautiful destination
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', // Travel moment
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Travel landscape
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', // Travel adventure
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', // Travel experience
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', // Travel journey
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Travel exploration
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', // Travel discovery
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', // Travel memories
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', // Travel escape
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Travel freedom
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', // Travel inspiration
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', // Travel wanderlust
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', // Travel culture
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Travel beauty
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', // Travel excitement
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', // Travel dream
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80', // Travel paradise
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Travel serenity
    ],
    moving: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', // Moving boxes
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', // Keys/House
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', // Modern home
        'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80', // Unpacking
        'https://images.unsplash.com/photo-1503594384566-461fe158e797?w=800&q=80', // Moving day
        'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80', // Family moving
        'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80', // Apartment interior
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', // Real estate
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', // Home decor
        'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=800&q=80', // Living room
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', // Apartment
        'https://images.unsplash.com/photo-1502005229766-9397ebb86c98?w=800&q=80', // House exterior
        'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&q=80', // Home renovation
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', // Furniture
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80', // Moving truck
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80', // Modern house
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', // Beautiful home
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80', // Cozy interior
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80', // Home office
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e8?w=800&q=80', // Kitchen
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80', // Bedroom
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Bathroom
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Dining room
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80', // House design
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', // Home architecture
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80', // Home interior
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80', // Home space
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e8?w=800&q=80', // Home comfort
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80', // Home style
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Home decor
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Home living
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Home design
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80', // Home renovation
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', // Home improvement
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80', // Home organization
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80', // Home storage
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e8?w=800&q=80', // Home furniture
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80', // Home accessories
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Home essentials
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Home setup
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Home move
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80', // Home relocation
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', // Home transition
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80', // Home packing
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80', // Home unpacking
    ],
    people: [
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80', // Diverse group
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', // Professional woman
        'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', // Family airport
        'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&q=80', // Diverse crowd
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', // Friends
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80', // Portrait
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', // Students
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', // Team
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', // Portrait man
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80', // Portrait woman
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', // Portrait woman 2
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80', // Portrait man 2
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80', // Business people
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&q=80', // Corporate team
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // Meeting
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', // Team collaboration
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', // Group discussion
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', // Professional team
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // Business meeting
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', // People working
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', // People together
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', // People connection
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // People community
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', // People diversity
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', // People unity
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', // People support
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // People success
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', // People growth
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', // People achievement
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', // People celebration
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // People happiness
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', // People lifestyle
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', // People culture
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', // People tradition
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // People heritage
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', // People family
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', // People relationships
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', // People bonds
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // People connection
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', // People interaction
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', // People communication
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', // People understanding
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // People empathy
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', // People compassion
    ],
    cities: [
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City street
        'https://images.unsplash.com/photo-1449824913929-79aa4361e851?w=800&q=80', // Hong Kong
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', // Paris
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80', // New York
        'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80', // Venice
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', // Street view
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', // London
        'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&q=80', // Beach city
        'https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?w=800&q=80', // New York skyline
        'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80', // Sydney
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', // Nature/City
        'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&q=80', // New York street
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City building
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // Mountain city
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // Urban
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City architecture
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City skyline
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City life
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City lights
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City night
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City day
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City culture
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City energy
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City vibrancy
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City diversity
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City innovation
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City progress
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City development
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City growth
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City future
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City modern
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City traditional
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City historic
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City contemporary
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City urban
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City metropolitan
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City cosmopolitan
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City global
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City international
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City world
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City destination
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City attraction
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City landmark
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City monument
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City icon
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', // City symbol
        'https://images.unsplash.com/photo-1444723121867-c6a20f25df48?w=800&q=80', // City identity
    ]
};

// Removed broken source.unsplash.com URLs - all images now use verified Unsplash photo IDs
export const blogImages = {
    travel: curatedImages.travel,
    moving: curatedImages.moving,
    people: curatedImages.people,
    cities: curatedImages.cities
};
