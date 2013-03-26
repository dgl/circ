// Generated by CoffeeScript 1.4.0
(function() {
  var MessageRenderer, exports, _base, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  exports = (_ref = (_base = ((_ref1 = window.chat) != null ? _ref1 : window.chat = {})).window) != null ? _ref : _base.window = {};

  /*
   * Handles outputing text to the window and provides functions to display
   * some specific messages like help and about.
   */


  MessageRenderer = (function() {

    MessageRenderer.PROJECT_URL = "http://flackr.github.com/circ";

    // The max number of messages a room can display at once.
    MessageRenderer.MAX_MESSAGES = 3500;

    function MessageRenderer(win) {
      this.win = win;
      this.systemMessage = __bind(this.systemMessage, this);

      this._userSawMostRecentMessage = false;
      this._activityMarkerLocation = void 0;
      this._helpMessageRenderer = new exports.HelpMessageRenderer(this.systemMessage);
    }

    MessageRenderer.prototype.onFocus = function() {
      return this._userSawMostRecentMessage = this.win.$messages.children().length > 0;
    };

    MessageRenderer.prototype.displayWelcome = function() {
      this._addWhitespace();
      this.systemMessage("Welcome to CIRC!");
      return this.systemMessage(this._getWebsiteBlurb());
    };

    /*
     * Display available commands, grouped by category.
     * @param {Object.<string: {category: string}>} commands
     */
    MessageRenderer.prototype.displayHelp = function(commands) {
      return this._helpMessageRenderer.render(commands);
    };

    MessageRenderer.prototype.displayHotkeys = function(hotkeys) {
      return this._helpMessageRenderer.renderHotkeys(hotkeys);
    };

    MessageRenderer.prototype.displayAbout = function() {
      this._addWhitespace();
      this.systemMessage("CIRC is a packaged Chrome app developed by Google Inc. " + this._getWebsiteBlurb(), 'notice about');
      this.systemMessage("Version: " + irc.VERSION, 'notice about');
      this.systemMessage("Contributors:", 'notice about group');
      this.systemMessage("    * Icon by Michael Cook (themichaelcook@gmail.com)", 'notice about group');
      return this.systemMessage("    * UI mocks by Fravic Fernando (fravicf@gmail.com)", 'notice about group');
    };

    MessageRenderer.prototype._getWebsiteBlurb = function() {
      return "Documentation, issues and source code live at " + ("" + MessageRenderer.PROJECT_URL + ".");
    };

    /*
     * Display content and the source it was from with the given style.
     * @param {string} from
     * @param {string} msg
     * @param {string...} style
     */
    MessageRenderer.prototype.message = function(from, msg, styles) {
      from = from || '';
      msg = msg || '';
      var style = __slice.call(arguments, 2);
      var isHelpMessage = styles && styles.split(' ').indexOf('help') != -1;
      var fromNode = this._createSourceFromText(from);
      var msgNode = this._createContentFromText(msg, /* allowHtml */ isHelpMessage);
      style = style.join(' ');
      this.rawMessage(fromNode, msgNode, style);
      if (this._shouldUpdateActivityMarker()) {
        return this._updateActivityMarker();
      }
    };

    MessageRenderer.prototype._createContentFromText = function(msg, allowHtml) {
      if (!msg) {
        return '';
      }
      var node = $('<span>');
      node.html(html.display(msg, allowHtml));
      return node;
    };

    MessageRenderer.prototype._createSourceFromText = function(from) {
      var node;
      if (!from) {
        return '';
      }
      node = $('<span>');
      node.text(from);
      return node;
    };

    /*
     * Display a system message to the user. A system message has no from field.
     */
    MessageRenderer.prototype.systemMessage = function(msg, style) {
      if (msg == null) {
        msg = '';
      }
      if (style == null) {
        style = 'system';
      }
      return this.message('', msg, style);
    };

    /*
     * Display a message without escaping the from or msg fields.
     */
    MessageRenderer.prototype.rawMessage = function(from, msg, style) {
      var message;
      message = this._createMessageHTML(from, msg, style);
      this.win.emit('message', this.win.getContext(), style, message[0].outerHTML);
      this.win.$messages.append(message);
      this.win.$messagesContainer.restoreScrollPosition();
      return this._trimMessagesIfTooMany();
    };

    MessageRenderer.prototype._createMessageHTML = function(from, msg, style) {
      var message;
      message = $('#templates .message').clone();
      message.addClass(style);
      $('.source', message).append(from);
      $('.content', message).append(msg);
      if (!(typeof from.text === "function" ? from.text() : void 0)) {
        $('.source', message).addClass('empty');
      }
      return message;
    };

    /*
     * Trim chat messages when there are too many in order to save on memory.
     */
    MessageRenderer.prototype._trimMessagesIfTooMany = function() {
      var i, messages, _i, _results;
      messages = this.win.$messagesContainer.children().children();
      if (!(messages.length > MessageRenderer.MAX_MESSAGES)) {
        return;
      }
      _results = [];
      for (i = _i = 0; _i <= 19; i = ++_i) {
        _results.push(messages[i].remove());
      }
      return _results;
    };

    MessageRenderer.prototype._addWhitespace = function() {
      return this.message();
    };

    /*
     * Update the activity marker when the user has seen the most recent messages
     * and then received a message while the window wasn't focused.
     */
    MessageRenderer.prototype._shouldUpdateActivityMarker = function() {
      return !this.win.isFocused() && this._userSawMostRecentMessage;
    };

    MessageRenderer.prototype._updateActivityMarker = function() {
      this._userSawMostRecentMessage = false;
      if (this._activityMarkerLocation) {
        this._activityMarkerLocation.removeClass('activity-marker');
      }
      this._activityMarkerLocation = this.win.$messages.children().last();
      return this._activityMarkerLocation.addClass('activity-marker');
    };

    return MessageRenderer;

  })();

  exports.MessageRenderer = MessageRenderer;

}).call(this);
