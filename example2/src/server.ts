import { Server } from "http";
import app from "./app";

// server initialization
let server: Server;

async function main() {
    try {
        // server initial port listener
        server = app.listen(5000, () => {
            console.log(5000);
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log({
                status: 500,
                success: false,
                message: "Internal server error",
                errorMessages: {
                    path: "/",
                    message: err.message,
                },
                stack: err.stack,
            });
        } else {
            console.log({
                status: 500,
                success: false,
                message: "Internal server error",
                errorMessages: {
                    path: "/",
                    message: "Main function error",
                },
            });
        }
    }
}

main();

// server unhandled rejection listener
process.on("unhandledRejection", (reason) => {
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

// server uncaught exception listener
process.on("uncaughtException", (err) => {
    process.exit(1);
});
