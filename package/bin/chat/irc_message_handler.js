// Generated by CoffeeScript 1.4.0
(function() {
  "use strict";
  var IRCMessageHandler, exports, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  var exports = (_ref = window.chat) != null ? _ref : window.chat = {};

  /*
   * Displays messages to the user when certain IRC events occur.
  */


  IRCMessageHandler = (function(_super) {

    __extends(IRCMessageHandler, _super);

    function IRCMessageHandler(_chat) {
      this._chat = _chat;
      this._formatter = new window.chat.MessageFormatter;
      this._chatLog = new chat.ChatLog;
      this._chatLog.whitelist('privmsg');
      this._ignoredMessages = {};
      IRCMessageHandler.__super__.constructor.apply(this, arguments);
    }

    /*
       * Ignore messages of a certain type when in the specified room.
       * @param {Context} context
       * @param {string} type
    */


    IRCMessageHandler.prototype.ignoreMessageType = function(context, type) {
      var _base, _ref1;
      if ((_ref1 = (_base = this._ignoredMessages)[context]) == null) {
        _base[context] = {};
      }
      this._ignoredMessages[context][type.toLowerCase()] = true;
      return this._chat.storage.ignoredMessagesChanged();
    };

    /*
       * Stop ignoring messages of a certain type when in the specified room.
       * @param {Context} context
       * @param {string} type
    */


    IRCMessageHandler.prototype.stopIgnoringMessageType = function(context, type) {
      type = type.toLowerCase();
      if (!this._ignoredMessages[context][type]) {
        return;
      }
      delete this._ignoredMessages[context][type];
      return this._chat.storage.ignoredMessagesChanged();
    };

    IRCMessageHandler.prototype.getIgnoredMessages = function() {
      return this._ignoredMessages;
    };

    IRCMessageHandler.prototype.setIgnoredMessages = function(ignoredMessages) {
      return this._ignoredMessages = ignoredMessages;
    };

    IRCMessageHandler.prototype.getChatLog = function() {
      return this._chatLog.getData();
    };

    IRCMessageHandler.prototype.logMessagesFromWindow = function(win) {
      return win.on('message', this._chatLog.add);
    };

    /*
       * Replays the given chatlog so the user can see the conversation they
       * missed.
    */


    IRCMessageHandler.prototype.replayChatLog = function(opt_chatLogData) {
      var context, win, _i, _len, _ref1, _results;
      if (opt_chatLogData) {
        this._chatLog.loadData(opt_chatLogData);
      }
      _ref1 = this._chatLog.getContextList();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        context = _ref1[_i];
        win = this._chat.winList.get(context.server, context.channel);
        if (!win) {
          continue;
        }
        _results.push(win.rawHTML(this._chatLog.get(context)));
      }
      return _results;
    };

    /*
       * Sets which window messages will be displayed on.
       *
       * Call this method before calling handle().
    */


    IRCMessageHandler.prototype.setWindow = function(_win) {
      var _ref1;
      this._win = _win;
      return this._formatter.setNick((_ref1 = this._win.conn) != null ? _ref1.irc.nick : void 0);
    };

    IRCMessageHandler.prototype.setCustomMessageStyle = function(customStyle) {
      return this._formatter.setCustomStyle(customStyle);
    };

    IRCMessageHandler.prototype.handle = function() {
      var params, type;
      type = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this._setDefaultValues(params);
      IRCMessageHandler.__super__.handle.apply(this, [type].concat(__slice.call(params)));
      return this._sendFormattedMessage();
    };

    IRCMessageHandler.prototype._setDefaultValues = function(params) {
      var _ref1;
      this.source = '';
      this._formatter.clear();
      return (_ref1 = this._formatter).setContext.apply(_ref1, params);
    };

    /*
       * The formatter.setMessage() method accepts placeholder variables (#to, #from,
       * #content). By default, the first argument replaces #from, the 2nd argument
       * replaces #to and the last argument replaces #content.
    */


    IRCMessageHandler.prototype._handlers = {
      topic: function(from, topic) {
        this._chat.updateStatus();
        this._formatter.setContent(topic);
        if (!topic) {
          this._formatter.addStyle('notice');
          return this._formatter.setMessage('no topic is set');
        } else if (!from) {
          this._formatter.addStyle('notice');
          return this._formatter.setMessage('the topic is: #content');
        } else {
          this._formatter.addStyle('update');
          return this._formatter.setMessage('#from changed the topic to: #content');
        }
      },
      /*
           * Display when the topic was set and who it was set by.
      */

      topic_info: function(who, time) {
        this._formatter.addStyle('notice');
        this._formatter.setContent(getReadableTime(parseInt(time)));
        this._formatter.setMessage('Topic set by #from on #content.');
        return this._formatter.setPrettyFormat(false);
      },
      join: function(nick) {
        this._formatter.addStyle('update');
        this._formatter.setMessage('#from joined the channel');
        return this._win.nicks.add(nick);
      },
      part: function(nick) {
        this._formatter.addStyle('update');
        this._formatter.setMessage('#from left the channel');
        return this._win.nicks.remove(nick);
      },
      kick: function(from, to, reason) {
        this._formatter.addStyle('update');
        this._formatter.setMessage('#from kicked #to from the channel: #content');
        return this._win.nicks.remove(to);
      },
      nick: function(from, to) {
        if (this._isOwnNick(to)) {
          this._formatter.setFromUs(true);
          this._formatter.setToUs(false);
        }
        this._formatter.addStyle('update');
        this._formatter.setMessage('#from is now known as #to');
        if (!this._win.isServerWindow()) {
          this._win.nicks.remove(from);
          return this._win.nicks.add(to);
        }
      },
      mode: function(from, to, mode) {
        if (!to) {
          return;
        }
        this._formatter.addStyle('update');
        this._formatter.setContent(this._getModeMessage(mode));
        return this._formatter.setMessage('#from #content #to');
      },
      user_mode: function(who, mode) {
        this._formatter.addStyle('notice');
        this._formatter.setContext(void 0, who, mode);
        return this._formatter.setMessage('#to has modes #content');
      },
      quit: function(nick, reason) {
        this._formatter.addStyle('update');
        this._formatter.setMessage('#from has quit: #content');
        this._formatter.setContent(reason);
        return this._win.nicks.remove(nick);
      },
      disconnect: function() {
        this._formatter.addStyle('update');
        this._formatter.setMessage('Disconnected');
        return this._formatter.setFromUs(true);
      },
      connect: function() {
        this._formatter.addStyle('update');
        this._formatter.setMessage('Connected');
        return this._formatter.setFromUs(true);
      },
      privmsg: function(from, msg) {
        this._formatter.addStyle('update');
        this._handleMention(from, msg);
        return this._formatPrivateMessage(from, msg);
      },
      breakgroup: function(msg) {
        if (msg == null) {
          msg = '';
        }
        return this._formatter.setContentMessage(msg);
      },
      error: function(msg) {
        return this._formatter.setContentMessage(msg);
      },
      system: function(msg) {
        return this._formatter.setContentMessage(msg);
      },
      notice: function(msg) {
        this._formatter.addStyle('notice-group');
        return this._formatter.setContentMessage(msg);
      },
      welcome: function(msg) {
        this._formatter.addStyle('group');
        return this._formatter.setContentMessage(msg);
      },
      /*
           * Generic messages - usually boring server stuff like MOTD.
      */

      other: function(cmd) {
        this._formatter.addStyle('group');
        return this._formatter.setContentMessage(cmd.params[cmd.params.length - 1]);
      },
      nickinuse: function(taken, wanted) {
        var msg;
        this._formatter.addStyle('notice');
        msg = "Nickname " + taken + " already in use.";
        if (wanted) {
          msg += " Trying to get nickname " + wanted + ".";
        }
        return this._formatter.setMessage(msg);
      },
      away: function(msg) {
        this._chat.updateStatus();
        this._formatter.addStyle('notice');
        return this._formatter.setContentMessage(msg);
      },
      kill: function(from, to, msg) {
        this._formatter.addStyle('notice');
        /*
               * TODO: We can't use 'from' or 'msg' because they are not being properly
               * parsed by irc.util.parseCommand().
        */

        return this._formatter.setMessage("Kill command used on #to");
      },
      socket_error: function(errorCode) {
        this._formatter.addStyle('error');
        this._formatter.setToUs(true);
        switch (errorCode) {
          case -15:
            return this._formatter.setMessage('Disconnected: Remote host closed socket');
          default:
            return this._formatter.setMessage("Socket Error: " + errorCode);
        }
      }
    };

    IRCMessageHandler.prototype._getModeMessage = function(mode) {
      var post, pre;
      pre = mode[0] === '+' ? 'gave' : 'took';
      post = mode[0] === '+' ? 'to' : 'from';
      mode = this._getMode(mode);
      return "" + pre + " " + mode + " " + post;
    };

    IRCMessageHandler.prototype._getMode = function(mode) {
      switch (mode[1]) {
        case 'o':
          return 'channel operator status';
        case 'O':
          return 'local operator status';
        case 'v':
          return 'voice';
        case 'i':
          return 'invisible status';
        case 'w':
          return 'wall operator status';
        case 'a':
          return 'away status';
        default:
          return mode;
      }
    };

    IRCMessageHandler.prototype._getUserAction = function(msg) {
      return /^\u0001ACTION (.*)\u0001/.exec(msg);
    };

    IRCMessageHandler.prototype._handleMention = function(from, msg) {
      var nickMentioned, _ref1, _ref2;
      nickMentioned = this._nickWasMentioned(from, msg);
      if (nickMentioned) {
        this._chat.recordLastUserToMention(this._win.getContext(), from);
        if (!this._win.isPrivate()) {
          this._formatter.addStyle('mention');
        }
        if (this._shouldNotifyMention()) {
          this._createNotification(from, msg);
        }
      }
      if (!this._isFromWindowInFocus()) {
        this._chat.channelDisplay.activity((_ref1 = this._win.conn) != null ? _ref1.name : void 0, this._win.target);
        if (nickMentioned) {
          return this._chat.channelDisplay.mention((_ref2 = this._win.conn) != null ? _ref2.name : void 0, this._win.target);
        }
      }
    };

    IRCMessageHandler.prototype._createNotification = function(from, msg) {
      var notification, win,
        _this = this;
      win = this._win;
      notification = new chat.NickMentionedNotification(win.target, from, msg);
      win.notifications.add(notification);
      return win.notifications.on('clicked', function() {
        var _base;
        _this._chat.switchToWindow(win);
        return typeof (_base = chrome.app.window.current()).focus === "function" ? _base.focus() : void 0;
      });
    };

    IRCMessageHandler.prototype._nickWasMentioned = function(from, msg) {
      var nick, _ref1;
      nick = (_ref1 = this._win.conn) != null ? _ref1.irc.nick : void 0;
      if (this._isOwnNick(from)) {
        return false;
      }
      if (this._formatter.hasStyle('notice')) {
        return false;
      }
      if (this._formatter.hasStyle('direct')) {
        return false;
      }
      if (this._win.isPrivate()) {
        return true;
      }
      return chat.NickMentionedNotification.shouldNotify(nick, msg);
    };

    IRCMessageHandler.prototype._shouldNotifyMention = function() {
      return !this._isFromWindowInFocus() || !window.document.hasFocus();
    };

    IRCMessageHandler.prototype._isFromWindowInFocus = function() {
      return this._win.equals(this._chat.currentWindow);
    };

    IRCMessageHandler.prototype._formatPrivateMessage = function(from, msg) {
      var m;
      this._formatter.setMessage('#content');
      this._formatter.setPrettyFormat(false);
      if (m = this._getUserAction(msg)) {
        this._formatter.setContent("" + from + " " + m[1]);
        return this._formatter.addStyle('action');
      } else {
        if (this._formatter.hasStyle('notice')) {
          this.source = "-" + from + "-";
        } else if (this._formatter.hasStyle('direct')) {
          this.source = ">" + from + "<";
        } else {
          this.source = from;
        }
        return this._formatter.setContent(msg);
      }
    };

    IRCMessageHandler.prototype._sendFormattedMessage = function() {
      if (!this._formatter.hasMessage() || this._shouldIgnoreMessage(this._win.getContext(), this.type)) {
        return;
      }
      this._formatter.addStyle(this.type);
      return this._win.message(this.source, this._formatter.format(), this._formatter.getStyle());
    };

    IRCMessageHandler.prototype._shouldIgnoreMessage = function(context, type) {
      var _ref1;
      return (_ref1 = this._ignoredMessages[context]) != null ? _ref1[type] : void 0;
    };

    IRCMessageHandler.prototype._isOwnNick = function(nick) {
      var _ref1;
      return (_ref1 = this._win.conn) != null ? _ref1.irc.isOwnNick(nick) : void 0;
    };

    return IRCMessageHandler;

  })(MessageHandler);

  exports.IRCMessageHandler = IRCMessageHandler;

}).call(this);
