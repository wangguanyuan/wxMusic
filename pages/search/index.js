let app = getApp();
Page({
    data: {
        inputShowed: false,
        keyword: "",
        haveInput: false,
      searchResult: null,
        pageNum: 0,
        isLoading: false,
        noExtra: false
    },
    
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            keyword: "",
            inputShowed: false,
            searchResult: null,
            haveInput:false,
            noExtra:false,
            isLoading:false,
            pageNum: 0
        });
    },
    clearInput: function () {
        this.setData({
            keyword: "",
            searchResult: null,
            haveInput:false,
            noExtra:false,
            isLoading:false,
            pageNum:0
        });
    },
    inputTyping: function (e) {
        this.setData({
            haveInput: e.detail.value == "" ? false:true
        });
    },
    inputConfirm: function(e){
        if(e.detail.value != ''){
            if(this.data.keyword != e.detail.value){
                this.setData({
                    keyword: e.detail.value,
                    searchResult: null,
                    noExtra:false,
                    isLoading:false,
                    pageNum:0
                });
                this.search(e.detail.value);
            }
        }
    },
    openLoading: function () {
        wx.showToast({
            title: '数据加载中',
            icon: 'loading',
            duration: 1000,
            mask: 'true'
        });
    },
    closeLoading: function(){
        wx.hideToast();
    },
    onReachBottom: function(){
        if(this.data.isLoading || this.data.pageNum < 1 || this.data.noExtra){
            return;
        }
        this.setData({
                isLoading: true
        });
        this.search(this.data.keyword, this.data.pageNum+1);
    },
    
  search: function (keyword, page = 1) {
    console.log('search')
    let that = this;
    this.data.keyword = keyword;
    if (page == 1) {
      this.openLoading();
    }
    console.log('request wyy');
    wx.request({

      url: 'https://music.163.com/api/search/pc',
      data: {
        s:keyword,
        offset:5 * (page - 1),
        limit:5,
        type:1
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          pageNum: page,
          keyword: keyword,
          noExtra: res.data.result.length == 0 ? true : false
        });
        let searchResult = [];
        console.log(typeof(res))
        console.log(res)
        
        var songs = res.data.result.songs;
        console.log(songs)
        songs.forEach(function (e) {
          var tmp = {};
          tmp = e;
          tmp.name = e.name
          tmp.pic = e.album.picUrl;
          tmp.url = 'https://music.163.com/song/media/outer/url?id=' + e.id + '.mp3'
          tmp.artists = e.artists[0].name;
          tmp.album = e.album.name;
          console.log(tmp.url)
          searchResult.push(tmp);

        });
        console.log('request qq')
        wx.request({

          url: 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp?ct=24&qqmusic_ver=1298&new_json=1&remoteplace=txt.yqq.song&searchid=67191181401755174&t=0&aggr=1&cr=1&catZhida=1&lossless=0&flag_qc=0&g_tk=5381&jsonpCallback=MusicJsonCallback14201065135182778&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0'
          ,
          data: {
            w: keyword,
            p: page,
            n: 5
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            console.log(typeof (res))
            console.log(res)
            var s = res.data.substring(35, res.data.length - 1)



            var songs = JSON.parse(s);
            songs = songs.data.song.list;
            console.log(songs)


            that.deal(that, songs, 0, searchResult, page);


            
          }
        }) 

        




      }
    })

    

    

  },

  deal: function (that, songs, n, searchResult, page) {
    console.log('n : ' + n);
    if (n >= songs.length) {

      if (that.data.searchResult != null) {
        searchResult = that.data.searchResult.concat(searchResult);
      }
      that.setData({
        searchResult: searchResult,
        isLoading: false,
        
      });
      if (page == 1) {
        that.closeLoading();
      }
      return;
    }
    var tmp = {};
    var e = songs[n];
    tmp = e;
    tmp.name = e.name;
    tmp.artists = e.singer[0].name;
    tmp.album = e.album.name;

    
    if (e.media_mid == null) {
      //pay

      wx.request({
        url: 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?&jsonpCallback=MusicJsonCallback&cid=205361747&songmid=' + e.mid + '&filename=C400' + e.mid + '.m4a&guid=6612300644',
        method: 'GET',
        dataType: 'json',
        'content-type': 'application/json',
        responseType: 'text',
        success: function (res) {
          console.log('url ' + 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?&jsonpCallback=MusicJsonCallback&cid=205361747&songmid=' + e.mid + '&filename=C400' + e.mid + '.m4a&guid=6612300644')
         
          var vkey = res.data.data.items[0].vkey;
          
          tmp.url = 'http://117.169.85.28/amobile.music.tc.qq.com/C400' + e.mid + '.m4a?guid=6612300644&vkey=' + vkey + '&uin=0&fromtag=66';
          console.log('music:');
          console.log(tmp);
          searchResult.push(tmp);
          console.log('length of r2 ' + searchResult.length);
          that.deal(that, songs, n + 1, searchResult, page);
        },
      })

    } else {
      wx.request({
        url: 'https://u.y.qq.com/cgi-bin/musicu.fcg?callback=getplaysongvkey08071486305347375&jsonpCallback=getplaysongvkey08071486305347375&data=%7B%22req%22%3A%7B%22module%22%3A%22CDN.SrfCdnDispatchServer%22%2C%22param%22%3A%7B%22guid%22%3A%22119744544%22%2C%22calltype%22%3A0%2C%22userip%22%3A%22%22%7D%7D%2C%22req_0%22%3A%7B%22module%22%3A%22vkey.GetVkeyServer%22%2C%22method%22%3A%22CgiGetVkey%22%2C%22param%22%3A%7B%22guid%22%3A%22119744544%22%2C%22songmid%22%3A%5B%22' + e.songmid + '%22%5D%2C%22songtype%22%3A%5B0%5D%2C%22uin%22%3A%220%22%2C%22loginflag%22%3A1%7D%7D%7D',
        data: { "req": { "module": "CDN.SrfCdnDispatchServer", "param": { "guid": "119744544", "calltype": 0, "userip": "" } }, "req_0": { "module": "vkey.GetVkeyServer", "method": "CgiGetVkey", "param": { "guid": "119744544", "songmid": ["003OMDn53KlYMg"], "songtype": [0], "uin": "0", "loginflag": 1, "platform": "20" } }, "comm": { "uin": 0, "format": "json" } },

        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          var s = res.data.substring(33, res.length - 1)
          console.log(s)
          s = JSON.parse('aha'+s);
          tmp.url = 'http://117.169.70.21/amobile.music.tc.qq.com/' + s.req_0.data.midurlinfo[0]['purl'];


          console.log('music:');
          console.log(tmp);
          searchResult.push(tmp);
          console.log('length of r2 ' + searchResult.length);
          that.deal(that, songs, n + 1, searchResult, page);
        },
      })


    }

  },
  
    playMusic: function(e){
        let musicIndex = e.currentTarget.id;
        if(this.data.searchResult[musicIndex]){
          app.setMusic(this.data.searchResult[musicIndex]);
          app.setPlaying(true);
          app.setNewAdd(true);
            
        }
        wx.switchTab({
            "url":"../list/index"
        });
    }
});