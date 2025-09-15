# Blogsite

A simple blog application built with Next.js, React, Prisma, and TailwindCSS.

## Getting Started

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd blogsite
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with your database connection string:

```
DATABASE_URL="your_database_connection_string"
```

### 4. Set Up the Database

Push the Prisma schema to your database:

```sh
npx prisma push
```

### 5. Run the Development Server

```sh
npm run dev
```





Authentication: The clear next step is to replace the mock user IDs with a real authentication system like NextAuth.js. The authorId or userId in requests would come from the user's session, not the request body.

Server Actions: While we've built a RESTful API, you can also create Server Actions for form submissions on the frontend (e.g., a <form action={createPostAction}>) for a more integrated Next.js experience.

Pagination: For the feed and comment threads, you'll want to implement proper cursor-based pagination instead of a simple take: 20.

Frontend: Build the React components in the src/app/ directory to consume these APIs and Server Actions.