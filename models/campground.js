const mongoose = require("mongoose");
const Review = require("./review");
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

// This  middleware function ensures that when a campground is deleted using the 'findOneAndDelete' method,
// it also cleans up associated reviews by removing them from the 'Review' collection based on their IDs.
campgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,
            },
        });
    }
    console.log("Deleted A Campground");
});

module.exports = mongoose.model("Campground", campgroundSchema);
