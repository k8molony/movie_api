### superFlix Movie API

This is a movie API, which contains information about a superhero movie's title, description, series, director, imageURL and whether it is featured or not. For series, the name and a short description about the series are included. For director, his or her name, bio, birth year and death year are included.
It also allows users to register with a username, password and Email address and to log in with username and password. Users can add/delete movies to their favorite movies list. They can also delete their user information.

###### Deployed API on Vercel

[superFlixAPI](https://movie-api-k8molony.vercel.app/)

###### Key Features

- Return a list of ALL movies to the user
- Return data (description, series, director, image URL, whether it’s featured or not) about a single movie by title to the user
- Return data about a series (description) by name/title (e.g., “Thriller”)
- Return data about a director (bio, birth year, death year) by name
- Allow new users to register
- Allow users to update their user info (username, password, email, date of birth)
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie from their list of favorites
- Allow existing users to deregister
- Hash user's password
- Authenticate user by log in
- Authenticate user, when user make requests to API

###### Technical Dependencies

- HTML, ES6, Node.js, Express, MongoDB
- Application is hosted on Vercel and database is hosted on MongoDB Atlas.
