const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')  // replace all non-alphanumerics with dashes
    .replace(/^-+|-+$/g, '');     // remove starting/ending dashes

export default slugify; 