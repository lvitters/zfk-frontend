# SvelteKit

The ZfK Archive is developed with [SvelteKit](https://svelte.dev/docs/kit/introduction).

## Developing

Once you've cloned the project you can install dependencies with `npm install` (or `pnpm install` or `yarn`) and then start a development server with

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create the production version of the app use

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deployment

The ZfK Archive can be deployed to a server running Node.js via SvelteKit's [node adapter](https://svelte.dev/docs/kit/adapter-node).

It is managed with [PM2](https://codepilotsf.medium.com/running-node-apps-in-production-with-pm2-simplified-c2c19c42ae45)
and deployed via a [reverse proxy](https://ryanschiang.com/how-to-deploy-sveltekit-app-to-nginx-reverse-proxy).

## Filling the database before the build step

The archive serves files from a folder 'db/audio'. If new files are added before the build step, they can be added to the database via "npm populate-database".

If there is no database for whatever reason, it can be created via

```bash
npm run push:db
```

and then filled via

```bash
npm run populate-database
```

The `populate-database` script will fill and sort files into the database according to the file names present in the folder `db/audio`. The scheme is `YYMMDD --- name of the file.mp3`. Make sure to adhere to the spaces as well as the three seperator dashes. To ensure proper file path handling, the file name should have NO special characters. These can be added later through the admin interface.

The database was created using [SQLite and Drizzle ORM](https://omrecipes.dev/blog/sveltekit-crud-sqlite).

Database migration can be done via `npm run generate-migrations:db` and `npm run migrate:db`.

## Adding, editing and deleting files from the database through the admin interface (after building and deploying)

The admin interface can be reached by `https://archiv.zfk-hb.de/admin`.

With the correct password, the login should be valid for an hour.

A new file can be added with the `submit new file` button.
Make sure the file name adheres to the schema mentioned above `YYMMDD --- name of the file.mp3`, contains no special characters and is an MP3.
After choosing the file from your computer, hit the `submit` button. Wait for the file to upload, indicated by your browser tab's loading wheel. There is 2GB limit.

A file can be deleted via the `delete` button.

A file's display name (separate from the file name given to the file BEFORE uploading) can be changed by clicking into the file name field, typing the new name, and hitting enter. Here, special characters can be used.

> Note: Changing the file names in the admin interface will be overridden whenever the `populate-database` script is rerun before the build step, as the script uses the file names from the project's `db/audio` folder as (placeholder) display names.
> A good practice would be to backup the `db/audio` folder and the `sqlite.db` file occasionally, or at least before ever redeploying the site. Whenever redeploying, replace the `db/audio` folder and `sqlite.db` file after populating according to the above steps to retain the changed file names.
