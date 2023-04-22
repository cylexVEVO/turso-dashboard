# How to use
1. Create a `.env` file with `NEXT_PUBLIC_TURSO_TOKEN` set to your Turso token. If you don't already have your Turso token, you can get it by running `turso auth token`.
1. Start the proxy by running `node proxy.js`, this is required to get around CORS restrictions.
2. Start the application with `npm run dev`, and navigate to `localhost:3000` to start using it!

# Roadmap
- Individual instance creation and deletion
- Improved deletion flows (confirmation, loading indicators)

# Additional
This project is not created or endorsed by Turso.
