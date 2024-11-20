# PageTurner Backend


## Description

PageTurner Backend is the server-side component of the PageTurner online bookstore application. It provides a RESTful API for managing books, user authentication, and order processing.


### Built With

* [![Node.js][Node.js]][Node-url]
* [![Express][Express.js]][Express-url]
* [![MongoDB][MongoDB]][MongoDB-url]
* [![Mongoose][Mongoose.js]][Mongoose-url]

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

git clone 


2. Navigate to the project directory:

cd pageturner-backend


3. Install dependencies:

npm i


4. Create a `.env` file in the root directory and add your environment variables:

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


## Usage

To start the server, run:
 
npm run dev


The server will start on `http://localhost:5000` by default.

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register a new user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/books | Get all books | Public |
| POST | /api/books | Add a new book | Admin |
| GET | /api/books/:id | Get a specific book | Public |
| PUT | /api/books/:id | Update a book | Admin |
| DELETE | /api/books/:id | Delete a book | Admin |
| POST | /api/orders | Create a new order | Authenticated |
| GET | /api/orders | Get all orders | Admin |
| GET | /api/orders/myorders | Get user's orders | Authenticated |

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Zena Nazim - [zena.nazim@gmail.com](mailto:your-email@example.com)

Project Link: https://github.com/zena-art/pageturner-backend

## Acknowledgments

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/)