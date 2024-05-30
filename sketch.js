//We need a variable to hold our image
let img; //Variable to store the main image
let palette; //Variable to store the color paltte
let y = 0; //Variable to make the vertical position of the image
//Add a variable to hold fish image
let fishImg; //Variable to store the fish image
let fishPositions = [];// Array to store fish positions
let birdImg; // Variable to store the bird image
let canvasImage; // Variable to store the canvas as an image

// This is global variable to store our image
let logoImage;
// Two variables to hold the width and height of the image
let logoWidth = 500; let logoHeight = 40;

//Let's make an object to hold the draw properties of the image
let imgDrwPrps = {aspect: 0, width: 0, height: 0, xOffset: 0, yOffset: 0};

//And a variable for the canvas aspect ratio
let canvasAspectRatio = 1200 / 800; //set the variable of the canvas aspect ratio
const originalWidth = 1200; // set the original width
const originalHeight = 800; // set the original height
let aspectRatio = originalWidth / originalHeight; //Aspect ratio of the canvas

// Define the water area
let waterYStart; // Dynamic water start position
 
 


//CLASS
// Brush class to hold the properties of a brush and this technique is from https://chatgpt.com/
class Brush {
  constructor(size, color) {
    this.size = size; // Brush size
    this.color = color; // Brush color
  }
  draw(x, y) {
    noStroke(); // Disable stroke
    fill(this.color); // Set fill color to brush color

  // Calculate random position within the brush size
  let angle = random(TWO_PI); // Random angle for brush stroke
  let length = random(this.size * 1.5, this.size * 1.5); // Random length for brush stroke
  let dx = cos(angle) * length; // X offset for brush stroke
  let dy = sin(angle) * length; // Y offset for brush stroke
  for (let i = 0; i < 5; i++) { // Draw multiple ellipses for blurred effect
    let offsetX = random(-this.size, this.size); // Random X offset for blur
    let offsetY = random(-this.size, this.size); // Random Y offset for blur
    ellipse(x + dx + offsetX, y + dy + offsetY, this.size, this.size); // Draw blurred circle
    }
  }
}




// Wave class to draw a single wave line across the screen
class Wave {
  constructor(amplitude, frequency, yBase, color, strokeWeight) {
    this.amplitude = amplitude; // Height of the wave
    this.frequency = frequency; // How often peaks and troughs occur
    this.yBase = yBase; // Base line of the wave
    this.offset = 0 // Initial offset for Perlin noise
    this.color = color; // Color of the wave
    this.strokeWeight = strokeWeight; // Thickness of the wave line
  }

  display() {
    noFill();
    stroke(this.color);
    strokeWeight(this.strokeWeight);
    beginShape();
    let xoff = this.offset; 
    for (let x = 0; x <= width; x += 10) {
      let waveHeight = map(noise(xoff), 0, 1, -this.amplitude, this.amplitude);
      vertex(x, this.yBase + waveHeight);
      xoff += this.frequency;
    }
    endShape();
    this.offset += 0.005; // Smaller increment for smoother animation
  }
}

// Array to store multiple waves
let waves = [];
// Number of waves
let numWaves = 6;




// Fish class to generate fish using Perlin noise and randomness
class Fish {
  constructor() {
    this.x = random(width);
    this.y = random(height / 2, height);
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
  }

  display() {
    this.x += (noise(this.noiseOffsetX + frameCount * 0.01) - 0.5) * 2;
    this.y += (noise(this.noiseOffsetY + frameCount * 0.01) - 0.5) * 2;

    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, waterYStart, height);

    image(fishImg, this.x, this.y, 50, 30);
  }
}

// Array to store multiple fish
let fish = [];
// Number of fish
let numFish = 8;




// Bird class to generate birds using Perlin noise and randomness
class Bird {
  constructor() {
    this.x = random(width);
    this.y = random(height / 4); // Birds in the upper quarter of the canvas
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
  }

  display() {
    this.x += (noise(this.noiseOffsetX + frameCount * 0.01) - 0.5) * 2;
    this.y += (noise(this.noiseOffsetY + frameCount * 0.01) - 0.5) * 2;

    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height / 4);

    image(birdImg, this.x, this.y, 50, 30);
  }
}

// Array to store multiple birds
let birds = [];
// Number of birds
let numBirds = 3;





//FUNCTIONS
//let's load the image from disk
function preload() {
  img = loadImage('/assets/quay.jpg'); //Load the main image
  logoImage = loadImage('assets/Image annotation.png'); //Load the logo image
  fishImg = loadImage('assets/fish.png'); // Load the fish image
  birdImg = loadImage('assets/bird.png');// Load the bird image
} 

function setup() {
  // We will make the canvas the same size as the image using its properties
  let canvasSize = calculateCanvasSize();
  createCanvas(canvasSize.canvasWidth, canvasSize.canvasHeight);

  // Create a graphics buffer to store the background
  canvasImage = createGraphics(canvasSize.canvasWidth, canvasSize.canvasHeight);

  // Let's calculate the aspect ratio of the image - this will never change so we only need to do it once
  img.resize(canvasSize.canvasWidth, canvasSize.canvasHeight);
  imgDrwPrps.aspect = img.width / img.height;
  // Now let's calculate the draw properties of the image using the function we made
  calculateImageDrawProps(canvasSize.canvasWidth, canvasSize.canvasHeight);
  // Fetched colours in photoshop of the image
  palette = [
    '#264653', '#2a9d8f',
    '#e9c46a', '#f4a261',
    '#e76f51', '#ff6f61',
    '#b0824f', '#dd9d51',
    '#58302e', '#ad342e',
    '#f73a28', '#3a669c',
    '#dc7542', '#bd5a42',
    '#d5b171', '#936c4a', 
  ];

  // Calculate the water start position
  waterYStart = height / 2;

  // Initialize fish positions
  for (let i = 0; i < numFish; i++) {
    let fish = createFishInWater();
    fishPositions.push(fish);
  }

  // Initialize wave positions for palette effect
  for (let i = 0; i < numWaves; i++) {
    let yBase = waterYStart + (i * height / (2 * numWaves)) + (height / 6); // Move waves down further
    let amplitude = 10 + i * 5; // Reduce amplitude for less overlapping effect
    let waveColor = color(255, 255, 255, 30); // More transparent color for waves
    let strokeW = 1 + i * 0.5; // Reduce stroke weight
    waves.push(new Wave(amplitude, random(0.05, 0.05), yBase, waveColor, strokeW));
  }

  // Initialize birds
  for (let i = 0; i < numBirds; i++) {
    birds.push(new Bird());
  }

  //Let's add a variable of speed and this technique is from https://www.geeksforgeeks.org/p5-js-framerate-function/
  frameRate(25);
}

function draw() {
  // This technique comes from https://happycoding.io/tutorials/p5js/images/image-palette
  if (y < height) { // If y is less than canvas height
    // brush effect
    for (let x = 0; x < width; x++) { // Loop through each pixel in width
      const imgColor = img.get(floor(x * (img.width / width)), floor(y * (img.height / height))); // Get the color from the image

      if (imgColor === undefined) { // If the color is undefined
        console.log(`Undefined color at (${x}, ${y})`); // Log undefined color
        continue; // Skip to the next iteration
      }

      const paletteColor = getPaletteColor(imgColor); // Get the closest color from the palette

      if (paletteColor === undefined) { // If the palette color is undefined
        console.log(`Undefined palette color for image color: ${imgColor}`); // Log undefined palette color
        continue; // Skip to the next iteration
      }
      // Set brush size and this technique is from https://chatgpt.com/
      let brushSize = (x % 1 === 0) ? 2 : 1;
      let brush = new Brush(brushSize, paletteColor); // Create a new brush instance
      brush.draw(x, y); // Draw using the brush
    }

     // Draw waves only in the sea area with transparent color
     if (y >= waterYStart + height / 4) { // Adjust wave start position
      for (let i = 0; i < waves.length; i++) {
        waves[i].display();
      }
    }

    // Draw birds only in the upper area
    if (y < height / 2) { // Draw birds in the upper half of the canvas
      for (let i = 0; i < birds.length; i++) {
        birds[i].display();
      }
    }

    y++; // Increment y
  } else if (y >= height && !canvasImage) {
    // Save the canvas as an image once the palette drawing is completed
    canvasImage = createGraphics(width, height);
    canvasImage.image(canvas, 0, 0, width, height);
  } else {// Clear birds after the image palette is complete
  birds = [];
}

  // Draw the saved canvas image as background
  if (canvasImage) {
    image(canvasImage, 0, 0);
  }

  // Draw the logo image in the center of the canvas
  let logoAspect = logoWidth / logoHeight; // Calculate logo aspect ratio
  let scaleFactor = 0.6; // Scale factor to resize the logo image and this technique comes from https://www.geeksforgeeks.org/scale-factor/
  // Resize the logo image based on the canvas size
  if (canvasAspectRatio > logoAspect) { // If canvas aspect ratio is greater than logo aspect ratio
    logoHeight = height * scaleFactor;; // Set logo height based on canvas height
    logoWidth = logoHeight * logoAspect; // Calculate logo width based on aspect ratio
  } else { // If canvas aspect ratio is less than or equal to logo aspect ratio
    logoWidth = width * scaleFactor; // Set logo width based on canvas width
    logoHeight = logoWidth / logoAspect; // Calculate logo height based on aspect ratio
  }
  // Draw the image in the centre of the canvas, offsetting the image by half its width and height
  image(logoImage, (width / 2) - (logoWidth / 2), (height / 2) - (logoHeight / 2), logoWidth, logoHeight);

  // Draw fish images with Perlin noise for smooth movement
  if (y >= height) {
    drawFish();
  }

  for (let i = 0; i < waves.length; i++) {
    waves[i].display();
  }
}

function drawFish() {
  // Clear only the area where fish are drawn
  clear();

  // Draw the background as a light blue color
  background(173, 216, 230);

  // Draw the saved canvas image as background
  if (canvasImage) {
    image(canvasImage, 0, 0);
  }
  // Draw the logo image again
  image(logoImage, (width / 2) - (logoWidth / 2), (height / 2) - (logoHeight / 2), logoWidth, logoHeight);
  
  // Draw waves over the entire canvas with background color
  let waveColor = color(173, 216, 230, 50); // Light blue with transparency
  for (let i = 0; i < numWaves; i++) {
    waves[i].display();
  }

  for (let i = 0; i < fishPositions.length; i++) {
    let fish = fishPositions[i];

    fish.x += (noise(fish.noiseOffsetX + frameCount * 0.01) - 0.5) * 1;
    fish.y += (noise(fish.noiseOffsetY + frameCount * 0.01) - 0.5) * 1;

    // Ensure fish stays within water area
    if (fish.y < waterYStart) {
      fish.y = waterYStart + random(0, height - waterYStart);
    }

    fish.x = constrain(fish.x, 0, width);
    fish.y = constrain(fish.y, waterYStart, height);

    fish.noiseOffsetX += 0.01;
    fish.noiseOffsetY += 0.01;
    // Draw fish
    image(fishImg, fish.x, fish.y, 50, 30);
  }
}

// Our function to get the closest color from the palette and this technique comes from https://happycoding.io/tutorials/p5js/images/image-palette
function getPaletteColor(imgColor) {
  // Image processing and pixel manipulation
  // These functions take a color value and return 
  // The intensity of the respective color component as a number between 0 and 255.
  const imgR = red(imgColor);
  const imgG = green(imgColor);
  const imgB = blue(imgColor);

  // When drawing, it will finding the minimum distance on each pixles between the graphical paint been drew.
  // Display Minimum Distance: The minimum distance is displayed on the canvas as infinity.
  let minDistance = Infinity;
  // Variable explaination of the target color
  let targetColor;
  // Loop through the color
  for (const c of palette) {
    const paletteR = red(c);
    const paletteG = green(c);
    const paletteB = blue(c);
    // Exact rgb components
    const colorDistance =
      // Calculate distance between the image color and the palette color
      dist(imgR, imgG, imgB,
           paletteR, paletteG, paletteB);
    // Check and refresh the closest color
    // If the colordistance less than minimumdistance, refresh the target color to the current palette.
    // And refresh the minimumdistance to colordistance.
     if (colorDistance < minDistance) {
      targetColor = c;
      minDistance = colorDistance;
    }
  }

  return targetColor;// Return the closest color
}

function createFishInWater() {
  return {
    x: random(width),
    y: random(height / 2, height), // Ensure fish starts in the water area
    noiseOffsetX: random(1000),
    noiseOffsetY: random(1000)
  };
}

function windowResized() {
  //when drag the window to different size, it will automatically calculate the changes and let the image resize and the window change.
  let canvasSize = calculateCanvasSize();
  resizeCanvas(canvasSize.canvasWidth, canvasSize.canvasHeight);
  calculateImageDrawProps(canvasSize.canvasWidth, canvasSize.canvasHeight);
  y = 0; //Restart palette effect
  canvasImage = null; // Reset the canvas image
   // Recalculate water start position
  waterYStart = height / 2;

  // Reset fish positions
  fishPositions = [];
  for (let i = 0; i < numFish; i++) {
    let fish = createFishInWater();
    fishPositions.push(fish);
  }
  loop(); // Restart the draw loop
}

function calculateCanvasSize() {
   //initiallize canvas dimensions
  let canvasWidth = windowWidth;
  let canvasHeight = windowWidth / aspectRatio; // The desired ratio of the canvas
  if (canvasHeight > windowHeight) { // If the initial"canvasheight is geater than the windowheight
    canvasHeight = windowHeight; // The canvas need to be resized to fit the window
    canvasWidth = windowHeight * aspectRatio; // Calculate canvas width based on aspect ratio
  }

  return { canvasWidth, canvasHeight }; // Return calculated canvas size
}

function calculateImageDrawProps(canvasWidth, canvasHeight) {
  //Calculate the aspect ratio of the canvas
  canvasAspectRatio = canvasWidth / canvasHeight;
  //if the image is wider than the canvas
  if (imgDrwPrps.aspect > canvasAspectRatio) {
    //then we will draw the image to the width of the canvas
    imgDrwPrps.width = canvasWidth;
    //and calculate the height based on the aspect ratio
    imgDrwPrps.height = canvasWidth / imgDrwPrps.aspect;
    imgDrwPrps.yOffset = (canvasHeight - imgDrwPrps.height) / 2;
    imgDrwPrps.xOffset = 0;
  } else if (imgDrwPrps.aspect < canvasAspectRatio) {
    //otherwise we will draw the image to the height of the canvas
    imgDrwPrps.height = canvasHeight;
    //and calculate the width based on the aspect ratio
    imgDrwPrps.width = canvasHeight * imgDrwPrps.aspect;
    imgDrwPrps.xOffset = (canvasWidth - imgDrwPrps.width) / 2;
    imgDrwPrps.yOffset = 0;
  } else {
    imgDrwPrps.width = canvasWidth;
    imgDrwPrps.height = canvasHeight;
    imgDrwPrps.xOffset = 0;
    imgDrwPrps.yOffset = 0;
  }
}

// Create wave objects
for (let i = 0; i < numWaves; i++) {
  let amplitude = random(5, 20);
  let frequency = random(0.01, 0.05);
  let yBase = random(height / 2, height);
  let color = color(173, 216, 230, 100); // Semi-transparent wave color
  let strokeWeight = random(1, 3);
  waves.push(new Wave(amplitude, frequency, yBase, color, strokeWeight));
}