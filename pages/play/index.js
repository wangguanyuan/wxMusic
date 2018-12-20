 /**
  * 这里不记录页面状态了，重新启动程序以后只记得当前在播的歌曲，不记录播放进度
  * 本来打算把所有状态都放到一个对象里，但是很难维护，还是做简单的业务逻辑流转吧
  * 小程序对于CSS3动画支持非常差，这里只能用微信自带的动画api曲线救国了
  */
let app = getApp();
let util = require("../../utils/util.js");
Page({
  data: {
      music: null,
      totalTime: "00:00",
      totalSeconds: 0,
      currentTime: "00:00",
      currentSeconds: 0,
      option:'播放',
      intervalId: null,
      animationState:'paused !important;',
      playingNeedle:'',
      playing:false,
      animationIntervalId: null,
      rotateCount: 0,
  },
  onLoad:function(){
      console.log('load');
      let that = this;
      wx.onBackgroundAudioPlay(function(){
          console.log('')
          that.setData({
            animationState: 'running !important;',
            playingNeedle: 'playing_needle',
            playing: true,
            option: '暂停',
            totalTime: util.formatMinute(that.data.music.duration/1000),
            totalSeconds: that.data.music.duration/1000
          });
          let animation = wx.createAnimation({
              duration:100,
          });
          //表示新进来的音乐 这里不复原角度了，会很麻烦
          if(that.data.animationIntervalId != null){
              clearInterval(that.data.animationIntervalId);
          }                    
          that.data.animationIntervalId = setInterval(function(){
              that.setData({
                animation:animation.rotate((++that.data.rotateCount)*2).step().export()
              });
          },100);
          that.data.intervalId = setInterval(function(){
              wx.getBackgroundAudioPlayerState({
                success: function(res) {
                    var status = res.status;
                    var dataUrl = res.dataUrl;
                    var currentPosition = res.currentPosition;
                    var duration = res.duration;
                    var downloadPercent = res.downloadPercent;
                    //如果是没音乐或者暂停了 则停止
                    if (status == 2) {
                      console.log('next');
                        that.next();
                    }
                    if((status == 2 || status == 0) && that.data.intervalId != null){
                      clearInterval(that.data.intervalId);
                      that.data.intervalId = null;
                      return;
                    }
                    //如果正在播
                    if(status == 1){
                      that.setData({
                        currentTime: util.formatMinute(currentPosition),
                        currentSeconds: currentPosition,
                        totalTime: util.formatMinute(duration),
                        totalSeconds: duration
                      });
                    }

                }
            })
          }, 1000);
      });
      wx.onBackgroundAudioPause(function(){
        console.log('pause');
        if(that.data.intervalId != null){
          clearInterval(that.data.intervalId);
        }
        if(that.data.animationIntervalId != null){
          clearInterval(that.data.animationIntervalId);
        }
        that.setData({
          animation:"",
          animationState: 'paused !important;',
          playingNeedle: '',
          playing: false,
          intervalId: null,
          animationIntervalId: null,
          option: '播放'
        });
      });
      wx.onBackgroundAudioStop(function(){
        console.log('next');
        that.next();
        if(that.data.intervalId != null){
          clearInterval(that.data.intervalId);
        }
        if(that.data.animationIntervalId != null){
          clearInterval(that.data.animationIntervalId);
        }
        that.setData({
          animationState: 'paused !important;',
          animation:"",
          playingNeedle: '',
          playing: false,
          intervalId: null,
          animationIntervalId: null,
          option: '播放'
        });
      });
  },
  onReady: function (e) {
      console.log('ready');
  },
  onShow:function(){
    console.log('show');
    let appMusic = app.getMusic();
    let selfMusic = this.data.music;
    if (appMusic == null) {
      console.log('music null');
      return;
    }
    wx.setNavigationBarTitle({
      title: appMusic.name
    });
    //需要新播放
    if (selfMusic == null || selfMusic.id != appMusic.id) {
      this.setData({
        music: appMusic,
        totalTime: util.formatMinute(appMusic.duration / 1000),
        totalSeconds: appMusic.duration / 1000,
        currentTime: "00:00",
        currentSeconds: 0,
      });
      if (app.getPlaying()) {
        this.audioPlay();
      }
    }
  },
  //播放或者暂停
  audioOption: function(){
    let that = this;
    wx.getBackgroundAudioPlayerState({
      success: function(res) {
          var status = res.status;
          var dataUrl = res.dataUrl;
          var currentPosition = res.currentPosition;
          var duration = res.duration;
          var downloadPercent = res.downloadPercent;
          //如果是不在播 则播放
          if(status == 2 && that.data.music != null){
            that.audioPlay();
            return;
          }
          //如果正在播 不管了
          if(status == 1){
            that.audioPause();
            return;
          }
          //如果是暂停 则继续播
          if(status == 0 && that.data.music != null){
            that.audioPlay(false);
            return;
          }
      }
    });
  },
  audioPlay: function () {
    let that = this;
    let music = this.data.music;
    console.log('play');
    wx.playBackgroundAudio({
        dataUrl: music.url,
        title: music.name,
        coverImgUrl: music.pic,
        success: function(){

          console.log('success');
        },
        fail: function(){
          console.log('fail');
          //TODO 播放失败
        },
        
    })
  },
  audioPause: function () {
    let that = this;
    wx.pauseBackgroundAudio({
      success: function(res){
        
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
        console.log('complete');
      }
    })
  },
  seekMusic: function(e){
    let seek = e.detail.value;
    let that = this;
    wx.seekBackgroundAudio({
      position: seek,
      success: function(res){
        that.setData({
          currentTime:util.formatMinute(seek)
        });
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },prev:function() {
    console.log('prev');
    
    var list = app.getMusicList();
    var musicIndex = (app.getMusicIdx() - 1 + list.length) % list.length;
    console.log(musicIndex);
    if (list[musicIndex]) {
      app.setMusic(list[musicIndex]);
      app.setPlaying(true);
      app.setMusicIdx(musicIndex);
      this.setData({
        music: list[musicIndex],
        totalTime: util.formatMinute(list[musicIndex].duration / 1000),
        totalSeconds: list[musicIndex].duration / 1000,
        currentTime: "00:00",
        currentSeconds: 0,
      });
    }
    this.audioPlay();
  }, next: function () {
    console.log('prev');

    var list = app.getMusicList();
    var musicIndex = (app.getMusicIdx() + 1 ) % list.length;
    console.log(musicIndex);
    if (list[musicIndex]) {
      app.setMusic(list[musicIndex]);
      app.setPlaying(true);
      app.setMusicIdx(musicIndex);
      this.setData({
        music: list[musicIndex],
        totalTime: util.formatMinute(list[musicIndex].duration / 1000),
        totalSeconds: list[musicIndex].duration / 1000,
        currentTime: "00:00",
        currentSeconds: 0,
      });
    }
    this.audioPlay();
  }
})