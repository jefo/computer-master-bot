# Project: Computer Master Bot

## Project Overview

This is a TypeScript monorepo for a "Computer Master Bot". The project is built using the [SotaJS framework](https://github.com/jefo/sotajs), which is a lightweight framework for building applications with a focus on clean architecture, domain-driven design, and testability.

The project is structured as a monorepo with the following packages:

*   `packages/booking`: The core of the application, responsible for managing appointments. It contains the domain logic, application use cases, and infrastructure adapters for the booking context.
*   `packages/telegram-client`: A client for interacting with the Telegram Bot API.

The `booking` package is built with in-memory adapters for data persistence, which means that data is not saved to a database. The output adapters are also simple, logging to the console. This suggests that the project is still in development.

## Building and Running

There are no explicit build or run scripts in `package.json`. However, the project can be run using `bun`.

To run the end-to-end booking demo, use the following command:

```bash
bun run packages/booking/e2e-booking-demo.ts
```

This will execute the demo script, which demonstrates the booking functionality by creating sample time slots, scheduling an appointment, and then canceling it.

## Development Conventions

The project follows the conventions of the SotaJS framework, which include:

*   **Hexagonal Architecture:** The application is structured with a clear separation between the core domain logic and the outer infrastructure layers.
*   **Domain-Driven Design (DDD):** The project uses concepts from DDD, such as aggregates, entities, and value objects, to model the business domain.
*   **Ports and Adapters:** The application uses ports to define abstract interfaces for external dependencies, and adapters to provide concrete implementations of those interfaces.
*   **Use Cases:** The application's functionality is exposed through use cases, which are the entry points to the business logic.
*   **Output Ports:** Use cases do not return data directly. Instead, they use output ports to communicate the results of their operations.
*   **Dependency Injection:** The project uses a simple dependency injection mechanism to wire together the different components of the application.
*   **In-memory Adapters:** The project uses in-memory adapters for data persistence and output, which is useful for testing and development.
