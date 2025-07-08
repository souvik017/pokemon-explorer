# Pokemon Explorer

Explore the world of Pokemon with this Next.js application! Search, discover, and learn about your favorite Pokemon with a modern and engaging user interface.

## Features and Functionality

*   **Browse a vast Pokedex:** Explore a comprehensive list of Pokemon, fetching data from the PokeAPI.
*   **Lightning-Fast Search:** Quickly find Pokemon by name with a debounced search functionality.
*   **Detailed Pokemon Pages:**  Access individual pages with information about abilities, stats, moves, and more.
*   **Optimized Performance:** Benefit from caching, request deduplication, and batch fetching for a smooth user experience.
*   **Modern UI:**  Enjoy a visually appealing interface with animated backgrounds, glassmorphism effects, and subtle hover animations, built with Tailwind CSS.
*   **Error Handling:**  Graceful handling of API errors and informative error messages.
*   **Infinite Scrolling:**  Dynamically load more Pokemon as you scroll, providing a seamless browsing experience.

## Technology Stack

*   **Next.js:** React framework for building performant and SEO-friendly web applications.
*   **React:** JavaScript library for building user interfaces.
*   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
*   **PokeAPI:**  RESTful API providing Pokemon data.
*   **Axios:**  HTTP client for making API requests.
*   **TypeScript:**  Superset of JavaScript that adds static typing.

## Prerequisites

*   Node.js (version 18 or higher)
*   npm or yarn

## Installation Instructions

1.  Clone the repository:

    ```bash
    git clone https://github.com/souvik017/pokemon-explorer.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd pokemon-explorer
    ```

3.  Install dependencies:

    ```bash
    npm install  # or yarn install
    ```

## Usage Guide

1.  Start the development server:

    ```bash
    npm run dev # or yarn dev
    ```

2.  Open your browser and navigate to `http://localhost:3000`.

3.  Use the search bar to find specific Pokemon.

4.  Scroll down to load more Pokemon.

5.  Click on a Pokemon card to view its detailed information.

## API Documentation

This project utilizes the PokeAPI ([https://pokeapi.co/](https://pokeapi.co/)). The following endpoints are used:

*   `GET /api/v2/pokemon?limit={limit}`: Fetches a list of Pokemon with the specified limit.  Used in `lib/pokemonApi.ts` within the `fetchPokemonList` function.

*   `GET /api/v2/pokemon/{nameOrId}`: Fetches detailed information for a specific Pokemon (by name or ID). Used in `lib/pokemonApi.ts` within the `fetchPokemonDetails` function.

The `lib/pokemonApi.ts` file contains helper functions for interacting with the PokeAPI, including caching mechanisms and error handling.

## Contributing Guidelines

Contributions are welcome! Here's how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix:

    ```bash
    git checkout -b feature/your-feature-name
    ```

3.  Make your changes and commit them with descriptive commit messages.
4.  Push your changes to your forked repository.
5.  Create a pull request to the `main` branch of the original repository.

Please ensure your code adheres to the project's coding style and includes appropriate tests.

## License Information

No license specified.  All rights reserved.

## Contact/Support Information

For questions or support, please contact the repository owner through GitHub.