/**
 * @param {(HTMLElement|string)} v
 * @param {?} dataAndEvents
 * @return {undefined}
 */
function TopAudioPlayer(v, dataAndEvents) {
  this.ap = getAudioPlayer();
  /** @type {(HTMLElement|string)} */
  this._el = v;
  this._playIconBtn = ge("top_audio");
  this.init();
}
/**
 * @param {Object} value
 * @param {?} key
 * @param {number} dataAndEvents
 * @return {?}
 */
function AudioPlaylist(value, key, dataAndEvents) {
  if (this.constructor != AudioPlaylist) {
    throw new Error("AudioPlaylist was called without 'new' operator");
  }
  getAudioPlayer().addPlaylist(this);
  var msg = {};
  return value && isFunction(value.getId) ? (this._ref = value, void getAudioPlayer().addPlaylist(this)) : (isObject(value) ? msg = value : (msg.ownerId = key, msg.type = value, msg.albumId = dataAndEvents || ++AudioPlaylist.plIndex), this._type = msg.type, this._ownerId = msg.ownerId || vk.id, this._albumId = msg.albumId || 0, this._list = [], this.mergeWith(msg), this);
}
/**
 * @return {undefined}
 */
function AudioPlayer() {
  if (this._currentAudio = false, this._isPlaying = false, this._prevPlaylist = null, this._currentPlaylist = null, this._playlists = [], this.subscribers = [], this._tasks = [], this._listened = {}, this._statusExport = {}, this._currentPlayingRows = [], this._allowPrefetchNext = false, !vk.isBanned) {
    this._initImpl();
    this._initEvents();
    this._restoreVolumeState();
    var self = this;
    setTimeout(function() {
      self._restoreState();
      AudioUtils.toggleAudioHQBodyClass();
      self.updateCurrentPlaying();
    });
  }
}
/**
 * @param {Object} opts
 * @return {undefined}
 */
function AudioPlayerFlash(opts) {
  this.opts = opts || {};
  window._flashAudioInstance = this;
}
/**
 * @param {Object} opts
 * @return {undefined}
 */
function AudioPlayerHTML5(opts) {
  this.opts = opts || {};
  /** @type {Array} */
  this._audioNodes = [];
  this._currentAudioEl = this._createAudioNode();
  this._prefetchAudioEl = this._createAudioNode();
}
var AudioUtils = {
  AUDIO_ITEM_INDEX_ID : 0,
  AUDIO_ITEM_INDEX_OWNER_ID : 1,
  AUDIO_ITEM_INDEX_URL : 2,
  AUDIO_ITEM_INDEX_TITLE : 3,
  AUDIO_ITEM_INDEX_PERFORMER : 4,
  AUDIO_ITEM_INDEX_DURATION : 5,
  AUDIO_ITEM_INDEX_ALBUM_ID : 6,
  AUDIO_ITEM_INDEX_AUTHOR_LINK : 8,
  AUDIO_ITEM_INDEX_LYRICS : 9,
  AUDIO_ITEM_INDEX_FLAGS : 10,
  AUDIO_ITEM_INDEX_CONTEXT : 11,
  AUDIO_ITEM_INDEX_EXTRA : 12,
  AUDIO_ITEM_INDEX_ACT_HASH : 13,
  AUDIO_ITEM_INLINED_BIT : 1,
  AUDIO_ITEM_CLAIMED_BIT : 16,
  AUDIO_ITEM_RECOMS_BIT : 64,
  AUDIO_ITEM_TOP_BIT : 1024,
  AUDIO_ENOUGH_LOCAL_SEARCH_RESULTS : 500,
  AUDIO_PLAYING_CLS : "audio_row_playing",
  AUDIO_CURRENT_CLS : "audio_row_current",
  AUDIO_LAYER_HEIGHT : 550,
  AUDIO_LAYER_MIN_WIDTH : 400,
  AUDIO_LAYER_MAX_WIDTH : 1E3,
  AUDIO_HQ_LABEL_CLS : "audio_hq_label_show",
  /**
   * @return {undefined}
   */
  toggleAudioHQBodyClass : function() {
    var valid = getAudioPlayer().showHQLabel();
    toggleClass(document.body, AudioUtils.AUDIO_HQ_LABEL_CLS, valid);
  },
  /**
   * @return {?}
   */
  hasAudioHQBodyClass : function() {
    return hasClass(document.body, AudioUtils.AUDIO_HQ_LABEL_CLS);
  },
  /**
   * @return {undefined}
   */
  showNeedFlashBox : function() {
    var rootJsModule = getLang("global_audio_flash_required").replace("{link}", '<a target=_blank href="https://get.adobe.com/flashplayer">').replace("{/link}", "</a>");
    (new MessageBox({
      title : getLang("audio_need_flash_title")
    })).content(rootJsModule).setButtons("Ok", function() {
      curBox().hide();
    }).show();
  },
  /**
   * @return {?}
   */
  getAddRestoreInfo : function() {
    return cur._audioAddRestoreInfo = cur._audioAddRestoreInfo || {}, cur._audioAddRestoreInfo;
  },
  /**
   * @param {Array} id
   * @return {undefined}
   */
  addAudio : function(id) {
    /**
     * @return {?}
     */
    function setTopUpMode() {
      return intval(domData(node, "in-progress"));
    }
    /**
     * @param {boolean} recurring
     * @return {?}
     */
    function addTimer(recurring) {
      return domData(node, "in-progress", intval(recurring));
    }
    var node = gpeByClass("_audio_row", id);
    if (!setTopUpMode()) {
      addTimer(true);
      var b = window.AudioPage && AudioPage(node);
      var bup = b && (b.options.oid < 0 && b.options.canAudioAddToGroup);
      /** @type {number} */
      var gid = bup ? -b.options.oid : 0;
      var ui = AudioUtils.getAudioFromEl(node, true);
      var hash = vk.audioParams.addHash;
      var top = vk.audioParams.deleteHash;
      var settings = AudioUtils.getAddRestoreInfo();
      var view = settings[ui.fullId];
      var current = ge("audio_" + ui.fullId);
      current = current == node ? false : current;
      var navi = b && b.getCurrentPlaylist();
      var options = (intval(ui.isTop), intval(b && b.getCurrentPlaylist().getType() == AudioPlaylist.TYPE_SEARCH), {
        act : "add",
        gid : gid,
        oid : ui.ownerId,
        aid : ui.id,
        hash : hash
      });
      if (navi) {
        var url = navi.getAlbumId();
        switch(options.from = navi.getType(), navi.getType()) {
          case AudioPlaylist.TYPE_RECOM:
            if (isString(url)) {
              if (0 == url.indexOf("album")) {
                /** @type {string} */
                options.recommendation_type = "album";
              }
              if (0 == url.indexOf("audio")) {
                /** @type {string} */
                options.recommendation_type = "query";
              }
            }
            break;
          case AudioPlaylist.TYPE_POPULAR:
            options.top_genre = url;
            break;
          case AudioPlaylist.TYPE_FEED:
          ;
        }
      }
      if (view) {
        if ("recom_hidden" == view.state) {
          if (b) {
            b.restoreRecommendation(node);
            addTimer(false);
          }
        } else {
          if ("deleted" == view.state) {
            ajax.post("al_audio.php", {
              act : "restore_audio",
              oid : ui.ownerId,
              aid : ui.id,
              hash : hash
            }, {
              /**
               * @return {undefined}
               */
              onDone : function() {
                addTimer(false);
              }
            });
            removeClass(node, "audio_deleted");
            removeClass(node, "canadd");
            addClass(node, "canedit");
            delete cur._audioAddRestoreInfo[ui.fullId];
          } else {
            if ("added" == view.state) {
              var buf = view.addedFullId.split("_");
              ajax.post("al_audio.php", {
                act : "delete_audio",
                oid : buf[0],
                aid : buf[1],
                hash : top
              }, {
                /**
                 * @return {undefined}
                 */
                onDone : function() {
                  if (b) {
                    var domStyle = getAudioPlayer().getPlaylist(AudioPlaylist.TYPE_ALBUM, gid ? -gid : vk.id, AudioPlaylist.ALBUM_ALL);
                    domStyle.removeAudio(view.addedFullId);
                  }
                  addTimer(false);
                }
              });
              removeClass(node, "added");
              addClass(node, "canadd");
              if (current) {
                removeClass(current, "added");
                addClass(current, "canadd");
              }
              delete cur._audioAddRestoreInfo[ui.fullId];
              getAudioPlayer().notify(AudioPlayer.EVENT_REMOVED, ui.fullId, view.addedFullId);
            }
          }
        }
      } else {
        ajax.post("al_audio.php", options, {
          /**
           * @param {Array} f
           * @param {?} isError
           * @param {?} err
           * @param {?} listener
           * @return {undefined}
           */
          onDone : function(f, isError, err, listener) {
            if (f) {
              var addedFullId = f[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] + "_" + f[AudioUtils.AUDIO_ITEM_INDEX_ID];
              if (settings[ui.fullId] = {
                state : "added",
                addedFullId : addedFullId
              }, b) {
                var mm = getAudioPlayer().getPlaylist(AudioPlaylist.TYPE_ALBUM, gid ? -gid : vk.id, AudioPlaylist.ALBUM_ALL);
                mm.addAudio(f, 0);
              }
            }
            addTimer(false);
          }
        });
        removeClass(node, "canadd");
        addClass(node, "added");
        if (current) {
          removeClass(current, "canadd");
          addClass(current, "added");
        }
        getAudioPlayer().notify(AudioPlayer.EVENT_ADDED, ui.fullId);
      }
    }
  },
  /**
   * @param {Element} check
   * @param {Event} evt
   * @param {?} oid
   * @param {?} deepDataAndEvents
   * @param {boolean} id
   * @param {string} hash
   * @param {string} dataAndEvents
   * @return {undefined}
   */
  addAudioFromChooseBox : function(check, evt, oid, deepDataAndEvents, id, hash, dataAndEvents) {
    var CTRL = evt.ctrlKey;
    /** @type {string} */
    check.innerHTML = "";
    showProgress(check);
    ajax.post("al_audio.php", {
      act : "add",
      gid : id,
      oid : oid,
      aid : deepDataAndEvents,
      hash : hash
    }, {
      /**
       * @param {Array} file
       * @param {?} isError
       * @param {?} err
       * @param {?} listener
       * @return {undefined}
       */
      onDone : function(file, isError, err, listener) {
        var camelKey = id ? -id : vk.id;
        if (file) {
          var data = getAudioPlayer().getPlaylist(AudioPlaylist.TYPE_ALBUM, camelKey, AudioPlaylist.ALBUM_ALL);
          data.addAudio(file, 0);
          if (cur.audioPage) {
            cur.audioPage.switchToSection(data);
          }
        }
        if (CTRL) {
          hideProgress(check);
          domReplaceEl(check, '<span class="choose_link audio_choose_added_label">' + dataAndEvents + "</span>");
        } else {
          for (;__bq.count();) {
            __bq.hideLast();
          }
        }
        nav.go("audios" + camelKey);
      }
    });
  },
  /**
   * @param {Node} p
   * @param {Object} that
   * @param {Object} event
   * @return {undefined}
   */
  chooseAudioBox : function(p, that, event) {
    if (window.event = window.event || event, void 0 !== p.selected) {
      cur.lastAddMedia.unchooseMedia(p.selected);
      p.selected = void 0;
      removeClass(domPN(p), "audio_selected");
      p.innerHTML = that.labels.add;
    } else {
      var o = cur.attachCount && cur.attachCount() || 0;
      cur.chooseMedia("audio", that.owner_id + "_" + that.id, that.info);
      if (!cur.attachCount || cur.attachCount() > o) {
        if (cur.lastAddMedia) {
          /** @type {number} */
          p.selected = cur.lastAddMedia.chosenMedias.length - 1;
          addClass(domPN(p), "audio_selected");
          p.innerHTML = that.labels.cancel;
        }
      }
    }
    window.event = void 0;
  },
  /**
   * @param {?} item
   * @param {?} message
   * @return {?}
   */
  drawAudio : function(item, message) {
    /** @type {*} */
    var defined = JSON.parse(getTemplate("audio_bits_to_cls"));
    var callback = item[AudioUtils.AUDIO_ITEM_INDEX_FLAGS];
    /** @type {Array} */
    var args = [];
    /** @type {number} */
    var l = 0;
    for (;32 > l;l++) {
      /** @type {number} */
      var dep = 1 << l;
      if (callback & dep) {
        args.push(defined[dep]);
      }
    }
    if (message) {
      args.push(message);
    }
    var toc = formatTime(item[AudioUtils.AUDIO_ITEM_INDEX_DURATION]);
    var data = clean(JSON.stringify(item)).split("$").join("$$");
    var template = getTemplate("audio_row", item);
    return template = template.replace(/%cls%/, args.join(" ")), template = template.replace(/%duration%/, toc), template = template.replace(/%serialized%/, data);
  },
  /**
   * @param {string} a
   * @return {?}
   */
  isRecomAudio : function(a) {
    return a = AudioUtils.asObject(a), a.flags & AudioUtils.AUDIO_ITEM_RECOMS_BIT;
  },
  /**
   * @param {string} state
   * @return {?}
   */
  isClaimedAudio : function(state) {
    return state = AudioUtils.asObject(state), state.flags & AudioUtils.AUDIO_ITEM_CLAIMED_BIT;
  },
  /**
   * @param {Object} response
   * @return {?}
   */
  getAudioExtra : function(response) {
    return response = AudioUtils.asObject(response), JSON.parse(response.extra || "{}");
  },
  /**
   * @param {?} event
   * @param {boolean} dataAndEvents
   * @return {?}
   */
  getAudioFromEl : function(event, dataAndEvents) {
    var result = data(event, "audio");
    return result || (result = JSON.parse(domData(event, "audio"))), dataAndEvents ? AudioUtils.asObject(result) : result;
  },
  /**
   * @param {string} node
   * @return {undefined}
   */
  showAudioLayer : function(node) {
    /**
     * @param {string} str
     * @param {string} timeout
     * @param {Object} next
     * @param {Object} deepDataAndEvents
     * @param {?} chunk
     * @return {undefined}
     */
    function update(str, timeout, next, deepDataAndEvents, chunk) {
      eval(chunk);
      var div = self.layer.getContent();
      addClass(div, "no_transition");
      removeClass(div, "top_audio_loading");
      /** @type {string} */
      div.innerHTML = str;
      var el = geByClass1("audio_layer_rows_wrap", div);
      setStyle(el, "height", AudioUtils.AUDIO_LAYER_HEIGHT);
      next.layer = self.layer;
      next.layer.sb = new Scrollbar(el, {
        nomargin : true,
        right : vk.rtl ? "auto" : 0,
        left : vk.rtl ? 0 : "auto",
        global : true,
        nokeys : true,
        scrollElements : [geByClass1("audio_layer_menu_wrap", div)]
      });
      data(el, "sb", next.layerScrollbar);
      var waitsFunc = new AudioPage(geByClass1("_audio_layout", div), timeout, next, deepDataAndEvents);
      data(self.layer, "audio-page", waitsFunc);
      setTimeout(function() {
        removeClass(div, "no_transition");
      });
    }
    /**
     * @return {?}
     */
    function scrollTop() {
      return geByClass1("_im-page-wrap") || ge("page_body");
    }
    /**
     * @return {?}
     */
    function position() {
      return Math.max(AudioUtils.AUDIO_LAYER_MIN_WIDTH, Math.min(AudioUtils.AUDIO_LAYER_MAX_WIDTH, getSize(scrollTop())[0] - max));
    }
    /**
     * @return {?}
     */
    function appendModelPrefix() {
      var el = geByClass1("_top_nav_audio_btn");
      return hasClass(el, "top_audio_player_enabled") && (el = geByClass1("top_audio_player")), el;
    }
    var self = getAudioPlayer();
    var my = self.getCurrentPlaylist();
    if (self.layer) {
      if (self.layer.isShown()) {
        self.layer.hide();
        cancelStackFilter("top_audio", true);
      } else {
        self.layer.show();
        var throttledUpdate = data(self.layer, "init-func");
        if (throttledUpdate) {
          data(self.layer, "init-func", null);
          throttledUpdate();
        } else {
          var o = data(self.layer, "audio-page");
          if (o) {
            o.onShow();
          }
        }
        addClass(node, "active");
        cancelStackPush("top_audio", function() {
          self.layer.hide();
        }, true);
      }
    } else {
      /** @type {number} */
      var max = 2;
      self.layer = new ElementTooltip(node, {
        delay : 0,
        content : rs(vk.pr_tpl, {
          id : "",
          cls : "pr_big"
        }),
        cls : "top_audio_loading top_audio_layer",
        autoShow : false,
        appendTo : document.body,
        elClassWhenTooltip : "audio_top_btn_active",
        forceSide : "bottom",
        /**
         * @param {?} ci
         * @param {?} v
         * @return {undefined}
         */
        onHide : function(ci, v) {
          o = data(self.layer, "audio-page");
          if (o) {
            o.onHide();
          }
          removeClass(node, "active");
          if (v) {
            cancelStackFilter("top_audio", true);
          }
        },
        /** @type {function (): ?} */
        width : position,
        /**
         * @param {?} pos
         * @return {?}
         */
        setPos : function(pos) {
          var idx = this.isShown();
          var intVertices = getXY(scrollTop());
          /** @type {number} */
          var n = getSize(scrollTop())[0] - max;
          var newPosition = position();
          var fullOtherName = appendModelPrefix();
          var x = getXY(fullOtherName)[0];
          var width = getSize(fullOtherName)[0];
          var xm = x + width / 2;
          var delta = idx ? pos.left : xm - newPosition / 2;
          if (n <= AudioUtils.AUDIO_LAYER_MAX_WIDTH) {
            if (n >= AudioUtils.AUDIO_LAYER_MIN_WIDTH) {
              delta = intVertices[0];
            }
          }
          /** @type {number} */
          var olen = 37;
          /** @type {number} */
          var originalLeft_ = x - delta + Math.min(width / 2, olen) - 2;
          return setPseudoStyle(this.getContent(), "after", {
            left : originalLeft_ + "px"
          }), {
            left : delta,
            top : getSize(ge("page_header_cont"))[1],
            position : "fixed"
          };
        }
      });
      self.layer.show();
      addClass(node, "active");
      ajax.post("al_audio.php", {
        act : "show_layer",
        my : my ? 0 : 1
      }, {
        /**
         * @param {string} category
         * @param {?} size
         * @param {Object} done
         * @param {Object} deepDataAndEvents
         * @param {?} doc
         * @return {undefined}
         */
        onDone : function(category, size, done, deepDataAndEvents, doc) {
          var i = size;
          if (self.layer.isShown()) {
            update(category, i, done, deepDataAndEvents, doc);
          } else {
            data(self.layer, "init-func", update.pbind(category, i, done, deepDataAndEvents, doc));
          }
        }
      });
      cancelStackPush("top_audio", function() {
        self.layer.hide();
      }, true);
    }
  },
  /**
   * @param {Object} file
   * @return {undefined}
   */
  filterClaimedAudios : function(file) {
    file.list = file.list.filter(function(dataAndEvents) {
      return!(intval(dataAndEvents[AudioUtils.AUDIO_ITEM_INDEX_FLAGS]) & AudioUtils.AUDIO_ITEM_CLAIMED_BIT);
    });
  },
  /**
   * @param {?} dataAndEvents
   * @return {?}
   */
  prepareAudioForPlaylist : function(dataAndEvents) {
    return dataAndEvents[AudioUtils.AUDIO_ITEM_INDEX_TITLE] = clean(replaceEntities(dataAndEvents[AudioUtils.AUDIO_ITEM_INDEX_TITLE]).replace(/(<em>|<\/em>)/g, "")), dataAndEvents[AudioUtils.AUDIO_ITEM_INDEX_PERFORMER] = clean(replaceEntities(dataAndEvents[AudioUtils.AUDIO_ITEM_INDEX_PERFORMER]).replace(/(<em>|<\/em>)/g, "")), dataAndEvents[AudioUtils.AUDIO_ITEM_INDEX_FLAGS] &= ~AudioUtils.AUDIO_ITEM_INLINED_BIT, dataAndEvents;
  },
  /**
   * @param {Object} packages
   * @return {undefined}
   */
  unsetInlineFlagForPlaylist : function(packages) {
    /** @type {number} */
    var i = 0;
    var l = packages.list.length;
    for (;l > i;i++) {
      packages.list[i] = AudioUtils.prepareAudioForPlaylist(packages.list[i]);
    }
  },
  /**
   * @param {string} result
   * @return {?}
   */
  asObject : function(result) {
    return result ? isObject(result) ? result : "string" == typeof result ? {
      id : result
    } : {
      id : intval(result[AudioUtils.AUDIO_ITEM_INDEX_ID]),
      owner_id : intval(result[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID]),
      ownerId : result[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID],
      fullId : result[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] + "_" + result[AudioUtils.AUDIO_ITEM_INDEX_ID],
      title : result[AudioUtils.AUDIO_ITEM_INDEX_TITLE],
      performer : result[AudioUtils.AUDIO_ITEM_INDEX_PERFORMER],
      duration : intval(result[AudioUtils.AUDIO_ITEM_INDEX_DURATION]),
      lyrics : intval(result[AudioUtils.AUDIO_ITEM_INDEX_LYRICS]),
      url : result[AudioUtils.AUDIO_ITEM_INDEX_URL],
      flags : result[AudioUtils.AUDIO_ITEM_INDEX_FLAGS],
      context : result[AudioUtils.AUDIO_ITEM_INDEX_CONTEXT],
      extra : result[AudioUtils.AUDIO_ITEM_INDEX_EXTRA],
      isTop : result[AudioUtils.AUDIO_ITEM_INDEX_FLAGS] & AudioUtils.AUDIO_ITEM_TOP_BIT,
      actHash : result[AudioUtils.AUDIO_ITEM_INDEX_ACT_HASH]
    } : null;
  },
  /**
   * @param {Array} a
   * @param {Array} r
   * @return {?}
   */
  initDomPlaylist : function(a, r) {
    /** @type {Array} */
    var code = (getAudioPlayer(), []);
    return each(r, function(dataAndEvents, tr) {
      if (tr) {
        each(geByClass("_audio_row", tr), function(dataAndEvents) {
          code.push(AudioUtils.getAudioFromEl(this));
        });
      }
    }), a.addAudio(code), a;
  },
  /**
   * @param {?} clicked
   * @return {?}
   */
  getContextPlaylist : function(clicked) {
    /**
     * @param {Array} range
     * @return {?}
     */
    function fn(range) {
      return[].slice.call(range);
    }
    /** @type {null} */
    var f = null;
    /** @type {Array} */
    var r = [];
    var assert = getAudioPlayer();
    /** @type {number} */
    var deepDataAndEvents = 0;
    var udataCur = AudioUtils.getAudioFromEl(clicked, true);
    /** @type {null} */
    var mainfile = null;
    var slashSplit = gpeByClass("_audio_playlist", clicked);
    if (slashSplit) {
      return f = data(slashSplit, "playlist");
    }
    if (!cur.pid && (inArray(cur.module, ["public", "wall", "groups", "profile"]) && (mainfile = domClosest("_wall_audio_rows", clicked)))) {
      var elem = gpeByClass("_replies_list", clicked);
      if (elem) {
        /** @type {Array} */
        r = r.concat(fn([elem]));
      }
      /** @type {string} */
      var namespace = inArray(cur.wallType, ["own", "full_own"]) ? "own" : "all";
      if (deepDataAndEvents = hashCode(namespace + "_" + (cur.wallQuery || "")), f = assert.getPlaylist(AudioPlaylist.TYPE_WALL, cur.oid, deepDataAndEvents), -1 == f.indexOfAudio(udataCur)) {
        f.clean();
        var parentNode = gpeByClass("_post", clicked);
        var id = domData(parentNode, "post-id");
        id = id ? id.split("_")[1] : false;
        var result = cur.wallQuery;
        var radixToPower = ge("wall_search");
        if ("wall" == cur.module) {
          if (val(radixToPower)) {
            result = val(radixToPower);
          }
        }
        if (id) {
          f.mergeWith({
            postId : id,
            wallQuery : result,
            wallType : namespace
          });
        } else {
          /** @type {null} */
          f = null;
        }
      }
      /** @type {Array} */
      r = r.concat(fn([mainfile]));
    } else {
      if (mainfile = domClosest("choose_audio_rows", clicked)) {
        cur.chooseAudioPlaylist = f = new AudioPlaylist(AudioPlaylist.TYPE_TEMP, vk.id, irand(999, 99999));
        /** @type {Array} */
        r = [mainfile];
      } else {
        if (mainfile = domClosest("_im_peer_history", clicked)) {
          r = fn(geByClass("_im_mess", mainfile));
        } else {
          if (mainfile = domClosest("replies_list", clicked)) {
            r = fn(geByClass("wall_audio_rows", mainfile));
          } else {
            if (mainfile = domClosest("_bt_rows", clicked)) {
              r = fn(geByClass("_wall_audio_rows", mainfile));
            } else {
              if (mainfile = domClosest("_feed_rows", clicked)) {
                r = fn(geByClass("wall_text", mainfile));
                /** @type {string} */
                deepDataAndEvents = "feed";
              } else {
                if ((mainfile = domClosest("wall_posts", clicked)) && !domClosest("wall_tt", clicked)) {
                  r = fn(geByClass("wall_text", mainfile));
                  var i = geByClass1("post_fixed");
                  if (i) {
                    r.unshift(geByClass1("wall_text", i));
                  }
                } else {
                  if (mainfile = gpeByClass("_module", clicked)) {
                    f = assert.getPlaylist(AudioPlaylist.TYPE_ALBUM, cur.oid, AudioPlaylist.ALBUM_ALL);
                    /** @type {Array} */
                    r = [mainfile];
                  } else {
                    /** @type {Array} */
                    r = [domPN(clicked)];
                  }
                }
              }
            }
          }
        }
      }
    }
    return f || (f = assert.getPlaylist(AudioPlaylist.TYPE_TEMP, vk.id, deepDataAndEvents)), f = AudioUtils.initDomPlaylist(f, r), -1 == f.indexOfAudio(udataCur) && (f = new AudioPlaylist(AudioPlaylist.TYPE_TEMP, vk.id, irand(999, 99999)), f = AudioUtils.initDomPlaylist(f, [domPN(clicked)])), f.load(), f;
  }
};
TopAudioPlayer.TITLE_CHANGE_ANIM_SPEED = 190, TopAudioPlayer.init = function() {
  var key = ge("top_audio_player");
  var camelKey = data(key, "object");
  if (!camelKey) {
    camelKey = new TopAudioPlayer(key);
    data(key, "object", camelKey);
  }
}, TopAudioPlayer.prototype.init = function() {
  /**
   * @param {?} e
   * @return {?}
   */
  function onClick(e) {
    return hasClass(this, "top_audio_player_play") ? (self.ap.isPlaying() ? self.ap.pause() : self.ap.play(), false) : hasClass(this, "top_audio_player_prev") ? (self.ap.playPrev(), false) : hasClass(this, "top_audio_player_next") ? (self.ap.playNext(), false) : void 0;
  }
  var self = this;
  this.ap.on(this, AudioPlayer.EVENT_UPDATE, this.onPlay.bind(this));
  this.ap.on(this, AudioPlayer.EVENT_PLAY, this.onPlay.bind(this));
  this.ap.on(this, AudioPlayer.EVENT_PAUSE, this.onPause.bind(this));
  this.ap.top = this;
  each(["prev", "play", "next"], function(deepDataAndEvents, dataAndEvents) {
    addEvent(geByClass1("top_audio_player_" + dataAndEvents, self._el), "click", onClick);
  });
  addEvent(this._el, "mousedown", function(event) {
    return cancelEvent(event), hasClass(domPN(event.target), "top_audio_player_btn") ? void 0 : 1 != event.which || (hasClass(event.target, "top_audio_player_btn") || hasClass(event.target, "top_audio_player_act_icon")) ? void 0 : showAudioLayer(event, ge("top_audio"));
  });
  this.onPlay(this.ap.getCurrentAudio());
}, TopAudioPlayer.prototype.onPlay = function(suite, id, duration) {
  /**
   * @return {undefined}
   */
  function update() {
    var container = getAudioPlayer();
    if (container.layer) {
      if (container.layer.isShown()) {
        container.layer.updatePosition();
      }
    }
    addClass(self._el, CHOSEN_CLASS);
    toggleClass(self._el, "top_audio_player_playing", container.isPlaying());
    suite = AudioUtils.asObject(suite);
    clearTimeout(self._currTitleReTO);
    var r20 = geByClass1("top_audio_player_title_out", self._el);
    re(r20);
    var node = geByClass1("top_audio_player_title", self._el);
    if (0 != duration) {
      /** @type {number} */
      var h = 0 > duration ? -10 : 10;
      var offX = node.offsetLeft;
      var el = se('<div class="top_audio_player_title top_audio_player_title_next" style="opacity: 0; top:' + h + "px; left: " + offX + 'px">' + suite.performer + " &ndash; " + suite.title + "</div>");
      el.setAttribute("onmouseover", "setTitle(this)");
      if (duration > 0) {
        domInsertAfter(el, node);
      } else {
        domInsertBefore(el, node);
      }
      addClass(node, "top_audio_player_title_out");
      setStyle(node, {
        top : -h,
        opacity : 0
      });
      setTimeout(function() {
        setStyle(el, {
          top : 0,
          opacity : 1
        });
      }, 1);
      clearTimeout(self._currTitleReTO);
      /** @type {number} */
      self._currTitleReTO = setTimeout(function() {
        re(node);
        removeClass(el, "top_audio_player_title_next");
      }, TopAudioPlayer.TITLE_CHANGE_ANIM_SPEED);
    } else {
      /** @type {string} */
      node.innerHTML = suite.performer + " &ndash; " + suite.title;
      /** @type {number} */
      node.titleSet = 0;
      node.setAttribute("onmouseover", "setTitle(this)");
    }
  }
  /** @type {string} */
  var CHOSEN_CLASS = "top_audio_player_enabled";
  if (!suite) {
    removeClass(this._playIconBtn, CHOSEN_CLASS);
    removeClass(this._el, CHOSEN_CLASS);
    removeClass(this._el, "top_audio_player_playing");
    show(this._playIconBtn);
    var evt = getAudioPlayer();
    return void(evt.layer && (evt.layer.isShown() && evt.layer.updatePosition()));
  }
  var self = this;
  duration = intval(duration);
  if (hasClass(this._playIconBtn, CHOSEN_CLASS)) {
    update();
  } else {
    addClass(this._playIconBtn, CHOSEN_CLASS);
    setTimeout(function() {
      hide(self._playIconBtn);
      update();
    }, 150);
  }
}, TopAudioPlayer.prototype.onPause = function() {
  removeClass(this._el, "top_audio_player_playing");
}, TopAudioPlayer.prototype.onNext = function() {
}, AudioPlaylist.plIndex = 0, AudioPlaylist.TYPE_CURRENT = "current", AudioPlaylist.TYPE_ALBUM = "album", AudioPlaylist.TYPE_TEMP = "temp", AudioPlaylist.TYPE_RECOM = "recoms", AudioPlaylist.TYPE_POPULAR = "popular", AudioPlaylist.TYPE_SEARCH = "search", AudioPlaylist.TYPE_FEED = "feed", AudioPlaylist.TYPE_LIVE = "live", AudioPlaylist.TYPE_WALL = "wall", AudioPlaylist.ALBUM_ALL = -2, AudioPlaylist.prototype.serialize = function() {
  var state = {};
  var val = getAudioPlayer().getCurrentAudio();
  /** @type {number} */
  var length = Math.max(0, this.indexOfAudio(val));
  return state.list = clone(this.getAudiosList().slice(Math.max(0, length - 300), length + 300), true), each(state.list, function(dataAndEvents, lineArray) {
    /** @type {string} */
    lineArray[AudioUtils.AUDIO_ITEM_INDEX_URL] = "";
  }), state.type = AudioPlaylist.TYPE_TEMP, state.ownerId = vk.id, state.albumId = irand(1, 999), state.hasMore = false, state.title = this.getTitle(), JSON.stringify(state);
}, AudioPlaylist.prototype.getId = function() {
  return this.getType() + "_" + this.getOwnerId() + "_" + this.getAlbumId();
}, AudioPlaylist.prototype.isReference = function() {
  return!!this._ref;
}, AudioPlaylist.prototype.getSelf = function() {
  return this._ref && isObject(this._ref) ? this._ref : this;
}, AudioPlaylist.prototype._unref = function() {
  var object = this._ref;
  if (isObject(object)) {
    var key;
    for (key in object) {
      if (object.hasOwnProperty(key) && (!isFunction(object[key]) && 0 == key.indexOf("_"))) {
        var value = object[key];
        params[key.substr(1)] = isObject(value) ? clone(value) : value;
      }
    }
    delete params.ownerId;
    delete params.hasMore;
    delete this._ref;
    /** @type {string} */
    this._type = AudioPlaylist.TYPE_TEMP;
    this._ownerId = params.ownerId || vk.id;
    /** @type {number} */
    this._albumId = AudioPlaylist.plIndex++;
    /** @type {boolean} */
    this._hasMore = false;
    /** @type {Array} */
    this._list = [];
    this.mergeWith(params);
  }
}, AudioPlaylist.prototype.getType = function() {
  return this.getSelf()._type;
}, AudioPlaylist.prototype.getOwnerId = function() {
  return this.getSelf()._ownerId;
}, AudioPlaylist.prototype.getAlbumId = function() {
  return this.getSelf()._albumId;
}, AudioPlaylist.prototype.getTitle = function() {
  return this.getSelf()._title || "";
}, AudioPlaylist.prototype.getBlocks = function() {
  return this.getSelf()._blocks || {};
}, AudioPlaylist.prototype.isPopBand = function() {
  return!!this.getSelf()._band;
}, AudioPlaylist.prototype.getPlaybackParams = function() {
  return this.getSelf()._playbackParams;
}, AudioPlaylist.prototype.setPlaybackParams = function(source) {
  var details = this.getSelf();
  details._playbackParams = source;
}, AudioPlaylist.prototype.hasMore = function() {
  return!!this.getSelf()._hasMore;
}, AudioPlaylist.prototype.getFeedFrom = function() {
  return this.getSelf()._feedFrom;
}, AudioPlaylist.prototype.getFeedOffset = function() {
  return this.getSelf()._feedOffset;
}, AudioPlaylist.prototype._needSilentLoading = function() {
  return this.getType() == AudioPlaylist.TYPE_ALBUM;
}, AudioPlaylist.prototype.getSearchParams = function() {
  return this.getSelf()._searchParams || null;
}, AudioPlaylist.prototype.getLocalFoundCount = function() {
  return this.getSelf()._localFoundTotal;
}, AudioPlaylist.prototype.setLocalFoundCount = function(lvl) {
  var o = this.getSelf();
  o._localFoundTotal = lvl;
}, AudioPlaylist.prototype.getTotalCount = function() {
  return this.getSelf()._totalCount;
}, AudioPlaylist.prototype.isShuffled = function() {
  return!!this.getShuffle();
}, AudioPlaylist.prototype.getShuffle = function() {
  return this.getSelf()._shuffle;
}, AudioPlaylist.prototype._moveCurrentAudioAtFirstPosition = function() {
  this._unref();
  var item = getAudioPlayer().getCurrentAudio();
  var index = this.indexOfAudio(item);
  if (-1 != index) {
    this._list.splice(index, 1);
    this._list.unshift(item);
  }
}, AudioPlaylist.prototype.clean = function() {
  this._unref();
  /** @type {boolean} */
  this._hasMore = true;
  /** @type {Array} */
  this._list = [];
  /** @type {Array} */
  this._items = [];
  /** @type {number} */
  this._feedOffset = this._feedFrom = 0;
  /** @type {number} */
  this._nextOffset = 0;
}, AudioPlaylist.prototype.shuffle = function(obj) {
  if (this._unref(), this._shuffle = obj, this._shuffle) {
    if (this.hasMore()) {
      if (this._needSilentLoading()) {
        return false;
      }
      if (this.getType() == AudioPlaylist.TYPE_SEARCH) {
        if (this.getLocalFoundCount() > 1) {
          var urls = this._list.splice(0, this.getLocalFoundCount());
          /** @type {Array} */
          this._originalList = [].concat(urls);
          shuffle(urls);
          this._list = urls.concat(this._list);
        }
      } else {
        this.clean();
      }
    } else {
      /** @type {Array} */
      this._originalList = [].concat(this._list);
      shuffle(this._list);
      this._moveCurrentAudioAtFirstPosition();
    }
  } else {
    if (this._originalList) {
      if (this.getType() == AudioPlaylist.TYPE_SEARCH) {
        this._list.splice(0, this.getLocalFoundCount());
        this._list = this._originalList.concat(this._list);
      } else {
        this._list = this._originalList;
      }
    } else {
      this.clean();
    }
    delete this._shuffle;
    delete this._originalList;
  }
  return true;
}, AudioPlaylist.prototype.isComplete = function() {
  return this.getSelf().getType() == AudioPlaylist.TYPE_ALBUM ? this.getSelf()._isComplete : true;
}, AudioPlaylist.prototype.getNextOffset = function() {
  return this.getSelf()._nextOffset || 0;
}, AudioPlaylist.prototype.getAudiosList = function() {
  return this.getSelf()._list || [];
}, AudioPlaylist.prototype.getItemsList = function() {
  return this.getSelf()._items || [];
}, AudioPlaylist.prototype.getPostId = function() {
  return this.getSelf()._postId;
}, AudioPlaylist.prototype.getWallQuery = function() {
  return this.getSelf()._wallQuery;
}, AudioPlaylist.prototype.getWallType = function() {
  return this.getSelf()._wallType;
}, AudioPlaylist.prototype.getNextAudio = function(el) {
  var inner = this.indexOfAudio(el);
  this.load(inner + 1);
  /** @type {number} */
  var arr = 1;
  return inner >= 0 && inner + arr < this.getAudiosCount() ? this.getAudioAt(inner + arr) : false;
}, AudioPlaylist.prototype.load = function(i, callback) {
  /** @type {boolean} */
  var active = void 0 === i;
  var _this = this;
  if (i = intval(i), this.getType() == AudioPlaylist.TYPE_SEARCH && void 0 === this.getLocalFoundCount()) {
    var exports = getAudioPlayer().getPlaylist(AudioPlaylist.TYPE_ALBUM, this.getOwnerId(), AudioPlaylist.ALBUM_ALL);
    return void exports.loadSilent(function() {
      var e = _this.getSearchParams();
      exports.search(e.q, function(file) {
        _this.setLocalFoundCount(file.length);
        _this.addAudio(file);
        _this.load(i, callback);
      });
    });
  }
  var phaseX = this.getType() == AudioPlaylist.TYPE_FEED ? this.getItemsCount() : this.getAudiosCount();
  if (!active && (this.hasMore() && (0 == i && phaseX > 0))) {
    return callback && callback(this);
  }
  if (!this.hasMore()) {
    return callback && callback(this);
  }
  if (this.getType() == AudioPlaylist.TYPE_ALBUM) {
    return this.loadSilent(callback);
  }
  if (phaseX - 20 > i) {
    return callback && callback(this);
  }
  if (this._onDoneLoading = this._onDoneLoading || [], this._onDoneLoading.push(callback), !this._loading) {
    /** @type {boolean} */
    this._loading = true;
    var f = this.getSearchParams();
    ajax.post("al_audio.php", {
      act : "a_load_section",
      type : this.getType(),
      owner_id : this.getOwnerId(),
      album_id : this.getAlbumId(),
      offset : this.getNextOffset(),
      search_q : f ? f.q : null,
      search_performer : f ? f.performer : null,
      search_lyrics : f ? f.lyrics : null,
      search_sort : f ? f.sort : null,
      feed_from : this.getFeedFrom(),
      feed_offset : this.getFeedOffset(),
      shuffle : this.getShuffle(),
      post_id : this.getPostId(),
      wall_query : this.getWallQuery(),
      wall_type : this.getWallType()
    }, {
      /**
       * @param {?} deepDataAndEvents
       * @return {undefined}
       */
      onDone : function(deepDataAndEvents) {
        getAudioPlayer().mergePlaylistData(_this, deepDataAndEvents);
        delete _this._loading;
        var list = _this._onDoneLoading;
        delete _this._onDoneLoading;
        each(list || [], function(dataAndEvents, done) {
          if (done) {
            done(_this);
          }
        });
        getAudioPlayer().saveStateCurrentPlaylist();
      }
    });
  }
}, AudioPlaylist.prototype.getLiveInfo = function() {
  var group = this.getSelf()._live;
  return group ? (group = group.split(","), {
    hostId : group[0],
    audioId : group[1],
    hash : group[2]
  }) : false;
}, AudioPlaylist.prototype.isLive = function() {
  return!!this.getLiveInfo();
}, AudioPlaylist.prototype.getAudioAt = function(id) {
  return this.getSelf()._list.length > id ? this.getSelf()._list[id] : null;
}, AudioPlaylist.prototype.getAudiosCount = function() {
  return this.getSelf()._list.length;
}, AudioPlaylist.prototype.getItemsCount = function() {
  var ul = this.getSelf();
  return ul._items = ul._items || [], ul._items.length;
}, AudioPlaylist.prototype.removeAudio = function(id) {
  var index = this.indexOfAudio(id);
  if (index >= 0) {
    this._unref();
    var r = this._list.splice(index, 1);
    return this._index && this._index.remove(r[0]), index;
  }
  return-1;
}, AudioPlaylist.prototype.addAudio = function(target, index) {
  /**
   * @param {(Array|string)} current
   * @return {undefined}
   */
  function add(current) {
    var found = self.indexOfAudio(current);
    if (found >= 0) {
      if (active) {
        return;
      }
      self._list.splice(found, 1);
    }
    current = clone(current);
    current[AudioUtils.AUDIO_ITEM_INDEX_TITLE] = clean(replaceEntities(current[AudioUtils.AUDIO_ITEM_INDEX_TITLE]).replace(/(<em>|<\/em>)/g, ""));
    current[AudioUtils.AUDIO_ITEM_INDEX_PERFORMER] = clean(replaceEntities(current[AudioUtils.AUDIO_ITEM_INDEX_PERFORMER]).replace(/(<em>|<\/em>)/g, ""));
    current[AudioUtils.AUDIO_ITEM_INDEX_FLAGS] &= ~AudioUtils.AUDIO_ITEM_INLINED_BIT;
    if (active) {
      self._list.push(current);
    } else {
      self._list.splice(index, 0, current);
    }
    if (self._index) {
      self._index.remove(current);
    }
  }
  this._unref();
  var self = this;
  /** @type {boolean} */
  var active = void 0 === index;
  if (isArray(target) && isArray(target[0])) {
    /** @type {number} */
    var i = 0;
    var j = target.length;
    for (;j > i;i++) {
      add(target[i]);
    }
  } else {
    if (target.length) {
      add(target);
    }
  }
}, AudioPlaylist.prototype.mergeWith = function(info) {
  if (!isObject(this._ref)) {
    var items = info.list;
    if (items) {
      var udataCur = getAudioPlayer().getCurrentAudio();
      if (udataCur && this.indexOfAudio(udataCur) >= 0) {
        /** @type {number} */
        var profile = -1;
        /** @type {number} */
        var p = 0;
        var li = items.length;
        for (;li > p;p++) {
          if (udataCur[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] == items[p][AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] && udataCur[AudioUtils.AUDIO_ITEM_INDEX_ID] == items[p][AudioUtils.AUDIO_ITEM_INDEX_ID]) {
            /** @type {number} */
            profile = p;
            break;
          }
        }
        if (profile >= 0) {
          this.clean();
        }
      }
      this.addAudio(info.list);
    }
    if (info.items) {
      this._items = this._items || [];
      /** @type {number} */
      p = 0;
      li = info.items.length;
      for (;li > p;p++) {
        this._items.push(info.items[p]);
      }
    }
    var _ = this;
    each("blocks nextOffset hasMore isComplete title feedFrom feedOffset live searchParams totalCount band postId wallQuery wallType".split(" "), function(dataAndEvents, name) {
      if (void 0 !== info[name]) {
        _["_" + name] = info[name];
      }
    });
  }
}, AudioPlaylist.prototype.moveAudio = function(i, index) {
  this._unref();
  var paths = this._list.splice(i, 1);
  if (index > i) {
    index -= 1;
  }
  this._list.splice(index, 0, paths[0]);
}, AudioPlaylist.prototype.indexOfAudio = function(value) {
  if (!value) {
    return-1;
  }
  var val;
  if (isString(value)) {
    /** @type {string} */
    val = value;
  } else {
    if (isObject(value)) {
      val = value.fullId;
    } else {
      if (isArray(value)) {
        val = value[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] + "_" + value[AudioUtils.AUDIO_ITEM_INDEX_ID];
      }
    }
  }
  val = val.split("_");
  var self = this.getSelf();
  /** @type {number} */
  var count = 0;
  var thumbsCount = self._list.length;
  for (;thumbsCount > count;count++) {
    if (val[0] == self._list[count][AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] && val[1] == self._list[count][AudioUtils.AUDIO_ITEM_INDEX_ID]) {
      return count;
    }
  }
  return-1;
}, AudioPlaylist.prototype.getAudio = function(key) {
  if (isString(key)) {
    key;
  } else {
    AudioUtils.asObject(key).fullId;
  }
  key = key.split("_");
  var self = this.getSelf();
  /** @type {number} */
  var count = 0;
  var thumbsCount = self._list.length;
  for (;thumbsCount > count;count++) {
    if (key[0] == self._list[count][AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] && key[1] == self._list[count][AudioUtils.AUDIO_ITEM_INDEX_ID]) {
      return self._list[count];
    }
  }
  return null;
}, AudioPlaylist.prototype._ensureIndex = function(options) {
  var self = this.getSelf();
  if (this.getType() == AudioPlaylist.TYPE_ALBUM) {
    /**
     * @param {?} _
     * @param {?} l
     * @return {?}
     */
    var unescapeOne = function(_, l) {
      var lo = intval(l);
      return lo >= 33 && 48 > lo ? String.fromCharCode(lo) : _;
    };
    self._index = new vkIndexer(self._list, function(dataAndEvents) {
      return(dataAndEvents[AudioUtils.AUDIO_ITEM_INDEX_PERFORMER] + " " + dataAndEvents[AudioUtils.AUDIO_ITEM_INDEX_TITLE]).replace(/\&\#(\d+);?/gi, unescapeOne);
    }, options);
  } else {
    if (options) {
      options();
    }
  }
}, AudioPlaylist.prototype.search = function(q, next) {
  var options = this.getSelf();
  this._ensureIndex(function() {
    return next(options._index ? options._index.search(q) : []);
  }.bind(this));
}, AudioPlaylist.prototype.toString = function() {
  return this.getId();
}, AudioPlaylist.prototype.fetchNextLiveAudio = function(callback) {
  var details = this.getLiveInfo();
  var jQuery = this;
  ajax.post("al_audio.php", {
    act : "a_get_audio_status",
    host_id : details.hostId
  }, {
    /**
     * @param {Array} doc
     * @return {undefined}
     */
    onDone : function(doc) {
      if (doc) {
        var scripts = jQuery.indexOfAudio(doc);
        if (scripts >= 0) {
          jQuery.moveAudio(scripts, jQuery.getAudiosCount() - 1);
        } else {
          jQuery.addAudio(doc);
        }
      }
      if (callback) {
        callback(doc);
      }
    }
  });
}, AudioPlaylist.prototype.loadSilent = function(callback, newlines) {
  var memory = this;
  if (this.hasMore() && this.getType() == AudioPlaylist.TYPE_ALBUM) {
    if (this._onDoneLoading = this._onDoneLoading || [], this._onDoneLoading.push(callback), this._silentLoading) {
      return;
    }
    /** @type {boolean} */
    this._silentLoading = true;
    ajax.post("al_audio.php", {
      act : "load_silent",
      owner_id : this.getOwnerId(),
      album_id : this.getAlbumId(),
      band : this.isPopBand() ? this.getOwnerId() : false
    }, {
      showProgress : newlines ? newlines.showProgress : false,
      hideProgress : newlines ? newlines.hideProgress : false,
      /**
       * @param {?} deepDataAndEvents
       * @return {undefined}
       */
      onDone : function(deepDataAndEvents) {
        getAudioPlayer().mergePlaylistData(memory, deepDataAndEvents);
        delete memory._silentLoading;
        var list = memory._onDoneLoading;
        delete memory._onDoneLoading;
        each(list || [], function(dataAndEvents, fire) {
          if (fire) {
            fire(memory);
          }
        });
      }
    });
  } else {
    if (callback) {
      callback(this);
    }
  }
}, AudioPlayer.prototype._initImpl = function(dataAndEvents) {
  /**
   * @param {boolean} dataAndEvents
   * @return {?}
   */
  function show(dataAndEvents) {
    if (self._repeatCurrent && !dataAndEvents) {
      self._implSeekImmediate(0);
      self._implPlay();
    } else {
      if (self._isPlaying = false, self.notify(AudioPlayer.EVENT_PAUSE), self.notify(AudioPlayer.EVENT_ENDED), self._failsCount++, self._failsCount > 3) {
        /** @type {number} */
        self._failsCount = 0;
        var content;
        return(content = new MessageBox({
          title : getLang("global_error")
        })).content(getLang("audio_error_loading")).setButtons("Ok", function() {
          curBox().hide();
        }).show(), void setTimeout(function() {
          content.hide();
        }, 3E3);
      }
      self.playNext(true);
    }
  }
  var self = this;
  if (this._impl) {
    this._impl.destroy();
  }
  /** @type {number} */
  this._failsCount = 0;
  /** @type {number} */
  var start = 0;
  var callbacks = {
    /**
     * @param {number} action
     * @return {undefined}
     */
    onBufferUpdate : function(action) {
      self.notify(AudioPlayer.EVENT_BUFFERED, action);
    },
    /**
     * @return {undefined}
     */
    onSeeked : function() {
      /** @type {number} */
      start = 0;
    },
    /**
     * @return {undefined}
     */
    onSeek : function() {
      /** @type {number} */
      start = 0;
    },
    /**
     * @return {undefined}
     */
    onEnd : function() {
      if ("html5" != self._impl.type) {
        show();
      }
    },
    /**
     * @return {undefined}
     */
    onFail : function() {
      show(true);
    },
    /**
     * @return {undefined}
     */
    onCanPlay : function() {
      self.notify(AudioPlayer.EVENT_CAN_PLAY);
    },
    /**
     * @param {number} t
     * @return {undefined}
     */
    onProgressUpdate : function(t) {
      var oldDims = self.getCurrentAudio();
      if (!self._muteProgressEvents && oldDims) {
        if (self.notify(AudioPlayer.EVENT_PROGRESS, t), "html5" == self._impl.type) {
          /** @type {number} */
          var fromIndex = 0;
          if (oldDims) {
            /** @type {number} */
            fromIndex = Math.max(0, t - start);
            /** @type {number} */
            var height = 0.3;
            /** @type {number} */
            fromIndex = Math.min(fromIndex, height / oldDims[AudioUtils.AUDIO_ITEM_INDEX_DURATION]);
          }
          if (t >= 1 - fromIndex) {
            show();
          }
        }
        /** @type {number} */
        start = t;
      }
    }
  };
  if (AudioPlayerHTML5.isSupported() || dataAndEvents) {
    this._impl = new AudioPlayerHTML5(callbacks);
  } else {
    if (browser.flash) {
      this._impl = new AudioPlayerFlash(callbacks);
    }
  }
  this._implSetVolume(0);
}, AudioPlayer.EVENT_PLAY = "start", AudioPlayer.EVENT_PAUSE = "pause", AudioPlayer.EVENT_STOP = "stop", AudioPlayer.EVENT_UPDATE = "update", AudioPlayer.EVENT_LOADED = "loaded", AudioPlayer.EVENT_ENDED = "ended", AudioPlayer.EVENT_FAILED = "failed", AudioPlayer.EVENT_BUFFERED = "buffered", AudioPlayer.EVENT_PROGRESS = "progress", AudioPlayer.EVENT_VOLUME = "volume", AudioPlayer.EVENT_PLAYLIST_CHANGED = "plchange", AudioPlayer.EVENT_ADDED = "added", AudioPlayer.EVENT_REMOVED = "removed", AudioPlayer.EVENT_START_LOADING =
"start_load", AudioPlayer.EVENT_CAN_PLAY = "actual_start", AudioPlayer.LS_VER = "v10", AudioPlayer.LS_KEY_PREFIX = "audio", AudioPlayer.LS_PREFIX = AudioPlayer.LS_KEY_PREFIX + "_" + AudioPlayer.LS_VER + "_", AudioPlayer.LS_VOLUME = "vol", AudioPlayer.LS_PL = "pl", AudioPlayer.LS_TRACK = "track", AudioPlayer.LS_SAVED = "saved", AudioPlayer.LS_PROGRESS = "progress", AudioPlayer.LS_DURATION_TYPE = "dur_type", AudioPlayer.LISTEN_TIME = 10, AudioPlayer.DEFAULT_VOLUME = 0.8;
/** @type {string} */
var audioIconSuffix = window.devicePixelRatio >= 2 ? "_2x" : "";
AudioPlayer.tabIcons = {
  def : "/images/icons/favicons/fav_logo" + audioIconSuffix + ".ico",
  play : "/images/icons/favicons/fav_play" + audioIconSuffix + ".ico",
  pause : "/images/icons/favicons/fav_pause" + audioIconSuffix + ".ico"
}, AudioPlayer.getLang = function(lang) {
  var args = getAudioPlayer();
  return args && args.langs ? args.langs[lang] : lang;
}, AudioPlayer.clearDeprecatedCacheKeys = function() {
  AudioPlayer._iterateCacheKeys(function(dataAndEvents) {
    return dataAndEvents == AudioPlayer.LS_VER;
  });
}, AudioPlayer.clearOutdatedCacheKeys = function() {
  var i = ls.get(AudioPlayer.LS_PREFIX + AudioPlayer.LS_SAVED) || 0;
  /** @type {number} */
  var j = 72E5;
  if (i < vkNow() - j) {
    AudioPlayer._iterateCacheKeys(function(dataAndEvents, obj) {
      return!inArray(obj, [AudioPlayer.LS_PL, AudioPlayer.LS_TRACK, AudioPlayer.LS_PROGRESS]);
    });
  }
}, AudioPlayer.clearAllCacheKeys = function() {
  AudioPlayer._iterateCacheKeys(function() {
    return false;
  });
  setCookie("remixcurr_audio", "", -1);
}, AudioPlayer._iterateCacheKeys = function(resultSelector) {
  var key;
  for (key in window.localStorage) {
    if (0 === key.indexOf(AudioPlayer.LS_KEY_PREFIX + "_")) {
      /** @type {Array.<string>} */
      var values = key.split("_");
      if (!resultSelector(values[1], values[2])) {
        localStorage.removeItem(key);
      }
    }
  }
}, AudioPlayer.prototype.getLayerTT = function() {
  return this.layerTT;
}, AudioPlayer.prototype.isImplInited = function() {
  return!!this._impl;
}, AudioPlayer.prototype.onMediaKeyPressedEvent = function(event) {
  var getCurrentAudio = this.getCurrentAudio();
  this.getCurrentPlaylist();
  if (getCurrentAudio) {
    switch(event.keyCode) {
      case 179:
        if (this.isPlaying()) {
          this.pause();
        } else {
          this.play();
        }
        break;
      case 178:
        this.seek(0);
        this.pause();
        break;
      case 177:
        this.playPrev();
        break;
      case 176:
        this.playNext();
    }
  }
}, AudioPlayer.prototype.deletePlaylist = function(elt) {
  /** @type {number} */
  var i = 0;
  for (;i < this._playlists.length;i++) {
    if (this._playlists[i] == elt) {
      this._playlists.splice(i, 1);
    }
  }
  delete elt;
}, AudioPlayer.prototype.mergePlaylistData = function(data, deepDataAndEvents) {
  return data.hasMore() ? void each(this._playlists, function(dataAndEvents, record) {
    if (record.getId() == data.getId()) {
      record.mergeWith(deepDataAndEvents);
    }
  }) : data;
}, AudioPlayer.prototype.deleteCurrentPlaylist = function() {
  this.stop();
  delete this._currentAudio;
  delete this._currentPlaylist;
  this.notify(AudioPlayer.EVENT_UPDATE);
  this.notify(AudioPlayer.EVENT_PLAYLIST_CHANGED);
}, AudioPlayer.prototype.updateCurrentPlaying = function(deepDataAndEvents) {
  /** @type {boolean} */
  deepDataAndEvents = !!deepDataAndEvents;
  var fullId = (this.getCurrentPlaylist(), AudioUtils.asObject(this.getCurrentAudio()));
  /** @type {Array} */
  var parts = [];
  if (fullId) {
    var o = geByClass("_audio_row_" + fullId.fullId);
    /** @type {Array} */
    parts = parts.concat([].slice.call(o));
  }
  /** @type {number} */
  var i = 0;
  var l = this._currentPlayingRows.length;
  for (;l > i;i++) {
    var part = this._currentPlayingRows[i];
    if (part) {
      if (!inArray(part, parts)) {
        this.toggleCurrentAudioRow(part, false, deepDataAndEvents);
      }
    }
  }
  if (fullId) {
    /** @type {number} */
    i = 0;
    /** @type {number} */
    l = parts.length;
    for (;l > i;i++) {
      part = parts[i];
      if (part) {
        this.toggleCurrentAudioRow(part, true, deepDataAndEvents);
      }
    }
  }
  /** @type {Array} */
  this._currentPlayingRows = parts;
}, AudioPlayer.prototype.toggleCurrentAudioRow = function(node, value, deepDataAndEvents) {
  /**
   * @return {undefined}
   */
  function show() {
    if (normalizedRange && (value ? props._addRowPlayer(node, deepDataAndEvents) : props._removeRowPlayer(node)), value) {
      props.on(node, AudioPlayer.EVENT_PLAY, function(ok) {
        if (AudioUtils.asObject(ok).fullId == AudioUtils.getAudioFromEl(node, true).fullId) {
          addClass(node, AudioUtils.AUDIO_PLAYING_CLS);
          attr(div, "aria-label", getLang("global_audio_pause"));
        }
      });
      props.on(node, AudioPlayer.EVENT_PROGRESS, function(details, m) {
        details = AudioUtils.asObject(details);
        var xhtml;
        var p = intval(details.duration);
        xhtml = props.getDurationType() ? "-" + formatTime(Math.round(p - m * p)) : formatTime(Math.round(m * p));
        geByClass1("audio_duration", node).innerHTML = xhtml;
      });
      props.on(node, [AudioPlayer.EVENT_PAUSE, AudioPlayer.EVENT_ENDED], function(dataAndEvents) {
        removeClass(node, AudioUtils.AUDIO_PLAYING_CLS);
        attr(div, "aria-label", getLang("global_audio_play"));
      });
      toggleClass(node, AudioUtils.AUDIO_PLAYING_CLS, props.isPlaying());
    } else {
      props.off(node);
      removeClass(node, AudioUtils.AUDIO_PLAYING_CLS);
      var pre = geByClass1("audio_duration", node);
      if (pre) {
        pre.innerHTML = formatTime(AudioUtils.getAudioFromEl(node, true).duration);
      }
    }
    if (deepDataAndEvents) {
      setTimeout(function() {
        var column = intval(domData(node, "is-current"));
        toggleClass(node, AudioUtils.AUDIO_CURRENT_CLS, !!column);
      });
    } else {
      toggleClass(node, AudioUtils.AUDIO_CURRENT_CLS, value);
    }
  }
  /** @type {boolean} */
  var val = !!intval(domData(node, "is-current"));
  if (val != value) {
    domData(node, "is-current", intval(value));
    var div = geByClass1("_audio_play", node);
    var normalizedRange = hasClass(node, "inlined");
    if (normalizedRange) {
      toggleClass(node, "audio_with_transition", deepDataAndEvents);
    }
    deepDataAndEvents = normalizedRange ? deepDataAndEvents : false;
    var props = this;
    if (deepDataAndEvents) {
      setTimeout(show);
    } else {
      show();
    }
  }
}, AudioPlayer.prototype._removeRowPlayer = function(event) {
  removeClass(event, AudioUtils.AUDIO_CURRENT_CLS);
  var pointer = data(event, "player_inited");
  if (pointer) {
    setTimeout(function() {
      re(geByClass1("_audio_inline_player", event));
    }, 200);
    var e = geByClass1("_audio_duration", event);
    if (e) {
      e.innerHTML = formatTime(AudioUtils.getAudioFromEl(event, true).duration);
    }
    this.off(event);
    each(pointer.sliders, function() {
      this.destroy();
    });
    data(event, "player_inited", false);
  }
}, AudioPlayer.prototype._addRowPlayer = function(event, deepDataAndEvents) {
  if (!geByClass1("_audio_inline_player", event)) {
    var self = this;
    var rreturn = se(vk.audioParams.audioInlinePlayerTpl || getTemplate("audio_inline_player"));
    var ret = geByClass1("_audio_player_wrap", event);
    ret.appendChild(rreturn);
    var button = new Slider(geByClass1("audio_inline_player_volume", rreturn), {
      value : self.getVolume(),
      backValue : 0,
      size : 1,
      hintClass : "audio_player_hint",
      withBackLine : true,
      log : true,
      /**
       * @param {number} change
       * @return {?}
       */
      formatHint : function(change) {
        return Math.round(100 * change) + "%";
      },
      /**
       * @param {number} v
       * @return {undefined}
       */
      onChange : function(v) {
        self.setVolume(v);
      }
    });
    var slider = new Slider(geByClass1("audio_inline_player_progress", rreturn), {
      value : 0,
      backValue : 0,
      size : 1,
      hintClass : "audio_player_hint",
      withBackLine : true,
      /**
       * @param {?} percentage
       * @return {?}
       */
      formatHint : function(percentage) {
        var media = AudioUtils.asObject(self.getCurrentAudio());
        return formatTime(Math.round(percentage * media.duration));
      },
      /**
       * @param {number} pos
       * @return {undefined}
       */
      onEndDragging : function(pos) {
        self.seek(pos);
      }
    });
    self.on(event, AudioPlayer.EVENT_START_LOADING, function() {
      slider.toggleLoading(true);
    });
    self.on(event, AudioPlayer.EVENT_CAN_PLAY, function() {
      slider.toggleLoading(false);
    });
    self.on(event, AudioPlayer.EVENT_BUFFERED, function(dataAndEvents, onChange) {
      slider.setBackValue(onChange);
    });
    self.on(event, AudioPlayer.EVENT_PROGRESS, function(dataAndEvents, newVal) {
      slider.setValue(newVal);
    });
    self.on(event, AudioPlayer.EVENT_VOLUME, function(dataAndEvents, value) {
      button.setValue(value);
    });
    data(event, "player_inited", {
      sliders : [button, slider]
    });
  }
}, AudioPlayer.prototype.shareMusic = function() {
  var expectationResult = this.getCurrentAudio();
  if (expectationResult) {
    return expectationResult = AudioUtils.asObject(expectationResult), !showBox("like.php", {
      act : "publish_box",
      object : "audio" + expectationResult.fullId,
      list : "s" + vk.id,
      to : "mail"
    }, {
      stat : ["page.js", "page.css", "wide_dd.js", "wide_dd.css", "sharebox.js"],
      /**
       * @param {?} message
       * @return {?}
       */
      onFail : function(message) {
        return showDoneBox(message), true;
      }
    });
  }
}, AudioPlayer.prototype.hasStatusExport = function() {
  var unlock;
  for (unlock in this._statusExport) {
    if (this._statusExport[unlock]) {
      return true;
    }
  }
  return false;
}, AudioPlayer.prototype.getStatusExportInfo = function() {
  return this._statusExport;
}, AudioPlayer.prototype.setStatusExportInfo = function(deepDataAndEvents) {
  this._statusExport = deepDataAndEvents;
}, AudioPlayer.prototype.deleteAudioFromAllPlaylists = function(val) {
  val = isObject(val) || isArray(val) ? AudioUtils.asObject(val).fullId : val;
  each(this._playlists, function(dataAndEvents, me) {
    me.removeAudio(val);
  });
}, AudioPlayer.prototype.triggerAudioUpdated = function() {
  this.notify(AudioPlayer.EVENT_UPDATE);
}, AudioPlayer.prototype.updateAudio = function(id, el) {
  /** @type {string} */
  var alias = "";
  if (isString(id) ? alias = id : isArray(id) && (alias = AudioUtils.asObject(id).fullId), el || (el = id), each(this._playlists, function(deepDataAndEvents, dataAndEvents) {
    var values = dataAndEvents.getAudiosList();
    /** @type {number} */
    var id = 0;
    var valuesLen = values.length;
    for (;valuesLen > id;id++) {
      if (values[id][AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] + "_" + values[id][AudioUtils.AUDIO_ITEM_INDEX_ID] == alias) {
        return isObject(el) && each(el, function(name, region) {
          values[id][name] = region;
        }), void(isArray(el) && (values[id] = el));
      }
    }
  }), this._currentAudio[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] + "_" + this._currentAudio[AudioUtils.AUDIO_ITEM_INDEX_ID] == alias) {
    if (isObject(el)) {
      var self = this;
      each(el, function(timeoutKey, dataAndEvents) {
        self._currentAudio[timeoutKey] = dataAndEvents;
      });
    }
    if (isArray(el)) {
      /** @type {string} */
      this._currentAudio = el;
    }
  }
  return this.notify(AudioPlayer.EVENT_UPDATE), id;
}, AudioPlayer.prototype._sendLCNotification = function() {
  var _jQuery = window.Notifier;
  if (_jQuery) {
    _jQuery.lcSend("audio_start");
  }
  try {
    var player = ge("video_player") || (window.html5video || null);
    if (player) {
      if (player.playVideo) {
        player.playVideo(false);
      }
    }
  } catch (e) {
  }
}, AudioPlayer.prototype.showHQLabel = function(value) {
  /** @type {string} */
  var cacheKey = "_audio_show_hq_label";
  return void 0 === value ? !!ls.get(cacheKey) : (value = !!value, ls.set(cacheKey, value), AudioUtils.toggleAudioHQBodyClass(), value);
}, AudioPlayer.prototype._restoreVolumeState = function() {
  AudioPlayer.clearDeprecatedCacheKeys();
  AudioPlayer.clearOutdatedCacheKeys();
  var _userVolume = this._lsGet(AudioPlayer.LS_VOLUME);
  this._userVolume = void 0 == _userVolume || _userVolume === false ? AudioPlayer.DEFAULT_VOLUME : _userVolume;
}, AudioPlayer.prototype._restoreState = function() {
  if (!vk.widget) {
    AudioPlayer.clearDeprecatedCacheKeys();
    AudioPlayer.clearOutdatedCacheKeys();
    this._currentAudio = this._lsGet(AudioPlayer.LS_TRACK);
    var apiResponse = this._lsGet(AudioPlayer.LS_PL);
    if (apiResponse) {
      /** @type {*} */
      apiResponse = JSON.parse(apiResponse);
      this._currentPlaylist = new AudioPlaylist(apiResponse);
    }
    if (this._currentPlaylist && this._currentAudio) {
      this.notify(AudioPlayer.EVENT_UPDATE);
    } else {
      /** @type {boolean} */
      this._currentPlaylist = this._currentAudio = false;
    }
    var slideIndex = this._lsGet(AudioPlayer.LS_PROGRESS) || 0;
    if (this._currentAudio) {
      if (slideIndex) {
        if (this._impl) {
          if ("html5" == this._impl.type) {
            this._implSetUrl(this._currentAudio, true);
            this._implSeek(slideIndex);
            this._implSetVolume(0);
          }
        }
      }
    }
  }
}, AudioPlayer.prototype._ensureImplReady = function(fn) {
  var self = this;
  if (this._impl) {
    this._impl.onReady(function(length) {
      return length ? fn() : void("flash" == self._impl.type && self._initImpl(true));
    });
  }
}, AudioPlayer.prototype._implNewTask = function(value, cb) {
  this._taskIDCounter = this._taskIDCounter || 1;
  this._tasks = this._tasks || [];
  this._tasks.push({
    name : value,
    /** @type {Function} */
    cb : cb,
    id : value + "_" + this._taskIDCounter++
  });
  this._implDoTasks();
}, AudioPlayer.prototype._implDoTasks = function() {
  if (this._tasks = this._tasks || [], !this._taskInProgress) {
    var query = this._tasks.shift();
    if (query) {
      var elem = this;
      query = clone(query);
      this._taskInProgress = query.id;
      this._ensureImplReady(function() {
        query.cb.call(elem, function() {
          return elem._taskAbort == query.id ? void(elem._taskAbort = false) : (elem._taskInProgress = false, void elem._implDoTasks());
        });
      });
    }
  }
}, AudioPlayer.prototype._implClearAllTasks = function() {
  this._taskAbort = this._taskInProgress;
  /** @type {boolean} */
  this._taskInProgress = false;
  /** @type {Array} */
  this._tasks = [];
}, AudioPlayer.prototype._implClearTask = function(value) {
  this._tasks = this._tasks || [];
  this._tasks = this._tasks.filter(function(el) {
    return el.name != value;
  });
}, AudioPlayer.prototype._implSetDelay = function(opt_attributes) {
  this._implNewTask("delay", function after(next) {
    setTimeout(next, after);
  });
}, AudioPlayer.prototype._implPlay = function() {
  var self = this;
  this._implNewTask("play", function($sanitize) {
    audio = AudioUtils.asObject(self.getCurrentAudio());
    self._impl.play(audio.url);
    /** @type {boolean} */
    self._muteProgressEvents = false;
    /** @type {boolean} */
    self._allowPrefetchNext = true;
    $sanitize();
  });
}, AudioPlayer.prototype._implSeekImmediate = function(pos) {
  if (this._impl) {
    this._impl.seek(pos);
  }
}, AudioPlayer.prototype._implSeek = function(pos) {
  var self = this;
  this._implClearTask("seek");
  this._implNewTask("seek", function($sanitize) {
    self._impl.seek(pos);
    $sanitize();
  });
}, AudioPlayer.prototype._implPause = function() {
  var self = this;
  this._implNewTask("pause", function($sanitize) {
    self._impl.pause();
    $sanitize();
  });
}, AudioPlayer.prototype._implSetVolume = function(v, dataAndEvents) {
  if (this._impl) {
    var self = this;
    if (dataAndEvents) {
      /** @type {string} */
      var udataCur = 0 == v ? "vol_down" : "vol_up";
      this._implNewTask(udataCur, function($sanitize) {
        self._impl.fadeVolume(v, function() {
          $sanitize();
        });
      });
    } else {
      this._implNewTask("vol_set", function($sanitize) {
        self._impl.setVolume(v);
        $sanitize();
      });
    }
  }
}, AudioPlayer.prototype._implSetUrl = function(key, dataAndEvents) {
  var that = this;
  this._implClearTask("url");
  this._implNewTask("url", function($sanitize) {
    if (!dataAndEvents) {
      that.notify(AudioPlayer.EVENT_START_LOADING);
    }
    var resetY = that._taskInProgress;
    that._ensureHasURL(key, function(slide) {
      if (resetY == that._taskInProgress) {
        slide = AudioUtils.asObject(slide);
        that._impl.setUrl(slide.url, function(dataAndEvents) {
          if (!dataAndEvents) {
            that._implClearAllTasks();
            that._onFailedUrl();
          }
          $sanitize();
        });
      }
    });
  });
}, AudioPlayer.prototype.toggleDurationType = function() {
  var pdataOld = intval(ls.get(AudioPlayer.LS_PREFIX + AudioPlayer.LS_DURATION_TYPE));
  /** @type {boolean} */
  pdataOld = !pdataOld;
  ls.set(AudioPlayer.LS_PREFIX + AudioPlayer.LS_DURATION_TYPE, pdataOld);
  this.notify(AudioPlayer.EVENT_UPDATE, this.getCurrentProgress());
}, AudioPlayer.prototype.getDurationType = function() {
  return intval(ls.get(AudioPlayer.LS_PREFIX + AudioPlayer.LS_DURATION_TYPE));
}, AudioPlayer.prototype.getCurrentProgress = function() {
  return this._impl ? this._impl.getCurrentProgress() : 0;
}, AudioPlayer.prototype.getCurrentBuffered = function() {
  return this._impl ? this._impl.getCurrentBuffered() : 0;
}, AudioPlayer.prototype._initEvents = function() {
  var assert = window.Notifier;
  var anim = this;
  if (assert) {
    assert.addRecvClbk("audio_start", "audio", function(dataAndEvents) {
      if (anim.isPlaying()) {
        anim.pause(false, anim._fadeVolumeWorker ? false : true);
      }
      /** @type {null} */
      anim.pausedByVideo = null;
    });
    assert.addRecvClbk("video_start", "audio", function(dataAndEvents) {
      if (anim.isPlaying()) {
        anim.pause();
        /** @type {number} */
        anim.pausedByVideo = 1;
      }
    });
    assert.addRecvClbk("video_hide", "audio", function(dataAndEvents) {
      if (!anim.isPlaying()) {
        if (anim.pausedByVideo) {
          anim.play();
          delete anim.pausedByVideo;
        }
      }
    });
    assert.addRecvClbk("logged_off", "audio", function() {
      /** @type {boolean} */
      cur.loggingOff = true;
      AudioPlayer.clearAllCacheKeys();
      anim.stop();
    });
  }
}, AudioPlayer.prototype.addPlaylist = function(record) {
  if (!this.hasPlaylist(record.getId())) {
    this._playlists.push(record);
  }
}, AudioPlayer.prototype.shufflePlaylist = function(self) {
  if (self.shuffle = irand(1, 999), self.has_more) {
    if (AudioUtils.getPlaylistType(self) == AudioPlaylist.TYPE_SEARCH) {
      if (self.localFoundTotal && intval(self.localFoundTotal) > 1) {
        var data = self.list.splice(0, self.localFoundTotal);
        /** @type {Array} */
        self.original = [].concat(data);
        shuffle(data);
        self.list = data.concat(self.list);
      }
    } else {
      /** @type {Array} */
      self.list = [];
      /** @type {number} */
      self.offset = self.next_offset = 0;
    }
  } else {
    /** @type {Array} */
    self.original = [].concat(self.list);
    shuffle(self.list);
    delete self.localFoundTotal;
    this.moveCurrentPlayingAtFirstPos(self);
  }
}, AudioPlayer.prototype.moveCurrentPlayingAtFirstPos = function(self) {
  var source = this.getCurrentAudio();
  if (source && -1 != this.getAudioPlaylistPosition(source, self)) {
    var target = self.list[0];
    if (self.list.length && target[AudioUtils.AUDIO_ITEM_INDEX_ID] == source[AudioUtils.AUDIO_ITEM_INDEX_ID]) {
      return;
    }
    /** @type {number} */
    var i = 0;
    var l = self.list.length;
    for (;l > i;i++) {
      if (self.list[i][AudioUtils.AUDIO_ITEM_INDEX_ID] == source[AudioUtils.AUDIO_ITEM_INDEX_ID]) {
        self.list.splice(i, 1);
        break;
      }
    }
    self.list.unshift(source);
  }
}, AudioPlayer.prototype.restoreShufflePlaylist = function(data) {
  delete data.shuffle;
  if (data.original || AudioUtils.isPaginatedPlaylist(data)) {
    if (data.has_more) {
      if (AudioUtils.getPlaylistType(data) == AudioPlaylist.TYPE_SEARCH && data.localFoundTotal) {
        data.list.splice(0, data.localFoundTotal);
        data.list = data.original.concat(data.list);
      } else {
        /** @type {Array} */
        data.list = [];
        /** @type {number} */
        data.offset = data.next_offset = 0;
      }
    } else {
      data.list = data.original;
    }
    delete data.original;
  }
}, AudioPlayer.prototype.hasPlaylist = function(version, path, deepDataAndEvents) {
  var sourceVersion;
  sourceVersion = void 0 !== path && void 0 !== deepDataAndEvents ? version + "_" + path + "_" + deepDataAndEvents : version;
  /** @type {number} */
  var i = 0;
  for (;i < this._playlists.length;i++) {
    var candidate = this._playlists[i];
    if (!candidate.isReference() && candidate.getId() == sourceVersion) {
      return candidate;
    }
  }
  return false;
}, AudioPlayer.prototype.getPlaylist = function(id, key, deepDataAndEvents) {
  if (id && (!key && !deepDataAndEvents)) {
    var keys = id.split("_");
    id = keys[0];
    key = keys[1];
    deepDataAndEvents = keys[2];
  }
  var item = this.hasPlaylist(id, key, deepDataAndEvents);
  if (item) {
    return item;
  }
  if (id == AudioPlaylist.TYPE_ALBUM && deepDataAndEvents != AudioPlaylist.ALBUM_ALL) {
    var req = this.getPlaylist(AudioPlaylist.TYPE_ALBUM, key, AudioPlaylist.ALBUM_ALL);
    if (!req.hasMore() && req.isComplete()) {
      var mkdirp = new AudioPlaylist(AudioPlaylist.TYPE_ALBUM, key, deepDataAndEvents);
      return each(req.getAudiosList(), function(dataAndEvents, file) {
        if (file[AudioUtils.AUDIO_ITEM_INDEX_ALBUM_ID] == deepDataAndEvents) {
          mkdirp.addAudio(file);
        }
      }), mkdirp;
    }
  }
  return new AudioPlaylist({
    type : id,
    ownerId : key,
    albumId : deepDataAndEvents,
    hasMore : id != AudioPlaylist.TYPE_TEMP
  });
}, AudioPlayer.prototype.toggleRepeatCurrentAudio = function() {
  /** @type {boolean} */
  this._repeatCurrent = !this._repeatCurrent;
}, AudioPlayer.prototype.isRepeatCurrentAudio = function() {
  return!!this._repeatCurrent;
}, AudioPlayer.prototype.setNext = function(matchIndex, event) {
  var el = domClosest("_audio_row", matchIndex);
  var id = AudioUtils.getAudioFromEl(el);
  var color = AudioUtils.asObject(id);
  if (!hasClass(el, "audio_added_next")) {
    addClass(el, "audio_added_next");
    var option = this.getCurrentPlaylist();
    if (option) {
      var value = AudioUtils.asObject(this.getCurrentAudio());
      if (value && color.fullId == value.fullId) {
        return;
      }
      var isFunction = option.indexOfAudio(value);
      if (-1 == isFunction) {
        return;
      }
      var a = option.indexOfAudio(color);
      if (-1 != a) {
        option.moveAudio(a, isFunction + 1);
      } else {
        option.addAudio(id, isFunction + 1);
      }
    } else {
      option = AudioUtils.getContextPlaylist(el);
      this.play(id, option);
    }
  }
  return cancelEvent(event);
}, AudioPlayer.prototype._setTabIcon = function(eventName) {
  setFavIcon(AudioPlayer.tabIcons[eventName]);
}, AudioPlayer.prototype.on = function(context, keys, cb) {
  if (!isArray(keys)) {
    /** @type {Array} */
    keys = [keys];
  }
  each(keys, function(deepDataAndEvents, dataAndEvents) {
    this.subscribers.push({
      context : context,
      et : dataAndEvents,
      /** @type {Function} */
      cb : cb
    });
  }.bind(this));
}, AudioPlayer.prototype.off = function(context) {
  this.subscribers = this.subscribers.filter(function(sub) {
    return sub.context != context;
  });
}, AudioPlayer.prototype.notify = function(key, type, capture) {
  var path = this.getCurrentAudio();
  if (this._impl && (!this._muteProgressEvents || !inArray(key, [AudioPlayer.EVENT_BUFFERED, AudioPlayer.EVENT_PROGRESS]))) {
    switch(inArray(key, [AudioPlayer.EVENT_PLAY, AudioPlayer.EVENT_PAUSE]) && (this.subscribers = this.subscribers.filter(function(event) {
      return event.context instanceof Element ? bodyNode.contains(event.context) : true;
    }), this.updateCurrentPlaying(true)), each(this.subscribers || [], function(dataAndEvents, item) {
      if (item.et == key) {
        item.cb(path, type, capture);
      }
    }), key) {
      case AudioPlayer.EVENT_VOLUME:
        this._lsSet(AudioPlayer.LS_VOLUME, this._userVolume);
        break;
      case AudioPlayer.EVENT_PLAY:
        this.saveStateCurrentPlaylist();
        this._saveStateCurrentAudio();
        this._setTabIcon("play");
        this._sendStatusExport();
        break;
      case AudioPlayer.EVENT_PLAYLIST_CHANGED:
        this.saveStateCurrentPlaylist();
        this._saveStateCurrentAudio();
        break;
      case AudioPlayer.EVENT_PROGRESS:
        if (!vk.widget) {
          var recurring = this._impl.getCurrentProgress();
          this._lsSet(AudioPlayer.LS_PROGRESS, recurring);
          var unlock = path[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] + "_" + path[AudioUtils.AUDIO_ITEM_INDEX_ID];
          if (!this._listened[unlock] && (this._impl.getPlayedTime() >= AudioPlayer.LISTEN_TIME && (this._sendPlayback(), this._listened[unlock] = true)), this._allowPrefetchNext && recurring >= 0.8) {
            var self = this.getCurrentPlaylist();
            var resolved = self.getNextAudio(path);
            if (resolved) {
              if (this._impl.isFullyLoaded()) {
                /** @type {boolean} */
                this._allowPrefetchNext = false;
                this._prefetchAudio(resolved);
              }
            }
          }
        }
        break;
      case AudioPlayer.EVENT_PAUSE:
        this._setTabIcon("pause");
        break;
      case AudioPlayer.EVENT_ENDED:
      ;
    }
  }
}, AudioPlayer.prototype._initPlaybackParams = function() {
  var entity = this.getCurrentPlaylist();
  if (void 0 === entity.getPlaybackParams()) {
    var requestData = AudioUtils.asObject(this.getCurrentAudio());
    var params = {};
    if (!entity.originalId) {
      entity.id;
    }
    if (entity.isLive() && (params.status = 1), entity.getType() == AudioPlaylist.TYPE_RECOM && (params.recommendation = 1), entity.getType() == AudioPlaylist.TYPE_POPULAR) {
      var which = (entity.getAlbumId() + "").replace("foreign", "");
      if (intval(which)) {
        /** @type {number} */
        params.popular_genre = 1;
      }
      /** @type {number} */
      params.top_audio = 1;
    }
    if (entity.getType() == AudioPlaylist.TYPE_FEED && (params.feed_audio = 1), entity.getType() == AudioPlaylist.TYPE_ALBUM && (entity.getAlbumId() == AudioPlaylist.ALBUM_ALL && (entity.isPopBand() && (params.top_bands = 1, params.friend = entity.getOwnerId())), entity.getAlbumId() != AudioPlaylist.ALBUM_ALL && (params.album = 1)), entity.getType() == AudioPlaylist.TYPE_ALBUM && nav.objLoc.friend) {
      var i = intval(nav.objLoc.friend);
      if (0 > i) {
        params.club = i;
      } else {
        params.friend = i;
      }
    }
    if (!("search" != cur.module)) {
      if (!("audio" != nav.objLoc["c[section]"])) {
        if (!nav.objLoc["c[q]"]) {
          /** @type {number} */
          params.top = 1;
        }
      }
    }
    if (("groups" == cur.module || "public" == cur.module) && (cur.oid == requestData.ownerId && cur.oid < 0) || cur.audioPage && (cur.audioPage.options.oid == requestData.ownerId && cur.audioPage.options.oid < 0)) {
      /** @type {number} */
      params.group = 1;
    }
    if (("audio" == cur.module || "feed" == cur.module) && nav.objLoc.q || ("search" == cur.module && nav.objLoc["c[q]"] || entity.getType() == AudioPlaylist.TYPE_SEARCH)) {
      /** @type {number} */
      params.search = 1;
    }
    if (!params.search) {
      if (!("feed" != cur.module)) {
        /** @type {number} */
        params.feed = 1;
      }
    }
    entity.setPlaybackParams(params);
  }
}, AudioPlayer.prototype.playLive = function(authorization, me) {
  var $ = this.getPlaylist(AudioPlaylist.TYPE_LIVE, vk.id, data[0]);
  $.mergeWith({
    live : authorization,
    hasMore : false
  });
  authorization = $.getLiveInfo();
  var s = this;
  ajax.post("al_audio.php", {
    act : "a_play_audio_status",
    audio_id : authorization.audioId,
    host_id : authorization.hostId,
    hash : authorization.hash
  }, extend(me, {
    /**
     * @param {Object} args
     * @param {Element} doc
     * @return {undefined}
     */
    onDone : function(args, doc) {
      $.mergeWith({
        title : doc.title,
        list : [args]
      });
      s.play(args, $);
    }
  }));
}, AudioPlayer.prototype.startListenLive = function(group) {
  group = group.split(",");
  ajax.post("al_audio.php", {
    act : "a_play_audio_status",
    host_id : group[0],
    audio_id : group[1],
    hash : group[2]
  });
}, AudioPlayer.prototype.getNextLiveAudio = function(div, callback) {
  if (div.live) {
    var host_id = div.live.split(",");
    ajax.post("al_audio.php", {
      act : "a_get_audio_status",
      host_id : host_id[0]
    }, {
      /**
       * @param {Array} file
       * @return {undefined}
       */
      onDone : function(file) {
        if (file) {
          div.addAudio(file);
          callback(file);
        } else {
          delete div.live;
          /** @type {string} */
          div.title = "";
          callback();
        }
      }
    });
  }
}, AudioPlayer.prototype._sendStatusExport = function() {
  var tmp = this.getCurrentAudio();
  if (tmp) {
    tmp = AudioUtils.asObject(tmp);
    var m = this.statusSent ? this.statusSent.split(",") : [false, 0];
    /** @type {number} */
    var e = vkNow() - intval(m[1]);
    if (this.hasStatusExport() && (tmp.id != m[0] || e > 3E5)) {
      var scroller = this.getCurrentPlaylist();
      var offset = scroller ? scroller.playbackParams : null;
      setTimeout(ajax.post.pbind("al_audio.php", {
        act : "audio_status",
        full_id : tmp.fullId,
        hash : vk.audioParams.addHash,
        top : intval(offset && (offset.top_audio || offset.top))
      }), 0);
      this.statusSent = tmp.id + "," + vkNow();
    }
  }
}, AudioPlayer.prototype._sendPlayback = function() {
  var getCurrentPlaylist = this.getCurrentPlaylist();
  if (getCurrentPlaylist.getPlaybackParams()) {
    var p = AudioUtils.asObject(this.getCurrentAudio());
    var data = extend({
      act : "playback",
      full_id : p.fullId,
      impl : this._impl.type
    }, getCurrentPlaylist.getPlaybackParams());
    if (p.ownerId == vk.id) {
      if (p.id) {
        data.id = p.id;
      }
    }
    ajax.post("al_audio.php", data);
  }
}, AudioPlayer.prototype.saveStateCurrentPlaylist = function() {
  if (!vk.widget) {
    var browser = this.getCurrentPlaylist();
    if (browser) {
      var recurring = browser.serialize();
      this._lsSet(AudioPlayer.LS_PL, recurring);
    } else {
      this._lsSet(AudioPlayer.LS_PL, null);
    }
    this._lsSet(AudioPlayer.LS_SAVED, vkNow());
  }
}, AudioPlayer.prototype._saveStateCurrentAudio = function() {
  if (!vk.widget) {
    var ret = this.getCurrentAudio();
    if (ret) {
      var recurring = clone(ret);
      /** @type {string} */
      recurring[AudioUtils.AUDIO_ITEM_INDEX_URL] = "";
      this._lsSet(AudioPlayer.LS_TRACK, recurring);
      setCookie("remixcurr_audio", ret[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] + "_" + ret[AudioUtils.AUDIO_ITEM_INDEX_ID], 1);
    } else {
      this._lsSet(AudioPlayer.LS_TRACK, null);
      setCookie("remixcurr_audio", null, 1);
    }
  }
}, AudioPlayer.prototype.seekCurrentAudio = function(invert) {
  var meta = AudioUtils.asObject(this.getCurrentAudio());
  /** @type {number} */
  var v = 10 / meta.duration;
  var from = this.getCurrentProgress() + (invert ? v : -v);
  /** @type {number} */
  from = Math.max(0, Math.min(1, from));
  this.seek(from);
}, AudioPlayer.prototype._lsGet = function(path) {
  return ls.get(AudioPlayer.LS_PREFIX + path);
}, AudioPlayer.prototype._lsSet = function(pref, recurring) {
  ls.set(AudioPlayer.LS_PREFIX + pref, recurring);
}, AudioPlayer.prototype.setVolume = function(val) {
  /** @type {number} */
  val = Math.min(1, Math.max(0, val));
  /** @type {number} */
  this._userVolume = val;
  this._implSetVolume(val);
  this.notify(AudioPlayer.EVENT_VOLUME, val);
}, AudioPlayer.prototype.getVolume = function() {
  return void 0 === this._userVolume ? 0.8 : this._userVolume;
}, AudioPlayer.prototype.seek = function(pos) {
  this._implSeekImmediate(pos);
}, AudioPlayer.prototype._ensureHasURL = function(entry, callback) {
  /** @type {Array} */
  var keys = [];
  this._currentUrlEnsure = this._currentUrlEnsure || {};
  var ret = AudioUtils.asObject(entry);
  if (ret.url) {
    return callback && callback(entry);
  }
  var dest = this.getCurrentPlaylist();
  var fromIndex = dest.indexOfAudio(entry);
  if (fromIndex >= 0) {
    var i = fromIndex;
    for (;fromIndex + 5 > i;i++) {
      var match = AudioUtils.asObject(dest.getAudioAt(i));
      if (!!match) {
        if (!match.url) {
          if (!this._currentUrlEnsure[match.fullId]) {
            keys.push(match.fullId);
            /** @type {boolean} */
            this._currentUrlEnsure[match.fullId] = true;
          }
        }
      }
    }
  }
  if (keys.push(ret.fullId), keys.length) {
    var that = this;
    ajax.post("al_audio.php", {
      act : "reload_audio",
      ids : keys.join(",")
    }, {
      /**
       * @param {?} initial
       * @param {?} deepDataAndEvents
       * @return {undefined}
       */
      onDone : function(initial, deepDataAndEvents) {
        getAudioPlayer().setStatusExportInfo(deepDataAndEvents);
        each(initial, function(dataAndEvents, message) {
          message = AudioUtils.asObject(message);
          var h2 = {};
          h2[AudioUtils.AUDIO_ITEM_INDEX_URL] = message.url;
          that.updateAudio(message.fullId, h2);
          if (ret.fullId == message.fullId) {
            entry[AudioUtils.AUDIO_ITEM_INDEX_URL] = message.url;
          }
          if (that.currentAudio) {
            if (AudtioUtils.asObject(that.currentAudio).fullId == message.fullId) {
              that.currentAudio[AudioUtils.AUDIO_ITEM_INDEX_URL] = message.url;
            }
          }
          delete that._currentUrlEnsure[message.fullId];
        });
        if (callback) {
          callback(entry);
        }
      }
    });
  }
}, AudioPlayer.prototype.toggleAudio = function(matchIndex, subject) {
  var el = domClosest("_audio_row", matchIndex);
  var o = cur.cancelClick || subject && (hasClass(subject.target, "audio_lyrics") || (domClosest("_audio_duration_wrap", subject.target) || (domClosest("_audio_inline_player", subject.target) || domClosest("audio_performer", subject.target))));
  if (cur._sliderMouseUpNowEl && (cur._sliderMouseUpNowEl == geByClass1("audio_inline_player_progress", el) && (o = true)), delete cur.cancelClick, delete cur._sliderMouseUpNowEl, o) {
    return true;
  }
  var option = AudioUtils.getAudioFromEl(el, true);
  if (AudioUtils.isClaimedAudio(option)) {
    var options = AudioUtils.getAudioExtra(option);
    var model = options.claim;
    return void showAudioClaimWarning(option.ownerId, option.id, model.deleteHash, model.id, option.title);
  }
  var fontSize = hasClass(el, AudioUtils.AUDIO_PLAYING_CLS);
  if (fontSize) {
    this.pause();
  } else {
    var orig = AudioUtils.getContextPlaylist(el);
    this.play(option.fullId, orig);
  }
}, AudioPlayer.prototype._onFailedUrl = function(dataAndEvents) {
  this.notify(AudioPlayer.EVENT_FAILED);
  if (this.isPlaying()) {
    this.pause();
    this.playNext(true);
  }
}, AudioPlayer.prototype.switchToPrevPlaylist = function() {
  if (this._prevPlaylist) {
    this.pause();
    setTimeout(function() {
      this._currentPlaylist = this._prevPlaylist;
      this._currentAudio = this._prevAudio;
      /** @type {null} */
      this._prevPlaylist = this._prevAudio = null;
      this.notify(AudioPlayer.EVENT_PLAYLIST_CHANGED, this._currentPlaylist);
      this.notify(AudioPlayer.EVENT_UPDATE);
      this.updateCurrentPlaying();
    }.bind(this), 1);
  }
}, AudioPlayer.prototype.play = function(key, type, expectedNumberOfNonCommentArgs, deepDataAndEvents) {
  if (!cur.loggingOff) {
    if (!this._impl) {
      return void AudioUtils.showNeedFlashBox();
    }
    if (isObject(key) || isArray(key)) {
      key = AudioUtils.asObject(key);
      if (key) {
        key = key.fullId;
      }
    }
    var el = AudioUtils.asObject(this._currentAudio);
    var normal = this.getCurrentPlaylist();
    if (!key) {
      if (el) {
        key = el.fullId;
      }
    }
    /** @type {boolean} */
    var b = false;
    /** @type {boolean} */
    var a = false;
    a = key && (el && key == el.fullId);
    if (type) {
      if (normal) {
        /** @type {boolean} */
        b = type == normal.getSelf() || type == normal;
      }
    } else {
      type = normal;
      /** @type {boolean} */
      b = true;
    }
    if (a && b) {
      if (!this.isPlaying()) {
        /** @type {boolean} */
        this._isPlaying = true;
        this._sendLCNotification();
        this.notify(AudioPlayer.EVENT_PLAY);
        var camelKey = type.getAudio(key);
        this._implClearAllTasks();
        this._implSetVolume(0);
        this._implSetUrl(camelKey);
        this._implPlay();
        this._implSetVolume(this.getVolume(), true);
      }
    } else {
      if (key) {
        camelKey = type.getAudio(key);
        if (camelKey) {
          if (!b) {
            if (this._currentPlaylist) {
              this._prevPlaylist = this._currentPlaylist;
              this._prevAudio = this._currentAudio;
            }
            this._currentPlaylist = new AudioPlaylist(type);
          }
          /** @type {number} */
          this._listenedTime = this._prevProgress = 0;
          this._currentAudio = camelKey;
          /** @type {boolean} */
          this._isPlaying = true;
          this._sendLCNotification();
          this.notify(AudioPlayer.EVENT_PLAY, true, intval(expectedNumberOfNonCommentArgs), deepDataAndEvents);
          /** @type {boolean} */
          this._muteProgressEvents = true;
          this._implClearAllTasks();
          if (deepDataAndEvents) {
            this._implSetUrl(camelKey);
            this._implPlay();
            this._implSetVolume(this.getVolume());
          } else {
            this._implSetVolume(0, true);
            this._implSetDelay(200);
            this._implSetUrl(camelKey);
            this._implPlay();
            this._implSetVolume(this.getVolume());
          }
          if (!b) {
            this._initPlaybackParams();
            this.notify(AudioPlayer.EVENT_PLAYLIST_CHANGED, type);
          }
        }
      }
    }
  }
}, AudioPlayer.prototype._prefetchAudio = function(entry) {
  if ("html5" == this._impl.type) {
    entry = AudioUtils.asObject(entry);
    if (entry) {
      if (entry.url) {
        this._impl.prefetch(entry.url);
      }
    }
  }
}, AudioPlayer.prototype.getCurrentPlaylist = function() {
  return this._currentPlaylist;
}, AudioPlayer.prototype.getPlaylists = function() {
  return clone(this._playlists);
}, AudioPlayer.prototype.pause = function() {
  /** @type {boolean} */
  this._isPlaying = false;
  this.notify(AudioPlayer.EVENT_PAUSE);
  this._implSetVolume(0, true);
  this._implPause();
}, AudioPlayer.prototype.stop = function() {
  /** @type {boolean} */
  this._isPlaying = false;
  this._impl.stop();
  this.notify(AudioPlayer.EVENT_STOP);
}, AudioPlayer.prototype.isPlaying = function() {
  return this._isPlaying;
}, AudioPlayer.prototype.getCurrentAudio = function() {
  return this._currentAudio;
}, AudioPlayer.prototype.playNext = function(deepDataAndEvents) {
  this._playNext(1, deepDataAndEvents);
}, AudioPlayer.prototype.playPrev = function() {
  this._playNext(-1);
}, AudioPlayer.prototype._playNext = function(expectedNumberOfNonCommentArgs, deepDataAndEvents) {
  var failuresLink = this.getCurrentAudio();
  var loop = this.getCurrentPlaylist();
  var _this = this;
  if (failuresLink && loop) {
    if (expectedNumberOfNonCommentArgs > 0) {
      var camelKey = loop.getNextAudio(failuresLink);
      if (camelKey) {
        this.play(camelKey, loop, 1, deepDataAndEvents);
      } else {
        if (loop.isLive()) {
          /** @type {boolean} */
          this._muteProgressEvents = true;
          loop.fetchNextLiveAudio(function(key) {
            _this.play(key, loop, 1, deepDataAndEvents);
          });
        } else {
          camelKey = loop.getAudioAt(0);
          this.play(camelKey, loop, 1, deepDataAndEvents);
        }
      }
    } else {
      /** @type {number} */
      var modId = loop.indexOfAudio(this._currentAudio) - 1;
      if (0 > modId) {
        this.seek(0);
      } else {
        this.play(loop.getAudioAt(modId), loop, -1, deepDataAndEvents);
      }
    }
  }
}, AudioPlayerFlash.onAudioFinishCallback = function() {
  var data = window._flashAudioInstance;
  if (data.opts.onEnd) {
    data.opts.onEnd();
  }
}, AudioPlayerFlash.onAudioProgressCallback = function(dataAndEvents, lvl) {
  var o = window._flashAudioInstance;
  if (lvl) {
    /** @type {boolean} */
    o._total = lvl;
    /** @type {number} */
    o._currProgress = dataAndEvents / lvl;
    if (o.opts.onProgressUpdate) {
      o.opts.onProgressUpdate(o._currProgress);
    }
  }
}, AudioPlayerFlash.onAudioLoadProgressCallback = function(distance, startDistance) {
  var event = window._flashAudioInstance;
  /** @type {number} */
  event._currBuffered = distance / startDistance;
  if (event.opts.onBufferUpdate) {
    event.opts.onBufferUpdate(event._currBuffered);
  }
}, AudioPlayerFlash.prototype.fadeVolume = function(v, $sanitize) {
  return this.setVolume(v), $sanitize();
}, AudioPlayerFlash.prototype.type = "flash", AudioPlayerFlash.PLAYER_EL_ID = "flash_audio", AudioPlayerFlash.prototype.destroy = function() {
  re(AudioPlayerFlash.PLAYER_EL_ID);
}, AudioPlayerFlash.prototype.onReady = function(callback) {
  if (this._player) {
    return callback(true);
  }
  if (this._player === false) {
    return callback(false);
  }
  /** @type {Function} */
  this._onReady = callback;
  var obj = {
    url : "/swf/audio_lite.swf",
    id : "player",
    height : 2
  };
  var r20 = {
    swliveconnect : "true",
    allowscriptaccess : "always",
    wmode : "opaque"
  };
  var restoreScript = {
    onPlayFinish : "AudioPlayerFlash.onAudioFinishCallback",
    onLoadProgress : "AudioPlayerFlash.onAudioLoadProgressCallback",
    onPlayProgress : "AudioPlayerFlash.onAudioProgressCallback"
  };
  if (!ge(AudioPlayerFlash.PLAYER_EL_ID)) {
    document.body.appendChild(ce("div", {
      id : AudioPlayerFlash.PLAYER_EL_ID,
      className : "fixed"
    }));
  }
  var _checkFlashLoaded = this;
  if (renderFlash(AudioPlayerFlash.PLAYER_EL_ID, obj, r20, restoreScript)) {
    setTimeout(function() {
      _checkFlashLoaded._checkFlashLoaded();
    }, 50);
  }
}, AudioPlayerFlash.prototype.setUrl = function(newUrl, callback) {
  return this._url == newUrl ? void(callback && callback(true)) : (this._url = newUrl, this._player && this._player.loadAudio(newUrl), void(callback && callback(true)));
}, AudioPlayerFlash.prototype.setVolume = function(v) {
  if (this._player) {
    if (this._player.setVolume) {
      this._player.setVolume(v);
    }
  }
}, AudioPlayerFlash.prototype.play = function() {
  if (this._player) {
    this._player.playAudio();
  }
}, AudioPlayerFlash.prototype.seek = function(pos) {
  /** @type {number} */
  var r20 = (this._total || 0) * pos;
  if (this._player) {
    this._player.playAudio(r20);
  }
}, AudioPlayerFlash.prototype.pause = function() {
  if (this._player) {
    this._player.pauseAudio();
  }
}, AudioPlayerFlash.prototype.isFullyLoaded = function() {
  return false;
}, AudioPlayerFlash.prototype.getPlayedTime = function() {
  return 0;
}, AudioPlayerFlash.prototype.getCurrentProgress = function() {
  return this._currProgress || 0;
}, AudioPlayerFlash.prototype.getCurrentBuffered = function() {
  return this._currBuffered || 0;
}, AudioPlayerFlash.prototype.stop = function() {
  if (this._player) {
    this._player.stopAudio();
  }
}, AudioPlayerFlash.prototype._checkFlashLoaded = function() {
  var player = ge("player");
  if (this._checks = this._checks || 0, this._checks++, this._checks > 10) {
    /** @type {boolean} */
    this._player = false;
    var throttledUpdate = this._onReady;
    return throttledUpdate && throttledUpdate(false);
  }
  if (player && player.paused) {
    this._player = player;
    throttledUpdate = this._onReady;
    if (throttledUpdate) {
      throttledUpdate(true);
    }
    /** @type {null} */
    this._onReady = null;
  } else {
    var _checkFlashLoaded = this;
    setTimeout(function() {
      _checkFlashLoaded._checkFlashLoaded();
    }, 100);
  }
}, AudioPlayerHTML5.AUDIO_EL_ID = "ap_audio", AudioPlayerHTML5.STATE_HAVE_NOTHING = 0, AudioPlayerHTML5.STATE_HAVE_FUTURE_DATA = 3, AudioPlayerHTML5.HAVE_ENOUGH_DATA = 4, AudioPlayerHTML5.SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=", AudioPlayerHTML5.isSupported = function() {
  /** @type {string} */
  var ua = "undefined" != typeof navigator ? navigator.userAgent : "";
  if (ua && ((browser.vivaldi || browser.opera) && (/(Windows 7|Windows NT 6.1)/.test(ua) || /(Windows NT 5.1|Windows XP)/.test(ua)))) {
    return false;
  }
  /** @type {Element} */
  var elem = document.createElement("audio");
  return!(!elem.canPlayType || !elem.canPlayType('audio/mpeg; codecs="mp3"').replace(/no/, ""));
}, AudioPlayerHTML5.prototype.type = "html5", AudioPlayerHTML5.prototype.destroy = function() {
}, AudioPlayerHTML5.prototype.getPlayedTime = function() {
  var segment = this._currentAudioEl.played;
  /** @type {number} */
  var getPlayedTime = 0;
  /** @type {number} */
  var i = 0;
  for (;i < segment.length;i++) {
    getPlayedTime += segment.end(i) - segment.start(i);
  }
  return getPlayedTime;
}, AudioPlayerHTML5.prototype._createAudioNode = function(deepDataAndEvents) {
  var audio = new Audio;
  var data = this;
  return this.opts.onBufferUpdate && addEvent(audio, "progress", function() {
    if (data._currentAudioEl == audio) {
      data.opts.onBufferUpdate(data.getCurrentBuffered());
    }
    var ranges = audio.buffered;
    ranges.length;
    if (1 == ranges.length) {
      if (0 == ranges.start(0)) {
        if (ranges.end(0) == audio.duration) {
          /** @type {boolean} */
          audio._fullyLoaded = true;
        }
      }
    }
  }), this.opts.onProgressUpdate && addEvent(audio, "timeupdate", function() {
    if (data._currentAudioEl == audio) {
      data.opts.onProgressUpdate(data.getCurrentProgress());
    }
  }), this.opts.onEnd && addEvent(audio, "ended", function() {
    if (data._currentAudioEl == audio) {
      data.opts.onEnd();
    }
  }), this.opts.onSeeked && addEvent(audio, "seeked", function() {
    if (data._currentAudioEl == audio) {
      data.opts.onSeeked();
    }
  }), this.opts.onSeek && addEvent(audio, "seeking", function() {
    if (data._currentAudioEl == audio) {
      data.opts.onSeek();
    }
  }), addEvent(audio, "error", function() {
    if (data._prefetchAudioEl == audio) {
      data._prefetchAudioEl = data._createAudioNode();
    } else {
      if (data._currentAudioEl == audio) {
        if (data.opts.onFail) {
          data.opts.onFail();
        }
      }
    }
  }), addEvent(audio, "canplay", function() {
    data._prefetchAudioEl == audio;
    if (data._currentAudioEl == audio) {
      if (data.opts.onCanPlay) {
        data.opts.onCanPlay();
      }
      if (data._seekOnReady) {
        data.seek(data._seekOnReady);
        /** @type {boolean} */
        data._seekOnReady = false;
      }
    }
  }), deepDataAndEvents && (audio.src = deepDataAndEvents, audio.preload = "auto", audio.volume = this._volume || 1, audio.load()), this._audioNodes.push(audio), audio;
}, AudioPlayerHTML5.prototype.onReady = function(cb) {
  cb(true);
}, AudioPlayerHTML5.prototype.prefetch = function(deepDataAndEvents) {
  if (this._prefetchAudioEl) {
    /** @type {string} */
    this._prefetchAudioEl.src = AudioPlayerHTML5.SILENCE;
  }
  this._prefetchAudioEl = this._createAudioNode(deepDataAndEvents);
}, AudioPlayerHTML5.prototype.seek = function(pos) {
  var that = this._currentAudioEl;
  if (isNaN(that.duration)) {
    /** @type {number} */
    this._seekOnReady = pos;
  } else {
    /** @type {number} */
    that.currentTime = that.duration * pos;
  }
}, AudioPlayerHTML5.prototype.setVolume = function(v) {
  if (void 0 === v) {
    v = this._currentAudioEl.volume;
  }
  /** @type {number} */
  this._currentAudioEl.volume = v;
  if (this._prefetchAudioEl) {
    /** @type {number} */
    this._prefetchAudioEl.volume = v;
  }
  /** @type {number} */
  this._volume = v;
}, AudioPlayerHTML5.prototype.getCurrentProgress = function() {
  var video = this._currentAudioEl;
  return isNaN(video.duration) ? 0 : Math.max(0, Math.min(1, video.currentTime / video.duration));
}, AudioPlayerHTML5.prototype.getCurrentBuffered = function() {
  var res = this._currentAudioEl;
  return res && res.buffered.length ? Math.min(1, res.buffered.end(0) / res.duration) : 0;
}, AudioPlayerHTML5.prototype.isFullyLoaded = function() {
  return this._currentAudioEl._fullyLoaded;
}, AudioPlayerHTML5.prototype.setUrl = function(value, callback) {
  var element = this._currentAudioEl;
  if (this._seekOnReady = false, element.src == value) {
    return this.opts.onCanPlay && this.opts.onCanPlay(), callback && callback(true);
  }
  if (this._prefetchAudioEl && this._prefetchAudioEl.readyState > AudioPlayerHTML5.STATE_HAVE_NOTHING) {
    if (this._prefetchAudioEl.src == value) {
      this._currentAudioEl.pause(0);
      /** @type {string} */
      this._currentAudioEl.src = AudioPlayerHTML5.SILENCE;
      var server = this;
      if (this._prefetchAudioEl.readyState >= AudioPlayerHTML5.STATE_HAVE_FUTURE_DATA) {
        setTimeout(function() {
          if (server.opts.onCanPlay) {
            server.opts.onCanPlay();
          }
        });
      }
      element = this._currentAudioEl = this._prefetchAudioEl;
      /** @type {boolean} */
      this._prefetchAudioEl = false;
    } else {
      if (this._prefetchAudioEl.src) {
        /** @type {string} */
        this._prefetchAudioEl.src = AudioPlayerHTML5.SILENCE;
      }
    }
  }
  return element.src != value && (element.src = value, element.load()), callback && callback(true);
}, AudioPlayerHTML5.prototype.play = function(key) {
  if (this._prefetchAudioEl.src == key) {
    if (this._prefetchAudioEl.readyState > AudioPlayerHTML5.STATE_HAVE_NOTHING) {
      /** @type {string} */
      this._currentAudioEl.src = AudioPlayerHTML5.SILENCE;
      this._currentAudioEl = this._prefetchAudioEl;
      this._prefetchAudioEl = this._createAudioNode();
      if (this.opts.onCanPlay) {
        this.opts.onCanPlay();
      }
    }
  }
  var video = this._currentAudioEl;
  if (video.src) {
    try {
      video.play();
    } catch (e) {
      debugLog("Audio: url set failed (html5 impl)");
    }
  }
}, AudioPlayerHTML5.prototype.pause = function() {
  var source = this._currentAudioEl;
  if (source.src) {
    source.pause();
  }
}, AudioPlayerHTML5.prototype.stop = function() {
  var g = this._currentAudioEl;
  /** @type {string} */
  g.src = AudioPlayerHTML5.SILENCE;
}, AudioPlayerHTML5.prototype._setFadeVolumeInterval = function(func) {
  if (func) {
    if (!this._fadeVolumeWorker && (window.Worker && window.Blob)) {
      /** @type {Blob} */
      var blob = new Blob(["         var interval;         onmessage = function(e) {           clearInterval(interval);           if (e.data == 'start') {             interval = setInterval(function() { postMessage({}); }, 20);           }         }       "]);
      try {
        /** @type {Worker} */
        this._fadeVolumeWorker = new Worker(window.URL.createObjectURL(blob));
      } catch (e) {
        /** @type {boolean} */
        this._fadeVolumeWorker = false;
      }
    }
    if (this._fadeVolumeWorker) {
      this._fadeVolumeWorker.onmessage = func;
      this._fadeVolumeWorker.postMessage("start");
    } else {
      /** @type {number} */
      this._fadeVolumeInterval = setInterval(func, 60);
    }
  } else {
    if (this._fadeVolumeWorker) {
      this._fadeVolumeWorker.terminate();
      /** @type {null} */
      this._fadeVolumeWorker = null;
    }
    if (this._fadeVolumeInterval) {
      clearInterval(this._fadeVolumeInterval);
    }
  }
}, AudioPlayerHTML5.prototype.fadeVolume = function(x, yes) {
  /** @type {number} */
  x = Math.max(0, Math.min(1, x));
  var self = this._currentAudioEl;
  /** @type {number} */
  var y_inc = 0;
  if (y_inc = x < self.volume ? -0.04 : 0.001, Math.abs(x - self.volume) <= 0.001) {
    return this._setFadeVolumeInterval(), yes && yes();
  }
  var y = self.volume;
  this._setFadeVolumeInterval(function() {
    if (y_inc > 0) {
      y_inc *= 1.2;
    }
    y += y_inc;
    /** @type {boolean} */
    var e = false;
    return(e = 0 > y_inc ? x >= y : y >= x) ? (this.setVolume(x), this._setFadeVolumeInterval(), yes && yes()) : void this.setVolume(y);
  }.bind(this));
};
try {
  stManager.done("audioplayer.js");
} catch (e$$90) {
}
;
