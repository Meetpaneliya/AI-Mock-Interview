/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/dashboard',  // Redirect the root URL to '/dashboard'
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
  