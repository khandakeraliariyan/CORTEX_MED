const mongoose = require("mongoose");

const app = require("./app");

const config = require("./app/config");

async function bootstrap() {
    try {
        await mongoose.connect(config.database_url);

        console.log("✅ Database Connected");

        app.listen(config.port, () => {
            console.log(`🚀 Server Running on ${config.port}`);
        });
    } catch (error) {
        console.log(error);
    }
}

bootstrap();