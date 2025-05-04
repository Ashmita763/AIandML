export const getImageUrl = (imagePath) => {
  // If no image path provided, return default placeholder
  if (!imagePath) {
    return "/images/default-product.png";
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  try {
    // Clean the path by removing any duplicate 'uploads' and extra slashes
    const cleanPath = imagePath
      .replace(/^uploads\/?/, '')  // Remove leading uploads/
      .replace(/^products\/?/, '') // Remove leading products/
      .replace(/^\/+/, '')        // Remove leading slashes
      .replace(/\/+/g, '/');      // Replace multiple slashes with single slash

    return `${import.meta.env.VITE_API_URL}/uploads/products/${cleanPath}`;
  } catch (error) {
    console.error('Error formatting image URL:', error);
    return "/images/default-product.png";
  }
}; 