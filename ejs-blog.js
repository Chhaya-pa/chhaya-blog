const express = require('express');
const ejs = require('ejs');
const request = require('request');
const fs = require('fs');
const lodash = require('lodash');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/blogDB');


const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');

const blogschema = new mongoose.Schema({
    title: String,
    Npost: String
},{collection:"bloglist"});

const blogItem = mongoose.model("bloglist", blogschema);



const defaultHomeData = "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quidem nobis accusamus nesciunt dolores atque, ducimus libero. Error tenetur minus deserunt cumque sint, veritatis iusto vitae dolorum recusandae ratione. Cumque, unde?"

const defaultAboutData = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quaerat esse consequuntur ab corrupti facere dolores possimus? Exercitationem mollitia, animi, odit fugiat quam quisquam repudiandae quibusdam natus officia nostrum reprehenderit? Quam."

const defaultContacttData = "Dolorem neque fugit porro qui id asperiores amet atque. Ut fugiat voluptatum veniam, tenetur, tempora cumque quasi magni ipsa architecto sapiente facilis distinctio ducimus. Animi obcaecati qui provident rem quae."

let quotesoftheday = "";
let posts = [];
let blogData = '';
// sync apna kaam kiye bina dusri process ko run nhi hone deta jbki async krne deta h agr async vali process bdi h toh jbtk dusri process run ho jayegi or async = readFile
if(fs.existsSync('blogs.txt')){
    blogData = fs.readFileSync('blogs.txt','utf-8');
    const blogObject = JSON.parse(blogData);
    posts.push(...blogObject);
}


app.get('/',(req, res)=>{

    request('https://type.fit/api/quotes',(error, response, body)=>{
        if(error)
        {
            return;
        }
        else{
            const quotes = JSON.parse(body);
            const size = quotes.length;
            const RandomNum = Math.trunc(Math.random()*size)+1;
            quotesoftheday = quotes[RandomNum].text;
            // console.log(quotesoftheday);
           
        }
       
    });
    res.render('ejs-blog-home',{homedata:defaultHomeData, quoteday:quotesoftheday, entries:posts});
});

app.get('/about',(req, res)=>{
    res.render('ejs-blog-about',{aboutdata:defaultAboutData, quoteday:quotesoftheday});
});

app.get('/contact',(req, res)=>{
    res.render('ejs-blog-contact',{contactdata:defaultContacttData, quoteday:quotesoftheday});
});

app.get('/edit',(req, res)=>{
    res.render('ejs-blog-edit',{quoteday:quotesoftheday});
});

app.post('/edit',(req, res)=>{
    const locale = {weekday:"long", day:"numeric", month:"long"};
    const today = new Date().toLocaleDateString('en-us',locale)
    const post = {
        date: today,
        title: req.body.titleentry,
        data: req.body.postentry
    }
    posts.unshift(post);

    const string_post = JSON.stringify(posts);
    fs.writeFile('blogs.txt',string_post,(error)=>{
        if(error)
        {
            console.log(error);
        }
    });
    res.redirect('/');
});

app.get('/search/:myblog',(req, res)=>{
    console.log(req.params.myblog);
    const Btitle = req.body.titleentry;
    const BPost = req.body.postentry;
    console.log(Btitle,BPost);
    for (let post of posts)
    {
        if(lodash.lowerCase(req.params.myblog) === lodash.lowerCase(post.title))
        {
            res.render('ejs-blogpost', {singleEntry:post, quoteday:quotesoftheday});
            break;
             
        }

    }

})


app.listen(5000,()=>{
    console.log('started at 5000');
});