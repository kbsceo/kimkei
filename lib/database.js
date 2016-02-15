// 외부 모듈들을 가져옵시다
var mongoose = require("mongoose"),
    aI = require('mongoose-auto-increment');

// MongoDB 커넥션을 생성한다. 커넥션 생성(접속) 실패 시 5초 간격으로 재시도
var dbConnect = function() {
    return mongoose.connect(process.env.MONGO_URI, function(err) {
        if (err) {
            log.info('Failed to connect to MongoDB - retrying in 5 sec');
            setTimeout(dbConnect, 5000);
        }
    });
};

var database = dbConnect(); // 커넥션을 가져온다
aI.initialize(database); // 콘텐츠 고유 ID를 Auto Increment로 하도록 한다.

var Schema = mongoose.Schema;

var UserScheme = new Schema({
    userName: {type: String, unique: true, required: true, match: /[A-Za-z0-9\-_.]{4,16}/}, // 사용자 ID (ex. donginl)
    userSecret: {type: String, required: true},

    info: {
        name: {type: String, required: true}, // 사용자 닉네임.
        email: {type: String, unique: true, required: true}, // 사용자 이메일.
        about: String, // 사용자 About (설명 등)
        image: String, // 프로필 이미지. 기본적으로 Facebook에서 받아온 프로필 이미지가 설정된다.
        since: {type: Date, default: Date.now}, // 회원가입일
        last_access_time: {type: Date, default: Date.now} // 최종접속시간
    }
});

var BoardScheme = new Schema({
    boardId: {type: String, required: true},
    boardName: {type: String, required: true}
});

var ReplyScheme = new Schema({
    authorId: String, // 작성자 고유 ID (ex. 55eaebb0cb272811001c0196)
    body: String, // 답글 내용
    publish_date: {type: Date, default: Date.now}
});

var CommentScheme = new Schema({
    authorId: String, // 작성자 고유 ID (ex. 55eaebb0cb272811001c0196)
    body: String, // 댓글 내용
    publish_date: {type: Date, default: Date.now}, // 댓글 작성시간

    replies: [ReplyScheme],
    replies_count: {type: Number, default: 0}
});

var ViewScheme = new Schema({
    viewerId: String, // 조회한 사람 고유 ID (ex. 55eaebb0cb272811001c0196)
    lastTime: {type: Date, default: Date.now} // 조회 시간
});

var PostScheme = new Schema({
    authorId: String, // 작성자 고유 ID (ex. 55eaebb0cb272811001c0196)
    boardId: String, // 게시물이 있는 게시판 ID
    title: {type: String, required: true}, // 콘텐츠 제목
    body: {type: String, required: true}, // 콘텐츠 본문
    publish_date: {type: Date, default: Date.now}, // 콘텐츠 작성시간

    comments: [CommentScheme], // 댓글
    comments_count: {type: Number, default: 0}, // 댓글 갯수

    view: [ViewScheme], // 조회 기록
    view_count: {type: Number, default: 0}, // 조회수

    star: [String], // 별을 준 사람
    star_count: {type: Number, default: 0}, // 별 갯수

    report: [String], // 신고 한 사람
    report_count: {type: Number, default: 0} // 신고 횟수
});

var View = mongoose.model('View', ViewScheme);

/* PostScheme.statics.viewCount = function(user, content, callback) {
    if (!content) {
        var err = new Error('NOT FOUND');
        err.code = 404;
        callback(err);
    } else if(!user && content) {
        callback(null, content);
    } else {
        var view = new View({ viewerId: user._id });
        if (content.view.map(function(e) { return e.viewerId }).indexOf(user._id) != -1 && moment().diff(content.view.map(function(e) { return e.lastTime }), 'hours') < 1) {
            callback(null, content);
        } else {
            content.update({$pull: {view: {viewerId: user._id}}, $push: {view: view}, $inc: {'view_count': 1}}, callback);
        }
    }
}; */

PostScheme.plugin(aI.plugin, 'Post');

database.model('User', UserScheme, 'users');
database.model('Board', BoardScheme, 'board');
database.model('Post', PostScheme, 'posts');
database.model('Comment', CommentScheme);
database.model('Reply', ReplyScheme);

module.exports = database;