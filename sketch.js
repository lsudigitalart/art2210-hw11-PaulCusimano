let crashTable, crashes = [];
const lsuCoords = { latitude: 30.4133, longitude: -91.1800 };
const cityBounds = { minLat: 30.3290, maxLat: 30.5838, minLon: -91.2805, maxLon: -91.0025 };
const aspectRatio = (cityBounds.maxLon - cityBounds.minLon) / (cityBounds.maxLat - cityBounds.minLat);

function preload() {
  crashTable = loadTable("Baton_Rouge_Traffic_Crash_Incidents.csv", "header");
}

function getColorForLightingCondition(lighting, isLegend = false) {
  const alpha = isLegend ? 255 : 200;
  
  switch (lighting) {
    case 'Daylight': return color(255, 255, 0, alpha); // uellow
    case 'Dark - continuous street lights': return color(0, 191, 255, alpha); // blue
    case 'Dark - street lights at intersection only': return color(138, 43, 226, alpha); //  Violet
    case 'Dawn/dusk': return color(255, 165, 0, alpha); // orange
    case 'Other': return color(255, 69, 0, alpha); // red orange
    case 'Unknown': return color(150, 150, 150, alpha); // gray
    default: return color(150, 150, 150, alpha); // gray
  }
}

function setup() {
  createCanvas(800, 800 / aspectRatio);
  
  console.log("Total rows in table:", crashTable.rows.length);
  
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  crashes = crashTable.rows
    .map(row => {
      try {
        const dateStr = row.get('CRASH DATE');
        const lat = parseFloat(row.get('LATITUDE'));
        const lon = parseFloat(row.get('LONGITUDE'));
        const lighting = row.get('LIGHTING CONDITION');
        const injury = parseInt(row.get('INJURY')) > 0;
        const fatality = parseInt(row.get('FATALITY')) > 0;

        const [datePart, timePart] = dateStr.split(' ');
        const [month, day, year] = datePart.split('/');
        const time = timePart.split(':');
        const hour = parseInt(time[0]);
        const minute = time[1];

        const parsedDate = new Date(year, month-1, day, hour, minute);
        
        if (isNaN(lat) || isNaN(lon) || isNaN(parsedDate.getTime())) {
          return null;
        }

        return {
          latitude: lat,
          longitude: lon,
          lightingCondition: lighting || 'Unknown',
          injury,
          fatality,
          crashDate: parsedDate
        };
      } catch (e) {
        return null;
      }
    })
    .filter(crash => crash && crash.crashDate >= oneYearAgo);
}

function draw() {
  background(0);
  stroke(255, 128);
  strokeWeight(0.5);

  for (let crash of crashes) {
    let x = map(crash.longitude, cityBounds.minLon, cityBounds.maxLon, 0, width);
    let y = map(crash.latitude, cityBounds.minLat, cityBounds.maxLat, height, 0);
    
    fill(getColorForLightingCondition(crash.lightingCondition));
    
    let size = 5;
    if (crash.fatality) size = 12;
    else if (crash.injury) size = 8;
    
    circle(x, y, size);
  }

  drawLegend();
}

function drawLegend() {
  fill(255);
  textSize(12);
  let legendData = [
    { label: 'Daylight', color: getColorForLightingCondition('Daylight', true) },
    { label: 'Dark - Continuous Lights', color: getColorForLightingCondition('Dark - continuous street lights', true) },
    { label: 'Dark - Intersection Lights', color: getColorForLightingCondition('Dark - street lights at intersection only', true) },
    { label: 'Dawn/Dusk', color: getColorForLightingCondition('Dawn/dusk', true) },
    { label: 'Other', color: getColorForLightingCondition('Other', true) },
    { label: 'Unknown', color: getColorForLightingCondition('Unknown', true) }
  ];
  
  fill(0, 180);
  rect(5, 5, 200, legendData.length * 20 + 50);
  
  for (let i = 0; i < legendData.length; i++) {
    fill(legendData[i].color);
    circle(15, 15 + i * 20, 10);
    fill(255);
    text(legendData[i].label, 30, 20 + i * 20);
  }
  text('Circle Size:', 10, legendData.length * 20 + 25);
  fill(255);
  circle(25, legendData.length * 20 + 35, 5);
  circle(80, legendData.length * 20 + 35, 8);
  circle(140, legendData.length * 20 + 35, 12);
  text('Normal', 15, legendData.length * 20 + 50);
  text('Injury', 65, legendData.length * 20 + 50);
  text('Fatality', 120, legendData.length * 20 + 50);
}