this["JST"] = this["JST"] || {};

this["JST"]["suit/components/alert"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<span class=\'icon f-left\'>' +
((__t = ( alertIcon )) == null ? '' : __t) +
'</span><span class=\'f-right\'>x</span><p>' +
((__t = ( message )) == null ? '' : __t) +
'</p>\n';

}
return __p
};

this["JST"]["suit/components/confirm"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'title-box clear\'>\n    <h4 class=\'f-left\'>' +
((__t = ( title )) == null ? '' : __t) +
'</h4>\n</div>\n<div class=\'content-box\'>\n    <div class=\'grid1\'>\n        <p>' +
((__t = ( text )) == null ? '' : __t) +
'</p>\n    </div>\n</div>\n<div class=\'footer-box\'>\n    <button class=\'btn-primary ' +
((__t = ( color )) == null ? '' : __t) +
' yes\'>Yes</button> <button class=\'btn-secondary ' +
((__t = ( color )) == null ? '' : __t) +
' no\'>No</button>\n</div>';

}
return __p
};

this["JST"]["suit/components/graph"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '';

}
return __p
};