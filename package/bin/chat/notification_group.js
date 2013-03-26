// Generated by CoffeeScript 1.4.0
(function() {
  "use strict";
  var NotificationGroup, exports, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  var exports = (_ref = window.chat) != null ? _ref : window.chat = {};

  NotificationGroup = (function(_super) {

    __extends(NotificationGroup, _super);

    function NotificationGroup(opt_channel) {
      NotificationGroup.__super__.constructor.apply(this, arguments);
      this._channel = opt_channel;
      this._size = 0;
      this._notification = null;
      this._stubs = [];
    }

    NotificationGroup.prototype.add = function(item) {
      var _ref1;
      if ((_ref1 = this._notification) != null) {
        _ref1.cancel();
      }
      this._size++;
      this._createNotification(item);
      return this._notification.show();
    };

    NotificationGroup.prototype._createNotification = function(item) {
      var body, title;
      this._addStubIfUnique(item.getStub());
      if (this._size === 1) {
        title = item.getTitle();
        body = item.getBody();
      } else {
        if (this._channel) {
          title = "" + this._size + " notifications in " + this._channel;
        } else {
          title = "" + this._size + " notifications";
        }
        body = this._stubs.join(', ');
      }
      body = truncateIfTooLarge(body, 75);
      this._notification = new chat.Notification(title, body);
      return this._addNotificationListeners();
    };

    NotificationGroup.prototype._addStubIfUnique = function(stub) {
      if (__indexOf.call(this._stubs, stub) < 0) {
        return this._stubs.push(stub);
      }
    };

    NotificationGroup.prototype._addNotificationListeners = function() {
      var _this = this;
      this._notification.on('clicked', function() {
        return _this.emit('clicked');
      });
      return this._notification.on('close', function() {
        return _this._clear();
      });
    };

    NotificationGroup.prototype.clear = function() {
      var _ref1;
      if ((_ref1 = this._notification) != null) {
        _ref1.cancel();
      }
      this._size = 0;
      return this._stubs = [];
    };

    return NotificationGroup;

  })(EventEmitter);

  exports.NotificationGroup = NotificationGroup;

}).call(this);
