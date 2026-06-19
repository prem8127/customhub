/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  experimental: {
    devtoolSegmentExplorer: false
  },
  images: {
    remotePatterns: [
      // Allow Cloudinary images
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      // Allow any https image (for admin-uploaded product images)
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
