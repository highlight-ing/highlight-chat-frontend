# Highlight Chat Frontend

This is the frontend interface for Highlight Chat, a UI to talk with LLMs.

## Development

To get started developing Highlight Chat, first run:

```bash
npm install
```

### Setup Environment Variables

Add a `.env.development` file using `.env.sample` as a reference. Note for non Highlight employees, we are working on a solution to use a Supabase anon key for most actions instead of the superuser key. At the moment, it will be difficult to test/work on things until we make this change.

### Running the Development Server

```bash
npm run dev
```

Then, open Highlight, enable Developer Mode in Settings, and click the Local Development app.

### Building Supabase Types

If the database schema in the Highlight Chat Supabase project changes, you can generate the new types by running:

```bash
npm run gen:supabase-types
```

## Deployment

This project is deployed using Vercel on pushes to the main branch.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request. All PRs will be validated by Highlight team members. Please join [our Discord](https://discord.gg/hlai) if you have any questions or need help getting started.

## License

MIT, see [LICENSE.md](LICENSE.md)
