const http = require("http");

const mongoose = require("mongoose");

const app = require("./app");

const config = require("./app/config");

const { initializeSocket } = require("./app/socket/socket");

const server = http.createServer(app);

async function bootstrap() {
    try {
        await mongoose.connect(
            config.database_url
        );

        initializeSocket(server);

        console.log("Database Connected");

        server.listen(config.port, () => {
            console.log(
                `Server Running on ${config.port}`
            );
        });
    } catch (error) {
        console.log(error);
    }
}

bootstrap();