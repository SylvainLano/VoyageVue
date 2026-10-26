// URL slug of a country or location name: lowercase, accents removed, spaces turned into dashes
// e.g. "Vík í Mýrdal" -> "vik-i-myrdal", "South Africa" -> "south-africa"
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Path of a destination page, relative to the site root, e.g. "/poland/krakow"
// Used by the router, the share links and the sitemap, so they always agree
export function destinationPath(destination) {
  return `/${slugify(destination.country)}/${slugify(destination.location)}`;
}
