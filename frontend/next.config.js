/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['api.qrserver.com'],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: false,
                has: [
                    {
                        type: 'cookie',
                        key: 'token',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig
