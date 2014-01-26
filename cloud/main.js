// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:

var array = ['a1','2b','ccc'];

AV.Cloud.define("hello", function(request, response) {

  response.success("Hello world!");

    for (var i in array)
    {
        console.log(array[i]);
    }
});

/****************
 通用AVObject
 *****************/
var User = AV.Object.extend('_User');
var Installation = AV.Object.extend('_Installation');
var Follow = AV.Object.extend('Follow');
var Friend = AV.Object.extend('Friend');
var Message = AV.Object.extend('Message');
var Schedule = AV.Object.extend('Schedule');

var Photo = AV.Object.extend('Photo');
var Comment = AV.Object.extend('Comment');
var Content = AV.Object.extend('Content');
var Brand = AV.Object.extend('Brand');
var Temperature = AV.Object.extend('Temperature');
var WeatherType = AV.Object.extend('WeatherType');

var Notification = AV.Object.extend('_Notification');

var AirQualityIndex = AV.Object.extend('AirQualityIndex');

var PM25AppKey = "siv7h7ydxAEBoQw5Z3Lj";

/****************
 通用函数
 *****************/
//xml
var parseString = require('xml2js').parseString;

//json
var parse = require('xml2js').Parser();

//时间
var moment = require('moment');

//photo查询
function _includeKeyWithPhoto(photoQuery){
    photoQuery.include('content');
    photoQuery.include('brand');
    photoQuery.include('temperature');
    photoQuery.include('user');
}

//comment查询
function _includeKeyWithComment(commentQuery){

        commentQuery.include("user");
        commentQuery.include("content");
        commentQuery.include("photo");
}

//生成guid
function newGuid()
{
    var guid = "";
    for (var i = 1; i <= 32; i++){
        var n = Math.floor(Math.random()*16.0).toString(16);
        guid += n;
        if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
    }
    return guid;
}

//检查是否登录
function _checkLogin(request, response){

    if (!request.user)
    {
        response.error('请先登录');
    }
}

//字符串————>时间
function toDate(dateStr,formateStr,addHours){
    if (!formateStr) formateStr = "YYYY-MM-DD HH:mm:ss";
    if (!addHours) addHours = 8;
    return moment(dateStr, formateStr).add('hours',addHours).toDate()
}

//限制返回的调试
function limitQuery(request,query,done){

    var lessThenDateStr = request.params.lessThenDateStr;
    var limit = request.params.limit;

    if (lessThenDateStr)
    {
        var lessThenDate = toDate(lessThenDateStr,"YYYY-MM-DD HH:mm:ss");
        query.lessThan('createdAt',lessThenDate);
    }

    query.limit(limit);

    done(query);

}


//AV.Cloud.define("toDate", function(request, response) {
//
////    console.log(toDate("2014-01-21T10:00:00Z","yyyy-MM-dd'T'HH:mm:ssZ",0));
//                console.log(moment("2014-01-21T10:00:00Z","yyyy-MM-dd'T'HH:mm:ss'Z'").toDate());
//
//});

AV.Cloud.beforeSave("Message", function(request, response){

    var toUser = request.object.get('toUser');
    var fromUser = request.object.get('fromUser');

    console.dir(toUser);
    console.dir(fromUser);
    console.log('id1 : '+toUser.id);
    console.log('id2 : '+fromUser.id);

    var user1;
    var user2;

    if (!toUser.id || !fromUser.id)
    {
        console.log("联系人id为空");
        response.error(error);
    }

    var User = AV.Object.extend('_User');
    var userQ = new AV.Query(User);
    userQ.equalTo('objectId',toUser.id);
    userQ.first().then(function(user) {

        console.log("1");
        user1 = user;
        var userQ = new AV.Query(User);
        userQ.equalTo('objectId',fromUser.id);
        return userQ.first();

    }).then(function(user) {

        console.log("2");
        user2 = user;
        user1.relation('contacts').add(user2);
        return user1.save();

    }).then(function(user) {

        console.log("3");
        user2.relation('contacts').add(user1);
        return user2.save();

    }).then(function(user) {

        console.log("4");
        response.success();

    }, function(error) {
        console.log("5");
        response.error(error);

    });


});


function PM25() {
//
//    console.log('开始请求PM25');
//
//    AV.Cloud.httpRequest({
//        url: "http://www.pm25.in/api/querys/all_cities.json?token="+PM25AppKey,
//        success: function(httpResponse) {
//
//            console.log('请求PM25成功');
//            try {
////                console.dir(httpResponse.text);
//                var resultInfo = JSON.parse(httpResponse.text);
//
////                var guid = newGuid();
//
//                if (resultInfo)
//                {
//                    var aqis = new Array();
//                    console.log('获得aqi数量 ： '+resultInfo.length);
//                    for (var i in resultInfo)
//                    {
//                        var aqiInfo = resultInfo[i];
//                        if (!__production)
//                        console.dir(aqiInfo);
////                        console.dir(aqiInfo.area);
//
//                        var aqi = new AirQualityIndex();
//                        aqi.set('area', aqiInfo.area);
//                        aqi.set('aqi',aqiInfo.aqi);
//                        aqi.set('position_name', aqiInfo.position_name);
//                        aqi.set('station_code', aqiInfo.station_code);
//                        aqi.set('so2', aqiInfo.so2);
//                        aqi.set('so2_24h', aqiInfo.so2_24h);
//                        aqi.set('no2', aqiInfo.no2);
//                        aqi.set('no2_24h', aqiInfo.no2_24h);
//                        aqi.set('pm10', aqiInfo.pm10);
//                        aqi.set('pm10_24h', aqiInfo.pm10_24h);
//                        aqi.set('co', aqiInfo.co);
//                        aqi.set('co_24h', aqiInfo.co_24h);
//                        aqi.set('o3', aqiInfo.o3);
//                        aqi.set('o3_24h', aqiInfo.o3_24h);
//                        aqi.set('o3_8h', aqiInfo.o3_8h);
//                        aqi.set('o3_8h_24h', aqiInfo.o3_8h_24h);
//                        aqi.set('pm2_5', aqiInfo.pm2_5);
//                        aqi.set('pm2_5_24h', aqiInfo.pm2_5_24h);
//                        aqi.set('primary_pollutant', aqiInfo.primary_pollutant);
////                        aqi.set('guid',guid);
//
//                        aqi.set('quality', aqiInfo.quality);
////                        aqi.set('time_point', aqiInfo.time_point);
//                        aqis.push(aqi);
//                    }
//                    console.log('存入aqi数量 ： '+aqis.length);
//                    AV.Object.saveAll(aqis, function(list, error) {
//                        if (list) {
//                            // All the objects were saved.
//                            console.log('保存PM25成功');
//                            console.log('成功存入aqi数量 ： '+list.length);
//
//                        } else {
//                            // An error occurred.
//                            console.log('保存PM25失败1');
//                            console.dir(error);
//                        }
//                    });
//                }
//                else
//                {
//                    console.dir("resultInfo : "+resultInfo.result);
//                }
//            }
//            catch(error) {
//
//                console.log('保存PM25失败2');
//                console.dir(error);
//            }
//        },
//        error: function(error) {
//
//            console.log('保存PM25失败3');
//            console.dir(error);
//        }
//    });
//
}

if (!__production)
{
    AV.Cloud.setInterval('PM25_timer', 60*20, PM25);
}
else
{
    AV.Cloud.define("PM25_define", PM25);
}


//创建通知
function createPush(users,pushDate,alert,done){

    console.log("开始创建通知");
    //创建通知
    var installationQuery = new AV.Query(Installation);
//    var user = AV.Object.createWithoutData("_User", '52d4e3a7e4b0b492ca548e1b');
    installationQuery.containedIn('user',users);

    var guid = newGuid();

    if (!(pushDate && alert && users[0].id && guid))
    {
       console.log('创建通知参数错误');
        done(null,'创建通知参数错');
    }

//    console.dir(pushDate);
//    console.dir(alert);
//    console.dir(users);
//    console.dir(guid);

    AV.Push.send({
        where: installationQuery,
        data: {
            alert:alert
        },
        push_time:pushDate,
        guid:guid

    }).then(function() {

        console.log("开始获取通知");
        //获取通知
        var pushQ = new AV.Query(Notification);
        pushQ.equalTo('guid',guid);
        pushQ.first().then(function(push) {

            if (push)
            {
                console.log('push查询成功 : '+push.id);
                var pushId = AV.Object.createWithoutData("_Notification", push.id);
                done(pushId,null);
            }
            else
            {
                console.log('push查询失败');
                done(null,'push查询失败');
            }

        }, function(error) {

            done(null,error);

        });

        }, function(error) {

            done(null,error);
    });
}

//删除通知
function deletePush(push,done){

//    var pushId = AV.Object.createWithoutData("_Notification", push.id);
    push.destroy().then(function() {

        console.log('删除成功');
        done(null);

    }, function(error) {

        console.log('删除失败');
        done(error);
    });

}


//保存日程之前（创建推送通知）
AV.Cloud.beforeSave("Schedule", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    var userId = AV.Object.createWithoutData("_User", user.id);

    var schedlue = request.object;
    var pushDate = schedlue.get('remindDate');

    if (!pushDate)
    {
        response.success();
    }

    createPush([userId],pushDate,"你有一条新得提醒",function(push,error){

        if (push && !error)
        {
//            var pushId = AV.Object.createWithoutData("_Notification", push.id);
            schedlue.set('pushId',push.id);
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

//AV.Cloud.afterSave("Schedule", function(request) {
//
//});

//AV.Cloud.afterUpdate("Schedule", function(request) {
//
//});

//删除日程之前(删除推送通知)
AV.Cloud.beforeDelete("Schedule", function(request, response) {

    _checkLogin(request, response);
//    var user = request.user;
//    var userId = AV.Object.createWithoutData("_User", user.id);
    var schedlue = request.object;
    var pushId = AV.Object.createWithoutData("_Notification", schedlue.get('pushId'));

    deletePush(pushId,function(error){

        if (!error)
        {
            response.success();
        }
        else
        {
            response.error(error);
        }
    });
});

//AV.Cloud.afterDelete("Schedule", function(request) {
//
//});

//创建通知
AV.Cloud.define("created_push", function(request, response){

    _checkLogin(request, response);

    var userId = AV.Object.createWithoutData("_User", request.user.id);

    var remindDateStr = request.params.remindDateStr;

    var alert = request.params.alert;

    if (!(remindDateStr && alert))
    {
        response.error('参数错误');
    }

    var push_time = toDate(remindDateStr);

    createdPush([userId],push_time,alert,function(push,error){

        if (push && !error)
        {
//            var pushId = AV.Object.createWithoutData("_Notification", push.id);

            response.success(push.id);
        }
        else
        {
            response.error(error);
        }
    });
});

//删除通知
AV.Cloud.define("delete_push", function(request, response){

    _checkLogin(request, response);

    var pushId = request.params.pushId;

    if (!pushId)
    {
        response.error('参数错误');
    }

    var pushid = AV.Object.createWithoutData("_Notification", pushId);

    deletePush(pushid,function(error){
        if (!error)
        {
            console.log('删除成功1');
            response.success('成功');
        }
        else
        {
            response.error(error);
        }

    });


//    pushid.destroy().then(function() {
//
//        console.log('删除成功1');
//        response.success('成功');
//
//    }, function(error) {
//
//        response.error(error);
//
//    });

});

/****************
 天气
 *****************/
AV.Cloud.define("datetime", function(request, response) {

//    var timestamp = Date.parse(new Date());
    var timestamp = new Date().getTime();
//    console.log(timestamp);
    response.success(timestamp);
});

//var yahooCityNameToWoeidAPI = "http://query.yahooapis.com/v1/public/yql?q=select%20woeid,name,country%20from%20geo.places%20where%20text=";
//AV.Cloud.define("get_woeid_from_city_name", function(request, response) {
//
//    var cityName = request.params.cityName;
//
//    AV.Cloud.httpRequest({
//        url: yahooCityNameToWoeidAPI+cityName,
//        success: function(httpResponse) {
//
//            parseString(httpResponse.text, function (error, result) {
//
//                console.dir(result);
//                if (result)
//                {
//                    cloopen2avos(request, response, user, result);
//                }
//                else
//                {
//                    response.error('Request failed with response code ' + error);
//                }
//            });
//
//        },
//        error: function(error){
//
//            response.error(error);
//
//        }
//    });
//});

/****************
 用户资料
 *****************/

//更新用户资料
//AV.Cloud.define("update_user_info", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var headViewURL = request.params.headViewURL;
//    var backgroundViewURL = request.params.backgroundViewURL;
//    var nickname = request.params.nickname;
//    var gender = request.params.gender;
//    var city = request.params.city;
//
//    var user = request.user;
//    if (headViewURL)
//    {
//        user.set('largeHeadViewURL',headViewURL);
//        user.set('smallHeadViewURL',headViewURL+'?imageMogr/auto-orient/thumbnail/100x100');
//    }
//
//    if (backgroundViewURL)
//    {
//        user.set('backgroundViewURL',backgroundViewURL);
//    }
//
//    if (nickname)
//    {
//        user.set('nickname',nickname);
//    }
//
//    user.set('gender',gender);
//
//    if (city)
//    {
//        user.set('city',city);
//    }
//
//    user.set('isCompleteSignUp',true);
//
//    user.save().then(function(user) {
//
//        response.success(user);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

////关注
//AV.Cloud.define("add_friend", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    var friend = request.params.friend;
//
////    console.dir(user);
////    console.dir(friend);
//
//    console.log('1');
//    var friendId = AV.Object.createWithoutData("_User", friend);
//    console.log(friendId);
//    user.relation('friends').add(friendId);
//    user.save().then(function(user) {
//        console.log('2');
//        console.dir(user);
//
//        var userId = AV.Object.createWithoutData("_User", user.id);
//        friend.relation('follows').add(userId);
//        friend.save().then(function(user) {
//            console.log('3');
//            console.dir(user);
//
//            response.success(user);
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//
//});
//
////解除关注
//AV.Cloud.define("remove_friend", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    var friend = request.params.friend;
//
//    user.relation('friends').remove(friend);
//    user.save().then(function(user) {
//
//        friend.relation('follow').remove(user);
//        friend.save().then(function(user) {
//
//            response.success(user);
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//
//});
//
////我关注的人 (bug:没分页)
//AV.Cloud.define("get_friends", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//
//    var friendsQuery = user.relation('friends').query();
//
//    friendsQuery.find().then(function(friends) {
//
//        response.success(friends);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//
//});
//
////我关注的人数
//AV.Cloud.define("get_friends_count", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    user.relation('friends').query().count().then(function(count) {
//
//        response.success(count);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});
//
////粉丝 (bug:没分页)
//AV.Cloud.define("get_follows", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//
//    var followsQuery = user.relation('follows').query();
//
//    followsQuery.find().then(function(follows) {
//
//        response.success(follows);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});
//
////粉丝数
//AV.Cloud.define("get_follows_count", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    user.relation('follows').count().then(function(count) {
//
//        response.success(count);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

/**************
 用户消息
 ***************/

//发消息
//AV.Cloud.define("post_message", function(request, response){
//
//    _checkLogin(request, response);
//
//    var fromUser = request.user;
//    var toUser = request.params.toUser;
//    var voiceURL = request.params.voiceURL;
//    var text = request.params.text;
//
//
//    if (!(fromUser && toUser && content))
//    {
//        response.error(error);
//    }
//
//    var message = new Message();
//    message.set('fromUser',fromUser);
//    message.set('toUser',toUser);
//    var content = new Content();
//    content.text = text;
//    content.voiceURL = voiceURL;
//    message.set('content',content);
//    message.save().then(function(message) {
//
//        toUser.relation('contacts').add(fromUser);
//        toUser.save().then(function(message) {
//
//            response.success(message);
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

//更改会话中未读状态为已读
//AV.Cloud.define("update_message_to_is_read", function(request, response){
//
//    _checkLogin(request, response);
//
//    var toUser = request.user;
//    var fromUser = request.params.fromUser;
//
//    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
//    var toUserId = AV.Object.createWithoutData("_User", toUser.id);
//
//    var messageQuery = new AV.Query(Message);
//    messageQuery.equalTo('fromUser',fromUserId);
//    messageQuery.equalTo('toUser',toUserId);
//    messageQuery.equalTo('isRead',false);
//
//    messageQuery.find().then(function(messages) {
//
//        for (var i in messages)
//        {
//            var message = messages[i];
//            message.set('isRead',true);
//        }
//        AV.Object.saveAll(messages).then(function() {
//
//            response.success();
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

//获取与某用户的聊天记录
//AV.Cloud.define("search_messages_about_user", function(request, response){
//
//    _checkLogin(request, response);
//
//    var fromUser = request.user;
//    var toUser = request.params.toUser;
//
//    //查询两人间的私信
//    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
//    var toUserId = AV.Object.createWithoutData("_User", toUser.id);
//
//    var messQuery1 = new AV.Query(Message);
//    messQuery1.equalTo('fromUser',fromUserId);
//    messQuery1.equalTo('toUser',toUserId);
//    messQuery1.equalTo('isDelete',false);
//
//    var messQuery2 = new AV.Query(Message);
//    messQuery2.equalTo('fromUser',toUserId);
//    messQuery2.equalTo('toUser',fromUserId);
//    messQuery2.equalTo('isDelete',false);
//
//    var messageQuery = AV.Query.or(messQuery1, messQuery2);
//
//    limitQuery(request,messageQuery,function(messageQuery){
//
//        messageQuery.find().then(function(messages) {
//
//            response.success(messages);
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    });
//});

//获取与某用户的未读聊天记录
//AV.Cloud.define("search_messages_about_user_for_unread", function(request, response){
//
//    _checkLogin(request, response);
//
//    var toUser = request.user;
//    var fromUser = request.params.fromUser;
//
//    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
//    var toUserId = AV.Object.createWithoutData("_User", toUser.id);
//
//    var messageQuery = new AV.Query(Message);
//    messageQuery.equalTo('fromUser',fromUserId);
//    messageQuery.equalTo('toUser',toUserId);
//    messageQuery.descending('createdAt');
//    messageQuery.equalTo('isRead',false);
//    messageQuery.equalTo('isDelete',false);
//
//    limitQuery(request,messageQuery,function(messageQuery){
//
//        messageQuery.find().then(function(messages) {
//
//            response.success(messages);
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    });
//});

//获得全部未读的聊天记录数
//AV.Cloud.define("get_all_message_count_for_unread", function(request, response){
//
//    _checkLogin(request, response);
//
//    var toUser = request.user;
////    var fromUser = request.params.toUser;
//
////    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
//    var toUserId = AV.Object.createWithoutData("_User", toUser.id);
//
//    var messageQuery = new AV.Query(Message);
////    messageQuery.equalTo('fromUser',fromUserId);
//    messageQuery.equalTo('toUser',toUserId);
//    messageQuery.equalTo('isRead',false);
//    messageQuery.equalTo('isDelete',false);
//
//    messageQuery.count().then(function(count) {
//
//        response.success(count);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

//获取最近联系人列表
//AV.Cloud.define("get_contacts", function(request, response){
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//
//    var coutactsQuery = user.relation('contacts').query();
//
//    limitQuery(request,coutactsQuery,function(coutactsQuery){
//
//        coutactsQuery.find().then(function(contacts) {
//
//            response.success(contacts);
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//    });
//
//});

//删除联系人（同时将所有该联系人的消息delete）
//AV.Cloud.define("delete_contacts", function(request, response){
//
//    _checkLogin(request, response);
//
//    var toUser = request.user;
//    var fromUser = request.params.fromUser;
//
//    var fromUserId = AV.Object.createWithoutData("_User", fromUser.id);
//    var toUserId = AV.Object.createWithoutData("_User", toUser.id);
//
//    var messageQuery = new AV.Query(Message);
//    messageQuery.equalTo('fromUser',fromUserId);
//    messageQuery.equalTo('toUser',toUserId);
//    messageQuery.equalTo('isRead',false);
//
//    messageQuery.find().then(function(messages) {
//
//        for (var i in messages)
//        {
//            var message = messages[i];
//            message.set('isRead',true);
//        }
//        AV.Object.saveAll(messages).then(function() {
//
////            var user = request.user;
//            toUser.relation('contacts').remove(fromUser);
//
//            return toUser.save().then(function() {
//
//                response.success();
//
//            }, function(error) {
//
//                response.error(error);
//
//            });
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});


/**************
 用户日程
 ***************/

//创建日程
//AV.Cloud.define("create_schedule", function(request, response){
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    var userId = AV.Object.createWithoutData("_User", user.id);
//    var dateStr = request.params.dateStr;
//    var type = request.params.type;
//    var woeid = request.params.woeid;
//    var place = request.params.place;
//    var text = request.params.text;
//    var voiceURL = request.params.voiceURL;
//    var URL = request.params.URL;
//    var remindDateStr = request.params.remindDateStr;
//
////    console.log('dateStr'+dateStr);
////    console.log('remindDateStr'+remindDateStr);
////    console.log('woeid'+woeid);
////    console.log('place'+place);
//
//    if (!(user && dateStr && remindDateStr && woeid && place))
//    {
//        response.error('参数错误');
//    }
//
////    var push_time = moment(new Date()).add('hours',8).toDate();
////    var push_time = new Date();
////    push_time.setSeconds(push_time.getSeconds()+remindTime);
//
////    console.dir(remindDateStr);
//    var push_time = toDate(remindDateStr);
////    console.dir(push_time);
//
//    //创建通知
//    createdPush([userId],push_time,'你有一个新的日程',function(push,error){
//
//        if (push && !error)
//        {
//            //创建日程
//            var schedule = new Schedule();
//
////            var date_time = moment(new Date()).add('hours',8).toDate();
////            var date_time = new Date();
////            date_time.setSeconds(date_time.getSeconds());
//            var date_time = toDate(dateStr);
//
//            schedule.set('date',date_time);
//            schedule.set('type',type);
//            schedule.set('woeid',woeid);
//            schedule.set('place',place);
//            schedule.set('user',userId);
//            schedule.set('remindDate',push_time);
//
//            var content = new Content();
//            content.set('text',text);
//            content.set('voiceURL',voiceURL);
//            content.set('URL',URL);
//            schedule.set('content',content);
//
//            var pushId = AV.Object.createWithoutData("_Notification", push.id);
//            schedule.set('push',pushId);
//            schedule.save().then(function(schedule) {
//
//                response.success(schedule);
//
//            }, function(error) {
//
//                response.error(error);
//
//            });
//        }
//        else
//        {
//            response.error(error);
//        }
//
//    });
//});

//查看全部日程
//AV.Cloud.define("my_schedule", function(request, response){
//
//    _checkLogin(request, response);
//
//    var scheduleQuery = new AV.Query(Schedule);
//    var user = request.user;
//    var userId = AV.Object.createWithoutData("_User", user.id);
//    scheduleQuery.equalTo('user',userId);
//    scheduleQuery.find().then(function(schedules) {
//
//        response.success(schedules);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//
//});



//编辑日程
//AV.Cloud.define("update_schedule", function(request, response){
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    var userId = AV.Object.createWithoutData("_User", user.id);
//    var dateStr = request.params.dateStr;
//    var type = request.params.type;
//    var woeid = request.params.woeid;
//    var place = request.params.place;
//    var text = request.params.text;
//    var voiceURL = request.params.voiceURL;
//    var URL = request.params.URL;
//    var remindDateStr = request.params.remindDateStr;
//    var scheduleId = request.params.scheduleId;
//
//    console.log("scheduleId:"+scheduleId);
//
//    if (!scheduleId)
//    {
//        response.error('参数错误');
//    }
//
//    var schedule = AV.Object.createWithoutData("Schedule", scheduleId);
//
//    //修改属性
//    schedule.set('type',type);
//
//    if (woeid) schedule.set('woeid',woeid);
//    if (place) schedule.set('place',place);
//
//    if (dateStr)
//    {
//        var date_time = toDate(dateStr);
//        schedule.set('date',date_time);
//    }
//
//    if (text || voiceURL || URL)
//    {
//        var content = new Content();
//        content.set('text',text);
//        content.set('voiceURL',voiceURL);
//        content.set('URL',URL);
//        schedule.set('content',content);
//    }
//
//    if (remindDateStr)
//    {
//        //删除老通知
//        var push = schedule.get('push');
//        push.delete().then(function() {
//
//            //创建新通知
//            var push_time = toDate(remindDateStr);
//
//            createdPush([userId],push_time,'你有一个新的日程',function(push,error){
//
//                if (push && !error)
//                {
//                    var pushId = AV.Object.createWithoutData("_Notification", push.id);
//                    schedule.set('push',pushId);
//                    schedule.set('remindDate',push_time);
//                    schedule.save().then(function(schedule) {
//
//                        response.success(schedule);
//
//                    }, function(error) {
//
//                        response.error(error);
//
//                    });
//                }
//                else
//                {
//                    response.error(error);
//                }
//            });
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//    }
//});

//删除日程
//AV.Cloud.define("delete_schedule", function(request, response){
//
//    _checkLogin(request, response);
//
//    var schedule = request.params.schedule;
//    if (!schedule)
//    {
//        response.error('参数错误');
//    }
//
//    var push = schedule.get('push');
//    push.delete().then(function() {
//
//        schedule.delete().then(function() {
//
//            response.success();
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

/****************
 图片
 *****************/

//上传街拍
//AV.Cloud.define("upload_photo", function(request, response) {
////    _checkLogin(request, response);
//
//    var user = request.user;
//    var imageURLs = request.params.imageURLs;
//    var voiceURL = request.params.voiceURL;
//    var text = request.params.text;
//    var temperature = request.params.temperature;
//    var weatherCode = request.params.weatherCode;
//    var latitude = request.params.latitude;
//    var longitude = request.params.longitude;
//
//    if (!(imageURLs.length && imageURLs && temperature))
//    {
//        response.error('缺少必要参数');
//    }
//
//    var photos = [];
//    console.log('开始');
//    console.dir(imageURLs);
//
//    for (var i in imageURLs)
//    {
//        var imageURL = imageURLs[i];
//         console.log(imageURL);
//        //图片对象
//        var photo = new Photo();
//
//        //坐标
//        var location = new AV.GeoPoint({latitude: latitude, longitude: longitude});
//        photo.set('location',location);
//
//        //用户
//        photo.set('user',user);
//
//        //内容
//        var content = new Content();
//        if (voiceURL) content.set('voiceURL',voiceURL);
//        if (text) content.set('text',text);
//
//        photo.set('content',content);
//
//        //图片url
//        photo.set('originalURL',imageURL);
//        photo.set('thumbnailURL',imageURL+'?imageMogr/auto-orient/thumbnail/200x');
//
//        console.log('请求'+imageURL);
//        //图片尺寸
//        AV.Cloud.httpRequest({
//            url: imageURL+'?imageInfo',
//            success: function(httpResponse) {
//
////                console.log(httpResponse.text);
//
////                    JSON.parse(httpResponse.text, function (error, result) {
//                var result = JSON.parse(httpResponse.text);
//                if (result)
//                {
////                            console.log('图片大小'+result.width,result.height);
//                        photo.set('width',result.width);
//                        photo.set('height',result.height);
//
//                        var weatherTypeQuery = new AV.Query(WeatherType);
//                        weatherTypeQuery.equalTo('code',weatherCode);
//                        weatherTypeQuery.first().then(function(weatherTypeObj){
//
//                                var weatherTypeId = AV.Object.createWithoutData("WeatherType", weatherTypeObj.id);
//                                //天气code
//                                photo.set('weatherType',weatherTypeId);
//
//                                console.log('查询'+temperature);
//
//                                var temperatureQuery = new AV.Query(Temperature);
//                                temperatureQuery.greaterThanOrEqualTo('maxTemperture',temperature);
//                                temperatureQuery.lessThanOrEqualTo('minTemperture',temperature);
//                                temperatureQuery.first().then(function(temperatureObj){
//
//
//                                    var temperatureId = AV.Object.createWithoutData("Temperature", temperatureObj.id);
//                                    //气温种类
//                                    photo.set('temperature',temperatureId);
//
//                                    photos.push(photo);
//
//                                    console.log('保存'+photos.count);
//                                    if (photos.length == imageURLs.length)
//                                    {
//                                        console.log('结束');
//                                        AV.Object.saveAll(photos).then(function(photos) {
//
//                                            response.success(photos);
//
//                                        }, function(error) {
//
//                                            response.error(error);
//
//                                        });
//                                    }
//
//                                }, function(error) {
//
//                                    response.error(error);
//
//                                });
//
//
//                    },function(error){
//                            response.error(error);
//                        });
//                }
//                else
//                {
//                    response.error("result 失败");
//                }
//
//            },
//            error: function(error){
//
//                response.error(error);
//
//            }
//        });
//
//    }
//});

//查看用户的相册
//AV.Cloud.define("search_user_photo", function(request, response) {
//
//    var user = request.params.user;
//    var lessThenDateStr = request.params.lessThenDateStr;
//    var limit = request.params.limit;
//
//    var photoQ = new AV.Query(Photo);
//    _includeKeyWithPhoto(photoQ);
//
//    if (lessThenDateStr)
//    {
//        var lessThenDate = toDate(lessThenDateStr);
//        photoQ.lessThan('createdAt',lessThenDate);
//    }
//
//    photoQ.limit(limit);
//    photoQ.descending('createdAt');
//    photoQ.equal('user',user);
//    photoQ.find().then(function(photos) {
//
//        response.success(photos);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

//查看全部图片 //0.官方 1.最新街拍 2.最热街拍 3.附近的
//AV.Cloud.define("search_all_photo", function(request, response) {
//
//    var type = request.params.type;
//    var lessThenDateStr = request.params.lessThenDateStr;
//    var limit = request.params.limit;
//
//    var photoQ = new AV.Query(Photo);
//
//    _includeKeyWithPhoto(photoQ);
//
//    if (lessThenDateStr)
//    {
//        var lessThenDate = toDate(lessThenDateStr);
//        photoQ.lessThan('createdAt',lessThenDate);
//    }
//
//    photoQ.limit(limit);
//
//    if (type == 0)
//    {
//        photoQ.equal('isOfficial',true);
//        photoQ.descending('updatedAt');
//    }
//    else if (type == 1)
//    {
//        photoQ.equal('isOfficial',false);
//        photoQ.descending('createdAt');
//    }
//    else if (type == 2)
//    {
//        photoQ.equal('isOfficial',false);
//        photoQ.descending('hot');
//    }
//    else if (type == 3)
//    {
//        photoQ.equal('isOfficial',false);
//        var latitude = request.params.latitude;
//        var longitude = request.params.longitude;
//        var location = new AV.GeoPoint({latitude: latitude, longitude: longitude});
//        photoQ.near('location',location);
//    }
//    photoQ.find().then(function(photos) {
//
//        response.success(photos);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

//评论照片
//AV.Cloud.define("comment_photo", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    var photo = request.params.photo;
//    var voiceURL = request.params.voiceURL;
//    var text = request.params.text;
//
//    if (!photo || !(voiceURL || text))
//    {
//        response.error('参数错误');
//    }
//
//    var comment = new Comment();
//
//    comment.set('user',user);
//
//    photo.increment('hot');
//    comment.set('photo',photo);
//
//    var content = new Content();
//    content.set('voiceURL',voiceURL);
//    content.set('text',text);
//    comment.set('content',content);
//
//    comment.save().then(function(comment) {
//
//        response.success(comment);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

//查看照片评论
//AV.Cloud.define("search_photo_comments", function(request, response) {
//
//    var photo = request.params.photo;
//
//    if (!photo)
//    {
//        response.error('参数错误');
//    }
//
//    var commentQ = new AV.Query(Comment);
//    _includeKeyWithComment(commentQ);
//
//    limitQuery(request,commentQ,function(commentQ){
//
//        commentQ.descending('createdAt');
//        commentQ.equal('photo',photo);
//        commentQ.find().then(function(comments) {
//
//            response.success(comments);
//
//        }, function(error) {
//
//            response.error(error);
//
//        });
//
//    });
//
//});

//查看照片评论数
//AV.Cloud.define("search_photo_comments_count", function(request, response) {
//
//    var photo = request.params.photo;
//
//    if (!photo)
//    {
//        response.error('参数错误');
//    }
//
//    var commentQ = new AV.Query(Comment);
//    _includeKeyWithComment(commentQ);
//    commentQ.descending('createdAt');
//    commentQ.equal('photo',photo);
//    commentQ.find().then(function(comments) {
//
//        response.success(comments);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

//收藏照片
//AV.Cloud.define("favicon_photo", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    var photo = request.params.photo;
//
//    if (!photo)
//    {
//        response.error('参数错误');
//    }
//
//    user.relation('faviconPhotos').add(photo);
//
//    user.save().then(function(user) {
//
//        photo.relation('faviconUsers').add(user);
//        photo.increment('hot');
//        return photo.save();
//
//    }).then(function() {
//
//        response.success();
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//
//});

////查看照片的收藏者
//AV.Cloud.define("search_photo_favicon_users", function(request, response) {
//
//    var photo = request.params.photo;
//    var lessThenDateStr = request.params.lessThenDateStr;
//    var limit = request.params.limit;
//
//    if (!photo)
//    {
//       response.error('参数错误');
//    }
//
//    var PhotofaviconsQuery =  photo.relation('faviconUsers').query();
//    if (lessThenDateStr)
//    {
//        var lessThenDate = toDate(lessThenDateStr);
//        PhotofaviconsQuery.lessThan('createdAt',lessThenDate);
//    }
//
//    PhotofaviconsQuery.limit(limit);
//
//    PhotofaviconsQuery.find().then(function(Photofavicons) {
//
//        response.success(Photofavicons);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});

////查看照片的收藏者数
//AV.Cloud.define("search_photo_favicon_users_count", function(request, response) {
//
//    var photo = request.params.photo;
//
//    if (!photo)
//    {
//        response.error('参数错误');
//    }
//
//    var PhotofaviconsQuery =  photo.relation('faviconUsers').query();
//
//    PhotofaviconsQuery.count().then(function(PhotofaviconsCount) {
//
//        response.success(PhotofaviconsCount);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});
//
////查看我收藏的照片
//AV.Cloud.define("get_my_favicon_photos", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//    var faviconPhotosQuery =  user.relation('faviconPhotos').query();
//    var lessThenDateStr = request.params.lessThenDateStr;
//    var limit = request.params.limit;
//
//    if (lessThenDateStr)
//    {
//        var lessThenDate = toDate(lessThenDateStr);
//        faviconPhotosQuery.lessThan('createdAt',lessThenDate);
//    }
//
//    faviconPhotosQuery.limit(limit);
//
//    faviconPhotosQuery.find().then(function(faviconPhotos) {
//
//        response.success(faviconPhotos);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});
//
////查看我收藏的照片数
//AV.Cloud.define("get_my_favicon_photos_count", function(request, response) {
//
//    _checkLogin(request, response);
//
//    var user = request.user;
//
//    var faviconPhotosQuery =  user.relation('faviconPhotos').query;
//
//    faviconPhotosQuery.count().then(function(faviconPhotosCount) {
//
//        response.success(faviconPhotosCount);
//
//    }, function(error) {
//
//        response.error(error);
//
//    });
//});