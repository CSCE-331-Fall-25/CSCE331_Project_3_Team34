// Vite-specific import (works only in Vite projects)
const images = import.meta.glob("../itemImages/*.{png,jpg,jpeg,svg}", { eager: true });

const imageMap = Object.fromEntries(
  Object.entries(images).map(([path, module]) => {
    const name = path.split("/").pop().split(".")[0].toLowerCase();
    return [name, module.default];
  })
);

export function getImageForItem(name) {
  if (!name) return imageMap["pandalogo"] || "";
  // Remove spaces and convert to lowercase for matching
  const key = name.replace(/\s+/g, "").toLowerCase();
  // Try exact match first, then try as fallback
  //return imageMap[key] || imageMap["pandalogotrans"] || "";
  return imageMap[key];
}
