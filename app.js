// 전역변수를 설정합니다.
global.async = require('async');
// global.database = require('./lib/database');

// 쓸만한 모듈들을 가져와봅시다!
var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser');

/* var notFound = require('./middleware/notFound');
var otherError = require('./middleware/otherError');
var auth = require('./middleware/auth'); */

// Express 생성
var app = express();

// View 엔진으로 ejs 를 씁시다~
app.engine('ejs', require('ejs-mate'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어들을 가져옵시다.
// 쿠키랑 Request Body 를 읽을 모듈들을 가져옵시다.
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(log.request());

/* // 뭐 그리고 쿠키 기반으로 된 인증을 해봅시다!
app.use(auth()); */

app.get('/', function(req, res, next) {
    res.render('index');
});

/*
// 404 오류를 먼저 잡아봅시다!
app.use(notFound());
// 나머지 오류를 잡죠!
app.use(otherError()); */

// 리버싱을 지원하자!
app.enable('trust proxy');

// 기본적인 웹 페이지 title 을 지정하자
app.locals.title = '김케이인포 - kimkei.info';

// 서버를 실행하자~
app.listen(process.env.PORT || 8080, function() {
    console.info("server listening on %d port!", process.env.PORT || 8080);
});
