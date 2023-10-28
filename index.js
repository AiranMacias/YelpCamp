const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const port = 8080;
const catchAsync = require("./utils/catchAsync");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressErrors = require("./utils/ExpressErrors");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const Review = require("./models/review.js");
const Campground = require("./models/campground");

//connects to mogodb
mongoose.connect("mongodb://localhost:27017/yelp-camp");

//logs successfull connection and logs error if occurs
const db = mongoose.connection;
db.on("error", console.error.bind(console, "console error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.engine("ejs", engine);
//setting up the view engine/templating
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//backend validation of campgroundmaking
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressErrors(msg, 400);
    } else {
        next();
    }
};

//backend validation of reviews
const validateReviews = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressErrors(msg, 400);
    } else {
        next();
    }
};

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/campgrounds", async (req, res) => {
    const campground = await Campground.find({});
    res.render("campgrounds/index", { campground });
});

//render the make a new CG form
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

//post it on the database
app.post(
    "/campgrounds",
    validateCampground,
    catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

//render the edit for
app.get(
    "/campgrounds/:id/edit",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", { campground });
    })
);

//update the objext
app.put(
    "/campgrounds/:id",
    validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        res.redirect(`${campground._id}`);
    })
);

//route for deleting the campground
app.delete(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campgroundDelete = await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");
    })
);

// adding reviews
app.post(
    "/campgrounds/:id/reviews",
    validateReviews,
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

//deleting reviews// In Express.js, req.params is an object that contains route parameters. //the order of the router id determines the req.params
app.delete(
    "/campgrounds/:id/reviews/:reviewId",
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${id}`);
    })
);

app.get(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate("reviews");
        res.render("campgrounds/show", { campground });
    })
);

//catchall for errors
app.all("*", (req, res, next) => {
    next(new ExpressErrors("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render("error", { err });
    console.log(err.message);
});

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
    console.log(`mongoose version ${mongoose.version}`);
});
