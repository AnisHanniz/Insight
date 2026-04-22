const fs = require('fs');

const dataFile = 'public/data/scenarios.json';
const data = JSON.parse(fs.readFileSync(dataFile));

const mapImages = {
  'Dust2': '/images/maps/radar-images/de_dust2.png',
  'Mirage': '/images/maps/radar-images/de_mirage.png',
  'Inferno': '/images/maps/radar-images/de_inferno.png',
  'Nuke': '/images/maps/radar-images/de_nuke.png',
  'Anubis': '/images/maps/radar-images/de_anubis.png',
  'Ancient': '/images/maps/radar-images/de_ancient.png',
  'Vertigo': '/images/maps/radar-images/de_vertigo.png',
  'Overpass': '/images/maps/radar-images/de_overpass.png',
  'Train': '/images/maps/radar-images/de_train.png',
};

// Check if these images exist
for (const [key, value] of Object.entries(mapImages)) {
  if (!fs.existsSync(`public${value}`)) {
    console.log(`Warning: image not found for ${key}: public${value}`);
  }
}

// Check other available maps
const defaultImages = fs.readdirSync('public/images/maps/').filter(f => f.endsWith('.png'));

data.forEach(scenario => {
  // Try to determine map from scenario.map
  let determinedMap = scenario.map !== 'Any' ? scenario.map : null;

  // Fallback to text parsing
  if (!determinedMap) {
    const text = (scenario.title + ' ' + scenario.description).toLowerCase();
    for (const map of Object.keys(mapImages)) {
      if (text.includes(map.toLowerCase())) {
        determinedMap = map;
        break;
      }
    }
  }

  // Assign image if found
  if (determinedMap && mapImages[determinedMap]) {
    scenario.image = mapImages[determinedMap];
  } else if (!scenario.image) {
    // Pick a random image from default maps folder if available and we want to ensure *every* question has an image?
    // Let's just use a general image or leave it empty if we don't know the map.
    // We can use a random map radar if we want, or just leave as is.
    // The prompt says "intègre les images dans les différentes questions"
    // Let's see if we can use a generic image. We have radar-images/default_png.png ? Let's check.
    // From my previous find output: ./images/maps/radar-images/default_png.png exists!
    scenario.image = '/images/maps/radar-images/default_png.png';
  }
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log('Updated scenarios.json with images.');
