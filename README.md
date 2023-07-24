# Node.js Authentication and Authorization API nodejs-authentication-api

![Project Logo](link_to_logo)

## Description

The Node.js Authentication and Authorization API is a robust system that provides secure user management functionalities for web applications. It offers user registration, login, logout, password reset, and role-based access control to enhance the security and manage user privileges.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Installation

To set up the Node.js Authentication and Authorization API, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/bistaalish/nodejs-authentication-api.git
```
2. Navigate to the project directory:
```bash
cd nodejs-authentication-api
```
3. Install the dependencies:
```bash
npm install
```
4. Configure the environment variables:
## Configure the Environment Variables
This document outlines the environment variables used in the Node.js Authentication API for configuring the server, database, email service, security, and other settings. The `.env` file is used to store these variables, and it should be kept secure and not committed to version control systems.

## Server Configuration:

1. `PORT`: The port on which the Node.js server will listen for incoming HTTP requests. Default is set to 8080.
   - Example: `PORT=8080`

2. `NODE_ENV`: The environment mode in which the server is running. Use "development", "production", or "test" based on the deployment environment.
   - Example: `NODE_ENV=development`

## MongoDB Configuration:

`MONGODB_URI`: The URI to connect to the MongoDB database. Replace the `<username>`, `<password>`, and `<host>` with your MongoDB credentials and host.
   - Example: `MONGODB_URI=mongodb://<username>:<password>@<host>:27017/<database-name>`

 `DB`: The name of the MongoDB database to use for the Node.js Authentication API.
   - Example: `DB=Authentication`

## JWT Secret Key:

 `JWT_SECRET`: The secret key used for signing JSON Web Tokens (JWT) to authenticate users. Replace this with a secure and unique secret key.
   - Example: `JWT_SECRET=mySecretKey123`

## Email Service Configuration:

6. `EMAIL_SERVICE`: The email service provider used to send verification and password reset emails. (e.g., "smtp")
   - Example: `EMAIL_SERVICE=smtp`

7. `EMAIL_HOST`: The host of the email service provider. (e.g., "smtp.mailtrap.io")
   - Example: `EMAIL_HOST=smtp.mailtrap.io`

8. `EMAIL_PORT`: The port number used by the email service provider. (e.g., 2525)
   - Example: `EMAIL_PORT=2525`

9. `EMAIL_USERNAME`: The username or API key required for authenticating with the email service provider.
   - Example: `EMAIL_USERNAME=your-email-username`

10. `EMAIL_PASSWORD`: The password or API key required for authenticating with the email service provider.
    - Example: `EMAIL_PASSWORD=your-email-password`

11. `EMAIL_FROM`: The email address used as the "from" address for sending emails.
    - Example: `EMAIL_FROM=support@example.com`

12. `DOMAIN`: The domain of your application, used for constructing verification and reset password links.
    - Example: `DOMAIN=example.com`

## CORS Configuration:

13. `ALLOWED_ORIGINS`: A comma-separated list of allowed origins for Cross-Origin Resource Sharing (CORS). Specify the domains or URLs from which the frontend can make requests to this API. Note that this is a security feature to prevent unauthorized access to your API.
    - Example: `ALLOWED_ORIGINS=http://example.com,http://localhost:3000`

## Logging Configuration:

14. `LOG_DIR`: The directory where log files will be stored. Specify the path relative to the root of the application. Logs are useful for tracking errors and debugging.
    - Example: `LOG_DIR=./logs`

## Cookies:

15. `COOKIE_SECRET`: A secret key used to sign cookies and prevent tampering. Replace this with a secure and unique secret key.
    - Example: `COOKIE_SECRET=myCookieSecret123`

Please ensure that you replace the placeholder values with your actual credentials and secrets for the environment variables. Keep this file secure and avoid exposing sensitive information. Additionally, you may add other environment variables as needed for your specific project.
To properly configure the environment variables for the Authentication and Authorization System, follow these steps:

1. Locate the `.env.example` file in the root directory of the project.

2. Create a new file named `.env` in the same directory.

3. Open the `.env.example` file and copy its contents.

4. Paste the contents into the newly created `.env` file.

5. Replace the placeholder values with your actual configuration details. Below are some important variables to set:
6. Save the `.env` file with the updated configuration.

## Usage

After configuring the environment variables, you can start using the Authentication and Authorization System API by running the following command:

```bash
npm start
```
## The server will start running at http://localhost:3000

Once the server is running, you can access the API endpoints using HTTP client tools like [cURL](https://curl.se/) or [Postman](https://www.postman.com/). Below are some of the API endpoints you can interact with:

- `POST /users/register`: Register a new user by providing an email and password.
```bash
Data Required:
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "Password!123",
  "phoneNumber": "9807999753",
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-01"
}

```
- `POST /users/login`: Log in with an existing user account using email and password.
```bash
Data Required:
{
    "password": "Password!123",
    "usernameOrEmail" : "john_doe"
}
```
- `GET /users/logout`: Log out the currently logged-in user.
- `POST /users/password-reset`: Request a password reset link by providing the registered email address.
```bash
   {
      email: test@example.com
   }
```
- `GET /users/password-reset/:token`: Verify the password reset token and allow the user to set a new password.
- `GET /users/verify/:token`: Verify Account (Requires Token)
- `GET /users/profile/`: Access the user dashboard (requires authentication).
- `PUT /users/update-profile`: Update the profile (requires Authentication)
```bash
Data
{
    "username": "alis",
        "dateOfBirth": "1990-02-11T00:00:00.000Z",
        "fullName": "Alish Bista",
        "phoneNumber": "9807999753",
        "bio": "Nodejs Developer",
        "email": "bistace321@gmail.com"
}
```
- `PUT /users/profile/change-password`: Change User password (requires Authorization)
```bash
DATA
{
   "currentPassword" : "password321", 
   "newPassword" : "Password!123"
}
```
For detailed information on each endpoint, including request and response examples, refer to the API documentation.

## Documentation

For comprehensive API documentation, please check the project's [wiki](link_to_wiki) or the `docs` folder in the repository. The documentation provides detailed information on each API endpoint, request parameters, response structures, and usage examples.

## Testing

Unit tests and integration tests are available in the `tests` folder. You can run the tests using the following command:

```bash
npm test
```
## Issues and Support

If you encounter any issues, bugs, or have questions about the Authentication and Authorization System API, please open an issue on the GitHub repository. Our team and the community will be happy to assist you.

## Contributing

We welcome contributions from the community. If you'd like to contribute to the project, please follow the guidelines outlined in the CONTRIBUTING.md file.

Before opening a pull request, make sure to run the following commands to ensure your changes pass the tests and adhere to the coding standards:

```bash
npm test
npm run lint
```
## License

This project is licensed under the MIT License.

## Acknowledgments

Special thanks to Author Name and all the contributors who have made this project possible.
About the Author

Include a brief section about the author or maintainers of the project. You can add information about their background, interests, or contact details.
