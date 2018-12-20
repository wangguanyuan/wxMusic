let app = getApp();
Page({
  data :{
    searchResult:[]
  },

  onShow: function(query) {
    console.log('load');
    // wx.setStorage({
    //   key: 'key2',
    //   data: [{ name: '好好' }, { name: '哈哈' }]
    // })
    var list = wx.getStorageSync("playlist");
    var gettype = Object.prototype.toString;
    console.log(gettype.call(list));
    if (list == null || gettype.call(list) != '[object Array]')
      list = [];

    this.setData({ searchResult: list });
    app.setMusicList(list);
    console.log('list:');console.log(list);
    if (app.getNewAdd() != null && app.getNewAdd()) {
      list.push(app.getMusic());
      app.setNewAdd(false);
      app.setPlaying(true);
      app.setMusicIdx(list.length - 1);
      app.setMusicList(list);

      wx.switchTab({
        "url": "../play/index"
      });
      console.log('add');  
    }
    console.log('leap');
    

  },
  onHide : function() {
    wx.setStorage({
      key: 'playlist',
      // data: [{
      //   name: "好好 (想把你写成一首歌)",
      //   artists: "五月天",
      //   album: "自传",
      //   url: 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?&jsonpCallback=MusicJsonCallback&cid=205361747&songmid=003OMDn53KlYMg&filename=C400003OMDn53KlYMg.m4a&guid=6612300644'
      // }]
      data: app.getMusicList()
      
    });
    this.setData({ searchResult: app.getMusicList() });
    console.log('saved')
  },
  openLoading: function () {
    wx.showToast({
      title: '数据加载中',
      icon: 'loading',
      duration: 1000,
      mask: 'true'
    });
  },
  closeLoading: function () {
    wx.hideToast();
  },
 

  playMusic: function (e) {
    console.log('play');
    let musicIndex = e.currentTarget.id;
    if (app.getMusicList()[musicIndex]) {
      app.setMusic(app.getMusicList()[musicIndex]);
      app.setMusicIdx(musicIndex);
      app.setPlaying(true);
    }
    wx.switchTab({
      "url": "../play/index"
    });
  },
 
});
