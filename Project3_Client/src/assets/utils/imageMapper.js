// Vite-specific import (works only in Vite projects)
const images = import.meta.glob("../itemImages/*.{png,jpg,jpeg,svg}", { eager: true });

const imageMap = Object.fromEntries(
  Object.entries(images).map(([path, module]) => {
    const name = path.split("/").pop().split(".")[0].toLowerCase();
    return [name, module.default];
  })
);

export function getImageForItem(name) {
  if (!name) {
    // Try build-time images first
    const buildImage = imageMap["pandalogo"];
    if (buildImage) return buildImage;
    // Fallback to runtime asset
    return "/assets/itemImages/pandalogo.png";
  }
  
  // Remove spaces and convert to lowercase for matching
  const key = name.replace(/\s+/g, "").toLowerCase();
  
  // Try static build images first (faster, no network call)
  if (imageMap[key]) {
    return imageMap[key];
  }
  
  // If not found in build, try runtime upload endpoint
  // This allows dynamically uploaded images to be served
  return `/assets/itemImages/${name.replace(/\s+/g, "")}.png`;
}

