/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add this line here:
    transpilePackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
    
    // ... any other existing settings you have, like images or redirects
  };
  
  module.exports = nextConfig;