export const slugify = async (base: string) => {
    return base
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");
  };