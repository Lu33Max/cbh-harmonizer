# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.


## List of used Libraries

**State Management and Data Fetching:**

- `@hookstate/core` (v4.0.1) - MIT license
  Summary: A library for managing state in React applications using hooks.

- `@tanstack/react-query` (v4.28.0) - MIT license
  Summary: A React library for managing remote data fetching and caching.

- `@trpc/client` (v10.18.0) - MIT license
  Summary: A TypeScript-based RPC (Remote Procedure Call) library for client-side applications.

- `@trpc/next` (v10.18.0) - MIT license
  Summary: Next.js integration for the trpc library.

- `@trpc/react-query` (v10.18.0) - MIT license
  Summary: React Query integration for the trpc library.

- `@trpc/server` (v10.18.0) - MIT license
  Summary: Server-side integration for the trpc library.


**Authentication:**

- `@next-auth/prisma-adapter` (v1.0.5) - MIT license
  Summary: A Prisma adapter for NextAuth.js authentication library.

- `next-auth` (v4.21.0) - MIT license
  Summary: An authentication library for Next.js applications.


**UI Components and Styling:**

- `@nextui-org/react` (v1.0.0-beta.12) - MIT license
  Summary: A set of UI components for building modern React applications.

- `react-bootstrap` (v2.7.4) - MIT license
  Summary: A popular UI library for React applications that implements Bootstrap components.

- `react-dnd` (v16.0.1) - MIT license
  Summary: A set of React utilities for building drag-and-drop interfaces.

- `react-dnd-html5-backend` (v16.0.1) - MIT license
  Summary: An HTML5 backend for the React DnD library.

- `react-icons` (v4.9.0) - MIT license
  Summary: A collection of SVG icons for React applications.

- `react-slick` (v0.29.0) - MIT license
  Summary: A carousel component for React applications.


**Database and ORM:**

- `@prisma/client` (v4.11.0) - Apache-2.0 license
  Summary: Prisma client library for database access and manipulation.


**Data Processing and Serialization:**

- `crypto-js` (v4.1.1) - MIT license
  Summary: A JavaScript library for cryptographic functions.

- `exceljs` (v4.3.0) - Apache-2.0 license
  Summary: A library for creating and manipulating Excel files.

- `superjson` (v1.12.2) - MIT license
  Summary: A JSON serializer and deserializer for JavaScript.


**Front-End Framework and DOM Rendering:**

- `next` (v13.4.4) - MIT license
  Summary: The Next.js framework for building React applications.

- `react` (v18.2.0) - MIT license
  Summary: The React JavaScript library for building user interfaces.

- `react-dom` (v18.2.0) - MIT license
  Summary: The React DOM package for rendering React components.


**Utility and Miscellaneous:**

- `cuid` (v3.0.0) - MIT license
  Summary: A library for generating unique identifiers.

- `zod` (v3.21.4) - MIT license
  Summary: A TypeScript-first schema validation library.


**TypeScript and ESLint:**

- `@types/eslint` (v8.21.3) - MIT license

- `@types/node` (v18.15.5) - MIT license

- `@types/prettier` (v2.7.2) - MIT license

- `@types/react` (v18.0.28) - MIT license

- `@types/react-dom` (v18.0.11) - MIT license

- `@types/react-slick` (v0.23.10) - MIT license

- `@typescript-eslint/eslint-plugin` (v5.56.0) - MIT license

- `@typescript-eslint/parser` (v5.56.0) - MIT license


**Code Formatting and Linting:**

- `autoprefixer` (v10.4.14) - MIT license

- `eslint` (v8.36.0) - MIT license

- `eslint-config-next` (v13.2.4) - MIT license

- `postcss` (v8.4.21) - MIT license

- `prettier` (v2.8.6) - MIT license

- `prettier-plugin-tailwindcss` (v0.2.6) - MIT license


## Installation Guide

1. Clone the Git repository: Open your command-line interface (e.g., Terminal) and navigate to the directory where you want to download the project. Then, run the following command to clone the repository:

```
git clone <repository-url>
```


2. Navigate to the project directory: Once the repository is cloned, navigate to the project directory using the following command:

```
cd <project-directory>
```


3. Install Node.js: Ensure that you have Node.js installed on your machine. If you haven't installed it already, follow these steps:

    1. Visit the official Node.js website [https://nodejs.org](https://nodejs.org) in your web browser.
    2. Download the appropriate version of Node.js for your operating system (e.g., Windows, macOS, Linux).
    3. Run the installer and follow the on-screen instructions to complete the installation.

4. Install SQLite:

- Windows:
  - Visit the SQLite download page [https://www.sqlite.org/download.html](https://www.sqlite.org/download.html) in your web browser.
  - Under the "Precompiled Binaries for Windows" section, download the appropriate "Precompiled Binaries for Windows" package based on your system architecture (32-bit or 64-bit).
  - Extract the downloaded package to a directory of your choice.
  - Add the directory containing the extracted files to your system's PATH environment variable. This allows you to access the `sqlite3` command from anywhere in the command-line interface.

- Linux:
  - Open your terminal and run the following command to install SQLite:
    ```
    sudo apt-get update
    sudo apt-get install sqlite3
    ```

5. Install project dependencies: Run the following command to install the project dependencies specified in the `package.json` file:
```
npm install
```
This command will download and install all the required libraries and dependencies mentioned in the `package.json` file.

6. Configure environment variables: If your project requires any environment variables (such as API keys or database credentials), make sure to set them up in the `.env` file.

7. Start the project: Once the dependencies are installed, start the project using the appropriate command.

```
npm run dev
```

8. Access the project: After starting the project, open your web browser and navigate to the URL provided by the project, which is [http://localhost:3000].


## File Overview

In the folder "Prisma," you will find the `schema.prisma` file. This file defines the various schemes for the database.

The "Public" folder contains all the images and icons used on the Harmonizer website.

The "src" folder contains the complete code of the project. The contents of the "database," "mappings," and "validation" folders and their contents are self-explanatory. The "components" folder contains the various frontend parts of the website. The different sections of the Website can be found in the "pages" folder. The "auth" subfolder within it contains the authentication functionality. The "tables" folder is responsible for displaying the tables. The next major folder named "server" contains the backend code. The "routers" folder houses the various API interfaces. Additionally, routes for API queries are also defined.

