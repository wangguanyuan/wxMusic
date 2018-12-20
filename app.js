//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var music = wx.getStorageSync('music') || null;
    this.setMusic(music);
  },
  setMusic: function(m){
    this.globalData.music = m;
    wx.setStorageSync('music', m);
  },
  getMusic: function(){
    return this.globalData.music;
  },
  setPlaying: function(p){
    this.globalData.playing = p;
  },
  getPlaying: function(){
    return this.globalData.playing;
  },
  setMusicIdx :function(id) {
    this.globalData.music_idx = id;
  },
  setNewAdd : function(b) {
    this.globalData.newAdd = b;
  },
  getMusicIdx : function() {
    return this.globalData.music_idx;
  },
  getNewAdd:function() {
    return this.globalData.newAdd;
  },
  getMusicList:function() {
    return this.globalData.musicList;
  }, 
  setMusicList:function(list) {
    this.globalData.musicList = list;
  },
  globalData:{
    music:null,
    playing:false,
    music_idx:0,
    newAdd:false,
    musicList:[]
  }
})