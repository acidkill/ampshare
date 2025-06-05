# AmpShare

AmpShare is a Next.js application for managing appliance schedules.

## Running with Docker

This application can be built and run using Docker and Docker Compose.

### Prerequisites

*   Docker installed (https://docs.docker.com/get-docker/)
*   Docker Compose installed (usually comes with Docker Desktop, or see https://docs.docker.com/compose/install/)

### Building and Running

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd ampcshare
    ```

2.  **Build and run the application using Docker Compose**:
    From the project root directory (where `docker-compose.yml` is located), run:
    ```bash
    docker-compose up --build -d
    ```
    *   `--build`: Forces Docker to rebuild the image if there are changes to the `Dockerfile` or application source code.
    *   `-d`: Runs the containers in detached mode (in the background).

3.  **Accessing the application**:
    Once the containers are up and running, the application will be accessible at:
    [http://localhost:3917](http://localhost:3917)
    (The port `3917` is mapped to the container's port `3000` as defined in `docker-compose.yml`.)

### Stopping the application

To stop the Docker Compose services, run the following command from the project root:

```bash
docker-compose down
```

This will stop and remove the containers defined in `docker-compose.yml`.

## Development

For local development without Docker, refer to the scripts in `package.json` (e.g., `npm run dev`).
Make sure to check `CLAUDE.md` for common commands and project structure.
