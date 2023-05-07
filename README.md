# How to use
## Automatic script
If you have Deno installed, you can run `deno install --allow-all -f https://l.cylex.dog/turso-dashboard` to install the `turso-dashboard` command, which will automatically get your Turso token, download, and run the dashboard.
## Manually
1. Create a `.env` file with `NEXT_PUBLIC_TURSO_TOKEN` set to your Turso token. If you don't already have your Turso token, you can get it by running `turso auth token`.
2. Start the application with `npm run build` and then `npm run start`. Navigate to `localhost:3000` to start using it!

# Roadmap
- Statistics from `turso db inspect`
- Improved region selector
- Database shell
- Show database version
- Update database version

# Additional
This project is not created or endorsed by Turso.
