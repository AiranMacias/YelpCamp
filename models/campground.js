const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//making a new schema
const campgroundSchema = new Schema({
    title: String,
    // price: String,
    description: String,
    location: String,
    image: String,
    price: Number,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

module.exports = mongoose.model("Campground", campgroundSchema);
