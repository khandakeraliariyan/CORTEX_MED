const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);

        console.log("✅ MongoDB Connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

bootstrap();