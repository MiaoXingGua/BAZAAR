// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:

var array = ["a1","a2","3"];



AV.Cloud.define("hello", function(request, response) {

  response.success("Hello world!");

    for (var i in array)
    {
        console.log(array[i]);
    }

//    var now = new Date();
//    var nowStr = now.format("yyyy-MM-dd hh:mm:ss");
////使用方法2:
//    var testDate = new Date();
//    var testStr = testDate.format("YYYY年MM月dd日hh小时mm分ss秒");
//    alert(testStr);
////示例：
//    alert(new Date().Format("yyyy年MM月dd日"));
//    alert(new Date().Format("MM/dd/yyyy"));
//    alert(new Date().Format("yyyyMMdd"));
//    alert(new Date().Format("yyyy-MM-dd hh:mm:ss"));



    var myDate = new Date();
//    myDate = formatDate("2014-1-18 20:30:00");
    var push = AV.Push.send({
        channels: [ "Public" ],
//        push_time: "2014-01-08T20:30:00Z",
        data: {
            message: "测试测试测试"
        }
    });
    console.dir(push);
});

AV.Cloud.define("test", function(request, response) {

    console.log('test');
    var test = request.params.test;
    response.success(test+"Hello world!");
});


var User = AV.Object.extend('_User');
var Installation = AV.Object.extend('_Installation');
var Message = AV.Object.extend('Message');
var Schedule = AV.Object.extend('Schedule');
var Follow = AV.Object.extend('Follow');
var Friend = AV.Object.extend('Friend');

var Brand = AV.Object.extend('Brand');
var WeatherType = AV.Object.extend('WeatherType');
var Comment = AV.Object.extend('Comment');
var Content = AV.Object.extend('Content');
var Photo = AV.Object.extend('Photo');
var Temperature = AV.Object.extend('Temperature');

var parseString = require('xml2js').parseString;
var parse = require('xml2js').Parser();

function _checkLogin(request, response){

    if (!request.user)
    {
        response.error('请先登录');
    }
}

/****************
 通用函数
 *****************/
function _includeKeyWithPhoto(photoQuery){
    photoQuery.include('content');
    photoQuery.include('brand');
    photoQuery.include('temperature');
    photoQuery.include('user');
}

function _includeKeyWithComment(commentQuery){

        commentQuery.include("user");
        commentQuery.include("content");
        commentQuery.include("photo");
}

/****************
 用户资料
 *****************/

//更新用户资料
AV.Cloud.define("update_user_info", function(request, response) {

    _checkLogin(request, response);

    var headViewURL = request.params.headViewURL;
    var backgroundViewURL = request.params.backgroundViewURL;
    var nickname = request.params.nickname;
    var gender = request.params.gender;
    var city = request.params.city;

    var user = request.user;
    if (headViewURL)
    {
        user.set('largeHeadViewURL',headViewURL);
        user.set('smallHeadViewURL',headViewURL+'?imageMogr/auto-orient/thumbnail/100x100');
    }

    if (backgroundViewURL)
    {
        user.set('backgroundViewURL',backgroundViewURL);
    }

    if (nickname)
    {
        user.set('nickname',nickname);
    }

    user.set('gender',gender);

    if (city)
    {
        user.set('city',city);
    }

    user.save().then(function(user) {

        response.success(user);

    }, function(error) {

        response.error(error);

    });
});

/**************
 用户资料
 ***************/

//关注
AV.Cloud.define("add_friend", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    var friend = request.params.friend;

    user.relation('friends').add(friend);
    user.save().then(function(user) {

        friend.relation('follow').add(user);
        friend.save().then(function(user) {

            response.success(user);

        }, function(error) {

            response.error(error);

        });

    }, function(error) {

        response.error(error);

    });

});

//解除关注
AV.Cloud.define("remove_friend", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    var friend = request.params.friend;

    user.relation('friends').remove(friend);
    user.save().then(function(user) {

        friend.relation('follow').remove(user);
        friend.save().then(function(user) {

            response.success(user);

        }, function(error) {

            response.error(error);

        });

    }, function(error) {

        response.error(error);

    });

});

//关注人
AV.Cloud.define("get_friend_list", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    user.relation('friends').query().find().then(function(friends) {

        response.success(friends);

    }, function(error) {

        response.error(error);

    });

});

//关注人数
AV.Cloud.define("get_friend_count", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    user.relation('friends').query().count().then(function(count) {

        response.success(count);

    }, function(error) {

        response.error(error);

    });
});

//粉丝
AV.Cloud.define("get_follow_list", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    user.relation('follows').query().find().then(function(follows) {

        response.success(follows);

    }, function(error) {

        response.error(error);

    });
});

//粉丝数
AV.Cloud.define("get_follow_count", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    user.relation('follows').count().then(function(count) {

        response.success(count);

    }, function(error) {

        response.error(error);

    });
});

/**************
 用户消息
 ***************/

//发消息
AV.Cloud.define("post_message", function(request, response){

    _checkLogin(request, response);

    var fromUser = request.user;
    var toUser = request.params.toUser;
    var voiceURL = request.params.voiceURL;
    var text = request.params.text;


    if (!(fromUser && toUser && content))
    {
        response.error(error);
    }

    var message = new Message();
    message.set('fromUser',fromUser);
    message.set('toUser',toUser);
    var content = new Content();
    content.text = text;
    content.voiceURL = voiceURL;
    message.set('content',content);
    message.save().then(function(message) {

        response.success(message);

    }, function(error) {

        response.error(error);

    });
});

//查询两人间的私信
function _getMessage(user1, user2 , successBlock, errorBlock){
    var userId1 = AV.Object.createWithoutData("_User", user1.id);
    var userId2 = AV.Object.createWithoutData("_User", user2.id);

    var messQuery1 = new AV.Query(Message);
    messQuery1.equalTo('fromUser',fromUserId);
    messQuery1.equalTo('toUser',toUserId);

//    messQuery1.equalTo('isRead',false);

    var messQuery2 = new AV.Query(Message);
    messQuery2.equalTo('fromUser',toUserId);
    messQuery2.equalTo('toUser',fromUserId);

    var messageQuery = AV.Query.or(messQuery1, messQuery2);
    messageQuery.find().then(function(messages) {

        successBlock(messages);

    }, function(error) {

        errorBlock(error);

    });
}

//更改会话中未读状态为已读
AV.Cloud.define("update_message_to_is_read", function(request, response){

    _checkLogin(request, response);

    var toUser = request.user;
    var fromUser = request.params.fromUser;

    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
    var toUserId = AV.Object.createWithoutData("_User", toUser.id);

    var messageQuery = new AV.Query(Message);
    messageQuery.equalTo('fromUser',fromUserId);
    messageQuery.equalTo('toUser',toUserId);
    messageQuery.equalTo('isRead',false);

    messageQuery.find().then(function(messages) {

        for (var i in messages)
        {
            var message = messages[i];
            message.set('isRead',true);
        }
        AV.Object.saveAll(messages).then(function() {

            response.success();

        }, function(error) {

            response.error(error);

        });

    }, function(error) {

        response.error(error);

    });
});

//获取与某用户的聊天记录
AV.Cloud.define("get_all_message", function(request, response){

    _checkLogin(request, response);

    var fromUser = request.user;
    var toUser = request.params.toUser;

    //查询两人间的私信
    _getMessage(fromUser, toUser, function(messages){

        response.success(messages);

    }, function(error){

        response.error(error);

    });
});

//获取与某用户的未读聊天记录
AV.Cloud.define("get_all_message_for_unread", function(request, response){

    _checkLogin(request, response);

    var toUser = request.user;
    var fromUser = request.params.fromUser;
    var lastDate = request.params.lastDate;

    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
    var toUserId = AV.Object.createWithoutData("_User", toUser.id);

    var messageQuery = new AV.Query(Message);
    messageQuery.equalTo('fromUser',fromUserId);
    messageQuery.equalTo('toUser',toUserId);
    messageQuery.greaterThan('createdAt',lastDate);
    messageQuery.descending('createdAt');
    messageQuery.equalTo('isRead',false);
    messageQuery.equalTo('isDelete',false);

    messageQuery.find().then(function(messages) {

        response.success(messages);

    }, function(error) {

        response.error(error);

    });
});

//获得全部未读的聊天记录数
AV.Cloud.define("get_all_message_count_for_unread", function(request, response){

    _checkLogin(request, response);

    var toUser = request.user;
//    var fromUser = request.params.toUser;

//    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
    var toUserId = AV.Object.createWithoutData("_User", toUser.id);

    var messageQuery = new AV.Query(Message);
//    messageQuery.equalTo('fromUser',fromUserId);
    messageQuery.equalTo('toUser',toUserId);
    messageQuery.equalTo('isRead',false);
    messageQuery.equalTo('isDelete',false);

    messageQuery.count().then(function(count) {

        response.success(count);

    }, function(error) {

        response.error(error);

    });
});

//获取最近联系人列表
AV.Cloud.define("get_contacts", function(request, response){

    _checkLogin(request, response);

    var user = request.user;
    var fromUser = request.params.toUser;

    user.relation('contacts').find().then(function(contacts) {

        response.success(contacts);

    }, function(error) {

        response.error(error);

    });
});

//删除联系人（同时将所有该联系人的消息delete）
AV.Cloud.define("delete_contacts", function(request, response){

    _checkLogin(request, response);

    var toUser = request.user;
    var fromUser = request.params.fromUser;

    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
    var toUserId = AV.Object.createWithoutData("_User", toUser.id);

    var messageQuery = new AV.Query(Message);
    messageQuery.equalTo('fromUser',fromUserId);
    messageQuery.equalTo('toUser',toUserId);
    messageQuery.equalTo('isRead',false);

    messageQuery.find().then(function(messages) {

        for (var i in messages)
        {
            var message = messages[i];
            message.set('isRead',true);
        }
        AV.Object.saveAll(messages).then(function() {

//            var user = request.user;
            toUser.relation('contacts').remove(fromUser);

            return toUser.save().then(function(user) {

                response.success(user);

            }, function(error) {

                response.error(error);

            });

        }, function(error) {

            response.error(error);

        });

    }, function(error) {

        response.error(error);

    });
});


/**************
 用户日程
 ***************/
//创建日程
AV.Cloud.define("create_schedule", function(request, response){

    _checkLogin(request, response);

    var user = request.user;
    var userId = AV.Object.createWithoutData("_User", user.id);
    var date = request.params.date;
    var type = request.params.type;
    var remindDate = request.params.remindDate;
    var woeid = request.params.woeid;
    var place = request.params.place;

    if (!(user && date && remindDate && woeid && place))
    {
        response.error(error);
    }

    var installationQuery = new AV.Query(Installation);
    installationQuery.equalTo('user',userId);

    AV.Push.send({
//        channels: [ "Public" ],
        push_time : remindDate,
        where : installationQuery,
        data : {
            alert: "Public message"
        }
    });
});

//查看全部日程
AV.Cloud.define("my_schedule", function(request, response){

    _checkLogin(request, response);

    var scheduleQuery = new AV.Query(Schedule);
    var user = request.user;
    scheduleQuery.equalTo('user',user);
    scheduleQuery.find().then(function(schedules) {

        response.success(schedules);

    }, function(error) {

        response.error(error);

    });

});

//编辑日程
AV.Cloud.define("update_schedule", function(request, response){

});

//删除日程
AV.Cloud.define("delete_schedule", function(request, response){

});

/****************
 图片
 *****************/

//上传街拍
AV.Cloud.define("update_photo", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    var imageURLs = request.params.imageURLs;
    var voiceURL = request.params.voiceURL;
    var text = request.params.text;
    var temperature = request.params.temperature;
    var weatherCode = request.params.weatherCode;
    var latitude = request.params.latitude;
    var longitude = request.params.longitude;

    if (!(imageURLs.length && imageURLs && temperature))
    {
        response.error('缺少必要参数');
    }

//    if (!(text || voiceURL))
//    {
//        response.error('缺少必要参数');
//    }

    var photos = [];
    console.log('开始');
    for (var i in imageURLs)
    {
        console.log('开始1');
        var imageURL = imageURLs[i];

        //图片对象
        var photo = new Photo();

        //天气code
        photo.set('weatherCode',weatherCode);

        //坐标
        var location = new AV.GeoPoint({latitude: latitude, longitude: longitude});
        photo.set('location',location);


        //用户
        photo.set('user',user);


        //内容
        var content = new Content();
//        if (voiceURL) content.set('voiceURL',voiceURL);
//        if (text) content.set('text',text);

        photo.set('content',content);


        //图片url
        photo.set('originalURL',imageURL);
        photo.set('thumbnailURL',imageURL+'?imageMogr/auto-orient/thumbnail/200x');

        console.log('查询'+temperature);
        var temperatureQuery = new AV.Query(Temperature);
        temperatureQuery.greaterThanOrEqualTo('maxTemperture',temperature);
        temperatureQuery.lessThanOrEqualTo('minTemperture',temperature);
        temperatureQuery.first().then(function(temperatureObj){

//            console.dir(temperatureObj);
            var temperatureId = AV.Object.createWithoutData("Temperature", temperatureObj.id);
            //气温种类
            photo.set('temperature',temperatureId);

            console.log('请求');
            //图片尺寸
            AV.Cloud.httpRequest({
                url: imageURL+'?imageInfo',
                success: function(httpResponse) {

                    console.log(httpResponse.text);

                    parseString(httpResponse.text, function (error, result) {
                        if (result)
                        {
                            photo.set('width',result.width);
                            photo.set('height',result.height);

                            console.log('图片大小'+result.width,result.height);


                            photos.push(photo);
                            console.log('图片数量'+photos.length);

                            if (photos.length == imageURLs.length)
                            {
                                console.log('保存');
                                AV.Object.saveAll(photos).then(function(photos) {

                                    response.success(photos);

                                }, function(error) {

                                    response.error(error);

                                });
                            }
                        }
                        else
                        {
                            response.error(error);
                        }
                    });
                },
                error: function(error){

                    response.error(error);

                }
            });

        }, function(error) {

            response.error(error);

        });
    }
});




//查看用户的相册
AV.Cloud.define("search_user_photo", function(request, response) {

    var user = request.params.user;

    var photoQ = new AV.Query(Photo);
    _includeKeyWithPhoto(photoQ);
    photoQ.descending('createdAt');
    photoQ.equal('user',user);
    photoQ.find().then(function(photos) {

        response.success(photos);

    }, function(error) {

        response.error(error);

    });
});

//查看全部图片 //0.官方 1.最新街拍 2.最热街拍 3.附近的
AV.Cloud.define("search_all_photo", function(request, response) {

    var type = request._params.type;

    var photoQ = new AV.Query(Photo);
    _includeKeyWithPhoto(photoQ);

    if (type == 0)
    {
        photoQ.equal('isOfficial',true);
        photoQ.descending('updateAt');
    }
    else if (type == 1)
    {
        photoQ.equal('isOfficial',false);
        photoQ.descending('createdAt');
    }
    else if (type == 2)
    {
        photoQ.equal('isOfficial',false);
        photoQ.descending('hot');
    }
    else if (type == 3)
    {
        photoQ.equal('isOfficial',false);
        var latitude = request.params.latitude;
        var longitude = request.params.longitude;
        var location = new AV.GeoPoint({latitude: latitude, longitude: longitude});
        photoQ.near('location',location);
    }
    photoQ.find().then(function(photos) {

        response.success(photos);

    }, function(error) {

        response.error(error);

    });
});

//评论照片
AV.Cloud.define("comment_photo", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    var photo = request.params.photo;
    var voiceURL = request.params.voiceURL;
    var text = request.params.text;

    if (!photo || !(voiceURL || text))
    {
        response.error('参数错误');
    }


    var comment = new Comment();

    comment.set('user',user);

    photo.increment('hot');
    comment.set('photo',photo);

    var content = new Content();
    content.set('voiceURL',voiceURL);
    content.set('text',text);
    comment.set('content',content);

    comment.save().then(function(comment) {

        response.success(comment);

    }, function(error) {

        response.error(error);

    });
});

//查看照片评论
AV.Cloud.define("get_photo_comments", function(request, response) {

    var photo = request.params.photo;

    if (!photo)
    {
        response.error('参数错误');
    }

    var commentQ = new AV.Query(Comment);
    _includeKeyWithComment(commentQ);
    commentQ.descending('createdAt');
    commentQ.equal('photo',photo);
    commentQ.find().then(function(comments) {

        response.success(comments);

    }, function(error) {

        response.error(error);

    });
});

//查看照片评论数
AV.Cloud.define("get_photo_comments_count", function(request, response) {

    var photo = request.params.photo;

    if (!photo)
    {
        response.error('参数错误');
    }

    var commentQ = new AV.Query(Comment);
    _includeKeyWithComment(commentQ);
    commentQ.descending('createdAt');
    commentQ.equal('photo',photo);
    commentQ.find().then(function(comments) {

        response.success(comments);

    }, function(error) {

        response.error(error);

    });
});

//收藏照片
AV.Cloud.define("comment_photo", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    var photo = request.params.photo;
    if (!photo)
    {
        response.error('参数错误');
    }

    user.set('faviconPhotos',photo);

    user.save().then(function(user) {

        photo.set('faviconUsers',user);
        photo.increment('hot');
        return photo.save();

    }).then(function(photo) {

        response.success();

    }, function(error) {

        response.error(error);

    });

});

//查看收藏的照片
AV.Cloud.define("comment_photo", function(request, response) {

    _checkLogin(request, response);
});

AV.Cloud.define("pm_test", function(request, response) {

    AV.Cloud.httpRequest({
        url: 'http://www.pm25.in/api/querys/all_cities.json',
        success: function(httpResponse) {
            console.log(httpResponse.text);
            parseString(httpResponse.text, function (error, result) {
                if (result)
                {
                    console.dir(result);
                     response.success(result);
                }
                else
                {
                    console.dir(error);
                    response.error('Request failed with response code ' + error);
                }
            });
        },
        error: function(error){

            console.dir(error);
            response.error(error);

        }
    });
});