# Project Overview

This is a SvelteKit application for the "ZfK" collective, who are organising underground electronic music events and sometimes exhibitions or concerts. It should serve as an information page about the collective and an archive of both events they are doing and audio recordings of those events.

- **Frontend:** Svelte 5, Tailwind CSS
- **Backend:** Node.js
- **Database:** SQLite with Drizzle ORM
- **Deployment:** PM2 and a reverse proxy

# Development Conventions

- **Code Comments:** Do not start comments with capital letters, except if the first word is a word always written in capital letters.
      <!-- - **Code Formatting:** The project uses Prettier for code formatting. Run `npm run format` to format the code. -->
      <!-- - **Linting:** The project uses ESLint for linting. Run `npm run lint` to check for linting errors. -->
- **Database Schema:** The database schema is managed with Drizzle ORM. Migration files are located in `db/migrations`.
- **Audio Files:** Audio files are stored in the `db/audio` directory. They should follow the naming convention `YYMMDD --- name of the file.mp3`.
- **Admin Interface:** There is an admin interface at `/admin` for managing files after deployment.

## Strict Behavioral Rules

**DO NOT** execute or suggest any `git` commands. This includes `git commit`, `git push`, `git pull`, `git add`, `git branch`, etc. You may only discuss `git` concepts if I ask, but you must not propose running any commands.

**DO NOT** execute or suggest any `npm` or `pnpm` commands. This includes `npm install`, `npm run dev`, `npm run build`, `pnpm install`, etc. You can analyze `package.json` files, but you must not propose to run any scripts or modify dependencies.

**DO NOT** start code comments with capital letters, unless the respective word is always capitalized.

**DO NOT** reverse small changes that the user has made, like changing for example a padding, text size or code comment.
