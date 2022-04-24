import express, { json ,Express } from "express";
import cors from "cors";

const app: Express = express();

app.use(json());
app.use(cors());

app.listen(5000, () => {
    console.log('⚡️ O servidor está escutando em https://localhost:5000');
});


//Classes
class User {
    constructor(public username: string, public avatar: string) {

    }
}

class Tweet {
    constructor(public username: string, public tweet: string) {

    }
}

const users: Array<User> = [];
const tweets: Array<Tweet> = [];

//Routes

app.post('/sign-up',(req, res) => {
    const user: User = req.body;
    if(hasEmptyField(user) || wrongUserFormat(user)) {
        res.status(400).send('Todos os campos são obrigatórios');
    } else {
        users.push(user);
        res.status(201).send('OK');
    }
});

app.post('/tweets', (req,res) => {
    const username = req.headers['user'];
    if (typeof username === 'string') {
        const tweet: Tweet = {
            username,
            tweet: req.body.tweet
        };
        if (hasEmptyField(tweet) || wrongTweetFormat(tweet)) {
            res.status(400).send('Todos os campos são obrigatórios');
        } else {
            tweets.push(tweet);
            res.status(201).send('OK');
        }
    } else {
        res.status(400).send('Todos os campos são obrigatórios');
    }
});

app.get('/tweets', (req,res) => {
    const page = req.query.page;
    if (typeof page === 'string') {
        try {
            const pageNumber = parseInt(page);
            if(pageNumber < 1) {
                res.status(400).send('Informe uma página válida!');
            } else {
                const start = (
                    tweets.length-1 - 10*pageNumber < 0 
                    ? 0 
                    : tweets.length-1 - 10*pageNumber
                );
                const end = (
                    start+10 > tweets.length
                    ? tweets.length
                    : start+10
                );
                const joinedTweets = innerJoin(tweets.slice(start, end), users);
                res.send(joinedTweets);
            }
        } catch (error) {
            res.status(400).send('Informe uma página válida!');
        }
    } else if (typeof page === 'undefined') {
        const start = (
            tweets.length-1-10 < 0
            ? 0
            : tweets.length-1-10
        );
        const joinedTweets = innerJoin(tweets.slice(start), users);
        res.send(joinedTweets);
    } else {
        res.status(400).send('Informe uma página válida!');
    }
});

app.get('/tweets/:username', (req, res) => {
    const usrnm = req.params.username;
    const twts = tweets.filter(tweet => tweet.username === usrnm);
    const joinedTweets = innerJoin(twts, users);
    res.send(joinedTweets);
});

//Utils

const innerJoin = (twts: Array<Tweet>, usrs: Array<User>) => {
    return twts.map((tweet) => {
        const user = usrs.find(user => user.username === tweet.username);
        const message = tweet.tweet;
        if(user) {
            const {username, avatar} = user;
            return({
                username,
                avatar,
                tweet: message
            });
        } else {
            return ({
                username: tweet.username,
                avatar: 'missing avatar',
                tweet: message
            });
        }
    });
}

//Validações
const hasEmptyField = (obj: any) => {
    for (const attr in obj){
        if(!obj[attr]) {
            return true;
        }
    }
    return false;
}

const wrongUserFormat = (obj: any) => {
    return !(obj.hasOwnProperty('username') && obj.hasOwnProperty('avatar'));
}

const wrongTweetFormat = (obj: any) => {
    return !(obj.hasOwnProperty('username') && obj.hasOwnProperty('tweet'));
}