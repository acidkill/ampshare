# AmpShare Installation Guide (Docker Compose)

This guide provides instructions on how to set up and run the AmpShare application using Docker Compose.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
*   **Docker Compose**: Docker Compose is included with Docker Desktop for Windows and macOS. For Linux, you might need to install it separately. [Install Docker Compose](https://docs.docker.com/compose/install/)

## 1. Get the Code

Clone the AmpShare repository to your local machine:

```bash
git clone <repository_url>
cd ampshare
```

Replace `<repository_url>` with the actual URL of the AmpShare Git repository.

## 2. Environment Configuration

The application uses environment variables defined in the `docker-compose.yml` file. For production deployments, it is crucial to review and update these, especially sensitive values like secrets.

Key environment variables in `docker-compose.yml`:

*   `NODE_ENV`: Set to `production` for optimized builds and runtime.
*   `DATABASE_PATH`: Specifies the path within the container for the SQLite database file. Defaults to `/app/data/ampshare.db`. Data is persisted via a Docker volume.
*   `JWT_SECRET`: **CRITICAL SECURITY VARIABLE.** This is used to sign JSON Web Tokens for authentication. **You MUST change this to a long, random, and unique string for any production or publicly accessible deployment.** A good way to generate one is using a command like `openssl rand -hex 32`.
*   `NEXTAUTH_URL`: The canonical URL of your NextAuth application. Defaults to `http://localhost:3000` inside the container network, but for browser access, it will correspond to the host port you map (e.g., `http://localhost:3917` if using the default compose port).
*   `NEXTAUTH_SECRET`: **CRITICAL SECURITY VARIABLE.** A secret used to encrypt NextAuth.js JWTs and other sensitive information. **You MUST change this to a long, random, and unique string.**
*   `NEXTAUTH_CREDENTIALS_PROVIDER_EMAIL` & `NEXTAUTH_CREDENTIALS_PASSWORD`: Credentials for a default administrative/test user if using a credentials provider with NextAuth. **Change these for production.**
*   `DEBUG`: Enables or disables debug logging. Set to `true` by default in the provided `docker-compose.yml`. Consider setting to `false` in production.

**Note on `.env` files:** While the provided `docker-compose.yml` directly lists environment variables, for more complex setups or to avoid committing secrets, you can use an `.env` file in the project root. Docker Compose automatically loads variables from a file named `.env`. For example:

```env
# .env (example - do not commit this file with actual secrets)
JWT_SECRET=your_super_secure_jwt_secret_from_env_file
NEXTAUTH_SECRET=your_super_secure_nextauth_secret_from_env_file
# ... other variables
```
If using an `.env` file, you might remove or comment out the direct `environment` entries in `docker-compose.yml` for those variables.

## 3. Build and Run the Application

Navigate to the root directory of the cloned project (where `docker-compose.yml` is located) and run the following command:

```bash
docker-compose up --build -d
```

*   `--build`: Forces Docker Compose to build the images before starting the containers. This is useful if you've made changes to the `Dockerfile` or application code.
*   `-d`: Runs the containers in detached mode (in the background).

The first time you run this command, Docker Compose will download the necessary base images and build your application image, which might take a few minutes. Subsequent starts will be much faster.

## 4. Access the Application

Once the containers are up and running, you can access the AmpShare application in your web browser.

By default, the `docker-compose.yml` maps port `3917` on your host machine to port `3000` inside the container. So, you should be able to access the application at:

[http://localhost:3917](http://localhost:3917)

## 5. View Logs

To view the logs from the running application container:

```bash
docker-compose logs -f app
```

*   `-f`: Follows the log output.
*   `app`: The name of the service defined in `docker-compose.yml`.

Press `Ctrl+C` to stop following the logs.

## 6. Stop the Application

To stop the AmpShare application and its containers:

```bash
docker-compose down
```

This command stops and removes the containers. If you want to stop without removing, you can use `docker-compose stop`.

## 7. Data Persistence

The application uses an SQLite database. The database file (`ampshare.db`) is stored in the `/app/data` directory inside the container.

The `docker-compose.yml` file defines a Docker volume named `app_data` and mounts it to `/app/data`. This means your database will persist even if you stop and remove the containers (using `docker-compose down`). When you next run `docker-compose up`, the existing data will be available.

If you wish to remove the persisted data (e.g., to start fresh), you can remove the Docker volume:

```bash
docker-compose down # Ensure containers are stopped
docker volume rm ampshare_app_data # The volume name might be prefixed with the project directory name
```
(Use `docker volume ls` to list volumes and find the exact name if unsure.)

## 8. Troubleshooting

*   **Port Conflicts**: If port `3917` (or any other port defined in `docker-compose.yml`) is already in use on your host machine, Docker Compose will fail to start. You can change the host port in the `ports` section of `docker-compose.yml`. For example, to use port `4000` on the host:
    ```yaml
    services:
      app:
        ports:
          - "4000:3000" # Host port 4000 maps to container port 3000
    ```
*   **Build Issues**: If the build fails, check the output for error messages. Common issues include problems with `npm install` (network issues, incompatible dependencies) or build errors in the Next.js application. Ensure your `package.json` and `Dockerfile` are correct.
*   **Permissions**: The `Dockerfile` is configured to create a non-root user and attempts to set correct permissions for the `/app/data` directory. If you encounter permission errors related to this directory, ensure the volume mount and Dockerfile instructions are correctly applied.
*   **Environment Variables**: Incorrect or missing environment variables (especially secrets) can lead to application errors. Double-check your `docker-compose.yml` or `.env` file.
*   **Database Initialization**: The application is designed to initialize the database schema on startup if the tables don't exist. If you encounter issues related to the database, check the container logs for messages from `src/lib/db.ts` regarding database connection and schema initialization.

---

This concludes the installation guide for AmpShare using Docker Compose.
