
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

function _checkLogin(request, response){

    if (!request.user)
    {
        response.error('请先登录');
    }
}

/****************
    用户资料
*****************/

//更新用户资料
AV.Cloud.define("update_user_info", function(request, response) {

    _checkLogin(request, response);

    var headViewURL = response.params.headViewURL;
    var backgroundViewURL = response.params.backgroundViewURL;
    var nickname = response.params.nickname;
    var gender = response.params.gender;
    var city = response.params.city;

    var user = request.user;
    if (headViewURL)
    {
        user.set('headViewURL',headViewURL);
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
    var content = new AV.Object(Content);
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

    var photos = [];

    for (var i in imageURLs)
    {
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
        var content = new AV.Object(Content);
        content.set('voiceURL',voiceURL);
        content.set('text',text);
        photo.set('content',content);

        //图片url
        photo.set('originalURL',imageURL);
        photo.set('thumbnailURL',imageURL+'?imageView/1/w/100/h/100');

        var temperatureQuery = new AV.Query(Temperature);
        temperatureQuery.greaterThanOrEqualTo('minTemperture',temperature);
        temperatureQuery.lessThanOrEqualTo('maxTemperture',temperature);
        temperatureQuery.first().then(function(temperatureObj){

            //气温种类
            photo.set('temperature',temperatureObj);
            //图片尺寸
            AV.Cloud.httpRequest({
                url: imageURL+'?imageInfo',
                success: function(httpResponse) {
                    parseString(httpResponse.text, function (error, result) {
                        if (result)
                        {
                            photo.set('width',result,width);
                            photo.set('height',result,height);

                            photos.push(photo);

                            if (photos.length == imageURLs.length)
                            {
                                AV.Object.saveAll(photos).then(function() {

                                    response.success();

                                }, function(error) {

                                    response.error(error);

                                });
                            }
                        }
                        else
                        {
                            response.error('Request failed with response code ' + error);
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

