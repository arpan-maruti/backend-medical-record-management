# Backend Medical Record Management

This project is a backend API for managing medical records. It is built using Node.js, Express, and MongoDB (via Mongoose) and implements user authentication with JWT and role-based access control.

## Features

- **User Management**: Register, login, and manage users.
- **Case Management**: Create, update, and retrieve medical record cases.
- **File Management**: Upload and manage files associated with cases.
- **LOI & Instruction Management**: Manage LOI types and instructions.
- **OTP Verification**: Secure user OTP verification via Twilio.
- **Error Handling**: Centralized error handling using Joi validation.

## Project Structure

```
backend-medical-record-management/
│
├── node_modules/
├── src/
│   ├── config/
│   │   └── passport.js        # Passport JWT configuration
│   ├── controllers/           # Express route controllers (User, Case, File, etc.)
│   ├── middlewares/           # Custom middleware (role check, etc.)
│   ├── models/                # Mongoose models (User, Case, Parameter, etc.)
│   ├── routes/                # API route definitions organized by resource
│   ├── services/              # Business logic for each resource
│   ├── utils/                 # Utility functions (error handling, snake_case conversion, OTP, mailer)
│   ├── app.js                 # Express app configuration (middleware & routes)
│   └── server.js              # Server bootstrap and MongoDB connection
│
├── .env                       # Environment variables
├── .gitignore                 # Files and directories to ignore by Git
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation (this file)
```

## Prerequisites

- **Node.js** v14 or later
- **MongoDB** (local or Atlas)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/backend-medical-record-management.git
   cd backend-medical-record-management
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:4200

   # Twilio credentials
   TWILIO_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_SERVICE_SID=your_twilio_service_sid

   # SendGrid credentials
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_EMAIL=your_verified_sendgrid_email
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_pass
   ```

## Running the Application

Use the following command to run the development server (it uses nodemon for automatic reloads):

```bash
npm run dev
```

The server should start on the port specified in your `.env` file (default is **5000**).

## API Endpoints

- **User Endpoints**
  - `POST /user/register` – Register a new user (requires admin token).
  - `POST /user/login` – Login and receive a JWT token.
  - `GET /user/:id` – Get user by ID.
  - `GET /user` – List all users (requires admin token).
  - `POST /user/set-password` – Set new password.
  - `POST /user/send-otp` – Send OTP for verification.
  - `POST /user/verify-otp` – Verify OTP.

- **Case Endpoints**
  - `POST /case` – Create a new case.
  - `GET /case` – Retrieve cases (supports pagination and sorting).
  - `GET /case/:id` – Retrieve a specific case by ID.
  - `PATCH /case/:id` – Update an existing case.
  - `PATCH /case/delete/:id` – Soft-delete a case.

- **File Endpoints**
  - `POST /file` – Upload a file (handled with Multer).

- **LOI & Instruction Endpoints**
  - `POST /loiType` – Create a new LOI type.
  - `GET /loiType` – Retrieve LOI types.
  - `POST /instruction-types` – Create a new instruction type.
  - `GET /instruction-types/loi/:id` – Retrieve instructions for a particular LOI.

- **Parameter Endpoints**
  - `POST /parameters` – Add new parameter.
  - `GET /parameters/instruction/:id` – Get parameters by instruction ID.

## Module Alias

The project uses module aliasing for cleaner import paths. The following alias mappings are defined in your `package.json` under the `"imports"` field:

- `#middlewares/*` → `./src/middlewares/*`
- `#routes/*` → `./src/routes/*`
- `#models/*` → `./src/models/*`
- `#config/*` → `./src/config/*`
- `#utils/*` → `./src/utils/*`
- `#services/*` → `./src/services/*`
- `#controllers/*` → `./src/controllers/*`

## Environment & Deployment

Ensure that all environment variables are set properly in your deployment environment (e.g., on a production server, configure your environment variables instead of using a `.env` file).

## Contributing

Feel free to open issues or submit pull requests if you have any improvements or bug fixes.

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Passport](http://www.passportjs.org/)
- [Twilio](https://www.twilio.com/)
- [SendGrid](https://sendgrid.com/)

