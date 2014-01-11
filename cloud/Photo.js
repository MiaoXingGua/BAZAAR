/**
 * Created with JetBrains WebStorm.
 * User: albert
 * Date: 14-1-9
 * Time: 下午7:22
 * To change this template use File | Settings | File Templates.
 */

var User = AV.Object.extend('_User');
var Installation = AV.Object.extend('_Installation');
var Message = AV.Object.extend('Message');
var Schedule = AV.Object.extend('Schedule');
var Follow = AV.Object.extend('Follow');
var Friend = AV.Object.extend('Friend');


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
AV.Cloud.define("update_photo", function(request, response) {

    _checkLogin(request, response);

    var user = request.user;
    var imageBase64 = request.params.photo;
    var voice = request.params.voice;
    var text = request.params.text;
    var temperature = request.params.temperature;
    var weatherCode = request.params.weatherCode;
    var latitude = request.params.latitude;
    var longitude = request.params.longitude;

    if (!(imageBase64 && temperature))
    {
        response.error('缺少必要参数');
    }


});