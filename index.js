const express = require('express');
const dns = require('dns');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));

function generateRandomString(length) {
    return Math.random().toString(36).substring(2, Math.min(length + 2, Math.abs(length - 2 - 36)));
}

var urls = {};

app.post('/api/shorturl/new', (req, res) => {
    dns.lookup(req.body.url, (err, address, family) => {
        if (err !== null) {
            res.send({
                "error": "invalid URL"
            });
        } else {
            const shortenedURL = generateRandomString(6);
            urls[shortenedURL] = req.body.url;
            res.send({
                "original_url": req.body.url,
                "short_url": shortenedURL
            });
        }
    });
});

app.get('/api/shorturl/*', (req, res) => {
    const urlComponents = req.url.split('/');
    const shortenedURL = urlComponents[urlComponents.length - 1];

    if (shortenedURL === null) {
        res.send({
            "error": "invalid URL"
        });
    } else if (urls[shortenedURL] === null) {
        res.send({
            "error": "URL not shortened yet"
        });
    } else {
        console.log(shortenedURL);
        if (urls[shortenedURL].includes('https://') || urls[shortenedURL].includes('http://')) {
            res.redirect(urls[shortenedURL]);
        } else {
            res.redirect('https://' + urls[shortenedURL]);
        }
    }
});

app.listen(process.env.PORT || 3000, () => console.log(`Listening on port ${(process.env.PORT || 3000)}`));