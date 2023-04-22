# How to use
1. Create a `.env` file with `NEXT_PUBLIC_TURSO_TOKEN` set to your Turso token. If you don't already have your Turso token, you can get it by running `turso auth token`.
1. Start the proxy by running `node proxy.js`, this is required to get around CORS restrictions.
2. Start the application with `npm run dev`, and navigate to `localhost:3000` to start using it!

# Additional
This project is not created or endorsed by Turso. If the creators of Turso would like me to take it down for some reason, please contact me on Discord (I'm in the Discord server).

This project is also in its early stages and currently only supports read operations. Creation and deletion operations will be implemented some time in the future.