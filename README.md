# Northcoders News API

## Description of Project:

- Backend API built using **Express**, **Node.js**, **PostgreSQL** and **DotEnv**. 

- Tested with **Jest** and **Supertest**.

- Provides multiple endpoints for retrieving, sorting and filtering data queries

- Full list of endpoints available in `endpoints.json`, located in root directory

- **Live Version:** [Hosted on Render](https://nc-news-proj-be-api.onrender.com/api)

---

## Getting Started & Installation

**1. Clone the Repo**

- git clone: [On GitHub](https://github.com/lawaffy/nc-news-proj.git)
- cd: nc-news-proj

**2. Check Requirements**

-Dependency and Version Requirements:
    *node.js:* v23.3.0
    *PostgresSQL:* v17.2
    *Express:* v4.21.2
    *pg-format:* v1.0.4
    *pg (node postgres):* v8.7.3
    *dotenv:* v16.0.0

- `package.json` includes all requirements and scripts

**3. Install Dependencies**

- `run npm install` to locally install dependencies

**4. Set Up and Seed the Database**

- scripts:
    *Set up db:* `npm run setup-dbs` - creates development and test databases
    *Seed db:* `npm run seed` - seeds the development database
    *Tests:* `npm run test` - runs Jest test suites

**5. Setting Up Environment Variables**

- Next, you will need to create two `DotEnv` files to connect to the databases locally. Check the `setup.sql` file for the database name!

1) `.env.test` which contains: PGDATABASE=database_name_test
2) `.env.development` which contains: PGDATABASE=database_name
