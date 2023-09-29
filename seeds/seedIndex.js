const mongoose = require("mongoose");
const port = 8080;
const Campground = require("../models/campground");
const cities = require("../seeds/cities");
const { places, descriptors } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/yelp-camp");
// Define the API endpoint URL

const db = mongoose.connection;
db.on("error", console.error.bind(console, "console error:"));
db.once("open", () => {
    console.log("Database Connected");
});

// takes an array as an input and returns a random element from that array by generating a random index from that array
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30);

        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/4651015",
            description:
                "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Earum beatae ducimus tempore possimus esse recusandae autem voluptate. Ipsa aspernatur earum soluta quia, quisquam nam placeat animi iste doloribus suscipit sint!",
            price,
        });
        await camp.save();
    }
};

//seeds and after seeding it closes the connection
seedDB().then(() => {
    mongoose.connection.close();
});
