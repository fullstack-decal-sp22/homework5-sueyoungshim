const express = require('express')
const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded())

const mongoose = require('mongoose')

const db = mongoose.connection
const url = "mongodb://127.0.0.1:27017/apod"

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })

const Schema = mongoose.Schema
const apodSchema = Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
}, { collection: 'images' })

const APOD = mongoose.model('APOD', apodSchema)

app.get("/", function (req, res) {
    APOD.find().exec((error, images) => {
        if (error) {
            console.log(error)
            res.send(500)
        } else {
            res.json(images)
        }
    });


});

app.get("/favorite", function (req, res) {
    APOD.find().sort({ 'rating': 'desc' }).exec((error, images) => {
        if (error) {
            console.log(error)
            res.send(500)
        } else {
            res.json({ favorite: images[0] })
        }
    })
});

app.post("/add", function (req, res) {
    const new_image = new APOD({
        new_title: req.body.title,
        new_url: req.body.url,
        new_rating: req.body.rating
    })
    new_image.save((error, doc) => {
        if (error) {
            res.json({ status: "failed-attempt", error: error })
        } else {
            res.json({
                content: req.body,
                status: "image posted succesfully"
            })
        }
    })
});

app.delete("/delete", function (req, res) {
    APOD.findOneAndDelete({ title: req.body.title }, (error) => {
        if (error) {
            res.json({ status: "failed-attempt", error: error })
        } else {
            res.json({ status: "image deleted succesfully", delImage: req.body.title })
        }
    })

});

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})