// javascript:(function(){var s = document.createElement("script"); s.src="https://github.com/W66666/VideoSync/new/master/sync_new.js"; document.head.appendChild(s);})()
function dragFunc(id) {
  var Drag = document.getElementById(id);
  Drag.onmousedown = function(event) {
    var ev = event || window.event;
    event.stopPropagation();
    var disX = ev.clientX - Drag.offsetLeft;
    var disY = ev.clientY - Drag.offsetTop;
    document.onmousemove = function(event) {
      var ev = event || window.event;
      Drag.style.left = ev.clientX - disX + 'px';
      Drag.style.top = ev.clientY - disY + 'px';
      Drag.style.cursor = 'move';
    };
  };
  Drag.onmouseup = function() {
    document.onmousemove = null;
    this.style.cursor = 'default';
  };
}

function loadScript(url, callback) {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  if (typeof callback != 'undefined') {
    // console.log(callback)
    if (script.readyState) {
      script.onreadystatechange = () => {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      script.onload = () => {
        callback();
      };
    }
  }
  script.src = url;
  document.body.appendChild(script);
}

class VideoPlayer {
  constructor() {
    if (document.getElementById('ControlDiv') != null) {
      alert('程序已在运行中！');
      return;
    }
    this.Run = false;
    this.xmlhttp = new XMLHttpRequest();
    this.aimCode = ''; //目标机器的连接Code
    this.MarginTime = 5.0; //间隔超过MarginTime秒时进行更新。
    this.UploadTime = 500; //每隔UploadTime毫秒进行上传。
    this.DisControl = false; //为true时请求断开连接
    this.RTT = 0.0; //往返时延
    this.VideoChangeTime = 0.1; //更改视频播放进度所需的时间
    this.Catching = false; //是否正在获取视频
    this.SeekingBeginTime = null; //视频进行跳转的开始时间
    this.Seeking = false; //视频是否正在进行跳转

    let s = document.createElement('style');
    s.type = 'text/css';
    s.innerHTML =
      '.btn-vsync.disabled, .btn-vsync[disabled], fieldset-vsync[disabled] .btn-vsync {cursor: not-allowed;filter: alpha(opacity=65);-webkit-box-shadow: none;box-shadow: none;opacity: .65;}.container-vsync {padding-right: 15px;padding-left: 15px;font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;font-size: 14px;line-height: 1.42857143;color: #333;background-color: #fff;-webkit-tap-highlight-color: rgba(0, 0, 0, 0);} .row-vsync {margin-right: -15px;margin-left: -15px} .col-sm-12-vsync,.col-md-2-vsync, .col-sm-3-vsync, .col-sm-4-vsync, .col-sm-6-vsync, .col-sm-8-vsync, .col-sm-10-vsync {position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;float: left;box-sizing: border-box;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;} .col-sm-12-vsync {width: 100%} .col-sm-10-vsync {width:83.33333333%} .col-sm-8-vsync {width: 66.66666667%} .col-sm-6-vsync {width: 50%} .col-sm-4-vsync {width: 33.33333333%} .col-sm-3-vsync {width: 25%}.col-md-2-vsync {width:16.66666667%} .center-block-vsync {display: block;margin-right: auto;margin-left: auto;} .text-center-vsync {text-align: center;} .form-horizontal-vsync {display: block;margin-top: 0em;} .form-horizontal-vsync .form-group-vsync {margin-right: -15px;margin-left: -15px;} .form-group-vsync {margin-bottom: 15px;box-sizing: border-box;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;} .row-vsync:after, .form-group-vsync:after {display: table;content: " ";box-sizing: border-box;clear: both;} .form-horizontal-vsync .control-label-vsync {display: inline-block;padding-top: 7px;margin-bottom: 0;text-align: right;max-width: 100%;font-weight: 700;box-sizing: border-box;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;} .form-control-vsync[type=file]:focus, .form-control-vsync[type=checkbox]:focus, .form-control-vsync[type=radio]:focus {outline: 5px auto -webkit-focus-ring-color;outline-offset: -2px} .form-control-vsync {display: block;width: 100%;height: 34px;padding: 6px 12px;font-size: 14px;line-height: 1.42857143;color: #555;background-color: #fff;background-image: none;border: 1px solid #ccc;border-radius: 4px;-webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);-webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;-o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;box-sizing: border-box;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;-webkit-writing-mode: horizontal-tb !important;text-rendering: auto;letter-spacing: normal;word-spacing: normal;text-transform: none;text-indent: 0px;text-shadow: none;text-align: start;-webkit-appearance: textfield;-webkit-rtl-ordering: logical;cursor: text;margin: 0;font: inherit;} .form-control-vsync:focus {border-color: #80bdff;outline: 0;box-shadow: 0 0 0 .15rem rgba(0, 123, 255, .25)} .form-control-vsync::-moz-placeholder {color: #999;opacity: 1} .form-control-vsync:-ms-input-placeholder {color: #999} .form-control-vsync::-webkit-input-placeholder {color: #999} .form-control-vsync::-ms-expand {background-color: transparent;border: 0} .form-control-vsync[disabled], .form-control-vsync[readonly], fieldset[disabled] .form-control-vsync {background-color: #eee;opacity: 1} .form-control-vsync[disabled], fieldset[disabled] .form-control-vsync {cursor: not-allowed} .btn-vsync {display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: 400;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;box-sizing: border-box;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;} .btn-danger-vsync {color: #fff;background-color: #d9534f;border-color: #d43f3a} .btn-danger-vsync.focus, .btn-danger-vsync:focus {color: #fff;background-color: #c9302c;border-color: #761c19} .btn-danger-vsync:hover {color: #fff;background-color: #c9302c;border-color: #ac2925} .btn-danger-vsync.active, .btn-danger-vsync:active, .open>.dropdown-toggle.btn-danger-vsync {color: #fff;background-color: #c9302c;border-color: #ac2925} .btn-danger-vsync.active.focus, .btn-danger-vsync.active:focus, .btn-danger-vsync.active:hover, .btn-danger-vsync:active.focus, .btn-danger-vsync:active:focus, .btn-danger-vsync:active:hover, .open>.dropdown-toggle.btn-danger-vsync.focus, .open>.dropdown-toggle.btn-danger-vsync:focus, .open>.dropdown-toggle.btn-danger-vsync:hover {color: #fff;background-color: #ac2925;border-color: #761c19} .btn-danger-vsync.active, .btn-danger-vsync:active, .open>.dropdown-toggle.btn-danger-vsync {background-image: none} .btn-danger-vsync.disabled.focus, .btn-danger-vsync.disabled:focus, .btn-danger-vsync.disabled:hover, .btn-danger-vsync[disabled].focus, .btn-danger-vsync[disabled]:focus, .btn-danger-vsync[disabled]:hover, fieldset[disabled] .btn-danger-vsync.focus, fieldset[disabled] .btn-danger-vsync:focus, fieldset[disabled] .btn-danger-vsync:hover {background-color: #d9534f;border-color: #d43f3a} .btn-danger-vsync .badge {color: #d9534f;background-color: #fff} .btn-primary-vsync {color: #fff;background-color: #337ab7;border-color: #2e6da4} .btn-primary-vsync.focus, .btn-primary-vsync:focus {color: #fff;background-color: #286090;border-color: #122b40} .btn-primary-vsync:hover {color: #fff;background-color: #286090;border-color: #204d74} .btn-primary-vsync.active, .btn-primary-vsync:active, .open>.dropdown-toggle.btn-primary-vsync {color: #fff;background-color: #286090;border-color: #204d74} .btn-primary-vsync.active.focus, .btn-primary-vsync.active:focus, .btn-primary-vsync.active:hover, .btn-primary-vsync:active.focus, .btn-primary-vsync:active:focus, .btn-primary-vsync:active:hover, .open>.dropdown-toggle.btn-primary-vsync.focus, .open>.dropdown-toggle.btn-primary-vsync:focus, .open>.dropdown-toggle.btn-primary-vsync:hover {color: #fff;background-color: #204d74;border-color: #122b40} .btn-primary-vsync.active, .btn-primary-vsync:active, .open>.dropdown-toggle.btn-primary-vsync {background-image: none} .btn-primary-vsync.disabled.focus, .btn-primary-vsync.disabled:focus, .btn-primary-vsync.disabled:hover, .btn-primary-vsync[disabled].focus, .btn-primary-vsync[disabled]:focus, .btn-primary-vsync[disabled]:hover, fieldset[disabled] .btn-primary-vsync.focus, fieldset[disabled] .btn-primary-vsync:focus, fieldset[disabled] .btn-primary-vsync:hover {background-color: #337ab7;border-color: #2e6da4} .btn-primary-vsync .badge {color: #337ab7;background-color: #fff}';
    document.head.appendChild(s);

    this.Interaction = document.createElement('div');
    this.Interaction.setAttribute('id', 'ControlDiv');
    this.Interaction.style.paddingRight = '15px';
    this.Interaction.style.paddingLeft = '15px';
    this.Interaction.style.fontFamily =
      '"Helvetica Neue", Helvetica, Arial, sans-serif';
    this.Interaction.style.fontSize = '14px';
    this.Interaction.style.lineHeight = 1.42857143;
    this.Interaction.style.color = '#333';
    this.Interaction.style.backgroundColor = '#fff';
    this.Interaction.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
    this.Interaction.style.position = 'fixed';
    this.Interaction.style.right = '10px';
    this.Interaction.style.top = '150px';
    this.Interaction.style.zIndex = 10000;
    this.Interaction.style.width = '320px';
    this.Interaction.style.border = '2px solid #bdc3c7';
    this.Interaction.style.borderRadius = '6px';
    this.Interaction.style.padding = '0px 6px 20px';
    this.Interaction.style.boxShadow = '3px 3px 10px 1px #888888';
    this.Interaction.style.background = 'white';
    this.Interaction.style.userSelect = 'none';
    this.Interaction.style.msUserSelect = 'none';
    this.Interaction.style.webkitUserSelect = 'none';
    this.Interaction.style.boxSizing = 'border-box';
    this.Interaction.style.webkitBoxSizing = 'border-box';
    this.Interaction.style.msBoxSizing = 'border-box';
    this.Interaction.innerHTML =
      '\
        <div class="row-vsync">\
            <div class="col-sm-10-vsync" style="height:20px" id="ControlBar"></div>\
            <div class="col-sm-2-vsync" style="height:20px;cursor:pointer" id="HideBtn">[hide]</div>\
        </div>\
        <div class="row-vsync">\
            <div class="col-sm-8-vsync" style="padding-right:5px">\
                <span id="videoGotten" class="center-block-vsync text-center-vsync"\
                    style="border: 4px solid #e74c3c;border-radius: 4px;padding:3px 0px;">未检测到视频</span>\
            </div>\
            <div class="col-sm-4-vsync" style="padding:0px 5px">\
                <div class="btn-vsync btn-danger-vsync" id="handCatchBtd">手动获取</div>\
            </div>\
        </div>\
        <div class="row-vsync" style="margin-top: 10px;">\
            <div class="col-sm-12-vsync">\
                <form class="form-horizontal-vsync">\
                    <div class="form-group-vsync">\
                        <label for="SelfCode" class="col-sm-3-vsync control-label-vsync">识别码</label>\
                        <div class="col-sm-6-vsync" style="padding:0px 5px">\
                            <input readonly class="form-control-vsync" style="max-width: 157px;max-height: 34px;"\
                                id="SelfCode" value="启动以获取识别码">\
                        </div>\
                        <div class="col-sm-3-vsync" style="padding:0px 5px">\
                            <div class="btn-vsync btn-primary-vsync" id="StartupBtn">启动</div>\
                        </div>\
                    </div>\
                    <div class="form-group-vsync">\
                        <label for="aimCodeInput" class="col-sm-3-vsync control-label-vsync">要控制</label>\
                        <div class="col-sm-6-vsync" style="padding:0px 5px">\
                            <input class="form-control-vsync" style="max-width: 157px; max-height: 34px;" id="aimCodeInput"\
                                placeholder="要控制设备识别码" maxlength="6">\
                        </div>\
                        <div class="col-sm-3-vsync" style="padding:0px 5px">\
                            <div class="btn-vsync btn-primary-vsync" id="ControlBtn">控制</div>\
                        </div>\
                    </div>\
                    <div class="form-group-vsync">\
                        <label for="FromCode" class="col-sm-3-vsync control-label-vsync">受控制</label>\
                        <div class="col-sm-6-vsync" style="padding:0px 5px">\
                            <input readonly class="form-control-vsync" style="max-width: 157px;max-height: 34px;"\
                                id="FromCode" value="未受控">\
                        </div>\
                        <div class="col-sm-3-vsync" style="padding:0px 5px">\
                            <div class="btn-vsync btn-primary-vsync" id="fromcodeControl" disabled="disabled">断开</div>\
                        </div>\
                    </div>\
                    <div class="form-group-vsync">\
                        <label for="marginInput" class="col-sm-3-vsync control-label-vsync">时间差</label>\
                        <div class="col-sm-6-vsync" style="padding:0px 5px">\
                            <input readonly class="form-control-vsync" style="max-width: 157px;max-height: 34px;" id="marginInput"\
                                value="5.0" type="text">\
                        </div>\
                        <div class="col-sm-3-vsync" style="padding:0px 5px">\
                            <div class="btn-vsync btn-primary-vsync" id="marginControl" disabled="disabled">确认</div>\
                        </div>\
                    </div>\
                </form>\
            </div>\
        </div>\
        <div class="row-vsync" style="margin-top: 2px;">\
            <div class="col-sm-6-vsync" style="padding-left: 25px; padding-right: 5px;">\
                主控端延迟 <span id="ErrorTime">-------</span>ms\
            </div>\
            <div class="col-sm-6-vsync" style="padding-left: 5px;">\
                服务器延迟 <span id="RTTime">-------</span>ms\
            </div>\
        </div>\
        ';
    document.body.appendChild(this.Interaction);
    document.getElementById('handCatchBtd').onclick = () => {
      this.HandCatchVideo();
    };
    document.getElementById('StartupBtn').onclick = () => {
      this.ChangeStatus();
    };
    document.getElementById('ControlBtn').onclick = () => {
      this.aimCode = document.getElementById('aimCodeInput').value;
    };
    document.getElementById('fromcodeControl').onclick = () => {
      this.DisControl = true;
    };
    document.getElementById('marginControl').onclick = () => {
      this.clearNoNum();
      let Margin = parseFloat(document.getElementById('marginInput').value);
      if (isNaN(Margin)) {
        document.getElementById('marginInput').value = this.MarginTime;
      } else {
        this.MarginTime = Margin;
      }
    };
    document.getElementById('SelfCode').onclick = () => {
      if (document.getElementById('SelfCode').value.length != 6) {
        return;
      }
      let obj = document.getElementById('SelfCode');
      obj.select();
      document.execCommand('Copy');
      alert(obj.value + ' 已复制到剪切板!');
    };
    document.getElementById('HideBtn').onclick = () => {
      this.Interaction.style.display = 'none';
      this.Interaction.style.visibility = 'hidden';
    };

    let Drag = document.getElementById('ControlBar');
    Drag.onmousedown = event => {
      let ev = event || window.event;
      event.stopPropagation();
      let disX = ev.clientX - this.Interaction.offsetLeft;
      let disY = ev.clientY - this.Interaction.offsetTop;
      document.onmousemove = event => {
        let ev = event || window.event;
        this.Interaction.style.left = ev.clientX - disX + 'px';
        this.Interaction.style.top = ev.clientY - disY + 'px';
        Drag.style.cursor = 'move';
      };
    };
    Drag.onmouseup = () => {
      document.onmousemove = null;
      Drag.style.cursor = 'default';
    };
  }
  get currentTime() {
    return this.Player.currentTime;
  }
  set currentTime(Time) {
    if (this.Player.currentTime != Time) {
      this.Player.currentTime = Time;
    }
  }
  set SetPoster(ImgUrl) {
    this.Player.poster = ImgUrl;
  }
  clearNoNum() {
    let obj = document.getElementById('marginInput');
    obj.value = obj.value
      .replace(/[^\d.]/g, '')
      .replace(/\.{2,}/g, '')
      .replace(/^\./g, '')
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.');
    if (obj.value == '') {
      obj.value = '0';
    }
  }
  HandCatchVideo() {
    alert('当前功能未启用...');
    // if (this.Catching) {
    //     alert("已有一个视频获取进程正在运行，请等待其结束。")
    // }
    // this.Catching = true;

    // let VideoList = document.getElementsByClassName('CatchedVideo');
    // for (let ind = 0; ind < VideoList.length; ++ind) {
    //     VideoList[ind].classList.remove("CatchedVideo");
    //     VideoList[ind].removeEventListener("canplay");
    //     VideoList[ind].removeEventListener("seeking");
    // }

    // let HavePlayer = false;
    // let Videos = document.getElementsByTagName("video");
    // if (Videos.length == 1) {
    //     alert("当前界面仅获取到一个视频。")
    //     this.Player = Videos[0];
    //     HavePlayer = true;
    // } else if (Videos.length > 1) {
    //     for (let ind = 0; ind < Videos.length; ++ind) {
    //         let compStyle = document.defaultView.getComputedStyle(Videos[ind], false)["display"];
    //         console.log(compStyle, Videos[ind])
    //         if (compStyle != "none" && Videos[ind].src != '') {

    //             Videos[ind].style.visibility = "none";
    //             console.log(Videos[ind].style.display);
    //             let res = confirm("您想获取的视频消失了吗？ "+String(ind+1)+"/"+String(Videos.length));

    //             if (res) {
    //                 this.Player = Videos[ind];
    //                 HavePlayer = true;
    //                 break;
    //             }
    //             console.log(res)
    //             Videos[ind].style.display = compStyle;
    //         }
    //     }
    // } else {
    //     HavePlayer = false;
    //     alert("当前界面未检测到视频存在。")
    // }

    // if (HavePlayer) {
    //     document.getElementById("videoGotten").innerText = "视频已获取";
    //     document.getElementById("videoGotten").style.border = "4px solid #3c763d";
    // } else {
    //     document.getElementById("videoGotten").innerText = "视频未获取";
    //     document.getElementById("videoGotten").style.border = "4px solid #e74c3c";
    // }

    // if (HavePlayer) {//为视频添加Event检测VideoChangeTime
    //     this.Player.classList.add("CatchedVideo");

    //     this.Player.addEventListener("seeking", () => {
    //         this.SeekingBeginTime = new Date();
    //         this.Seeking = true;
    //     })
    //     this.Player.addEventListener("canplay", () => {
    //         if (this.Seeking) {
    //             if (this.VideoChangeTime == 0) {
    //                 this.VideoChangeTime = (new Date().getTime() - this.SeekingBeginTime.getTime()) / 1000;
    //             } else {
    //                 this.VideoChangeTime = (this.VideoChangeTime * 8 + (new Date().getTime() - this.SeekingBeginTime.getTime()) * 2 / 1000) / 10;
    //             }
    //             this.Seeking = false;
    //         }
    //     })
    // }
    // this.Catching = false;
  }
  CatchVideo() {
    if (this.CheckVideo()) {
      return true;
    }

    if (this.Catching) {
      alert('已有一个视频获取进程正在运行，请等待其结束。');
    }
    this.Catching = true;

    let HavePlayer = false;
    let Videos = document.getElementsByTagName('video');
    if (Videos.length == 1) {
      this.Player = Videos[0];
      HavePlayer = true;
    } else if (Videos.length > 1) {
      let LastVideo = null;
      for (const tmpvideo of Videos) {
        let compStyle = document.defaultView.getComputedStyle(tmpvideo, false)[
          'display'
        ];
        if (compStyle != 'none' && tmpvideo.src != '') {
          LastVideo = tmpvideo;
          break;
        }
      }
      if (LastVideo != null) {
        this.Player = LastVideo;
        HavePlayer = true;
      } else {
        HavePlayer = false;
      }
    } else {
      let tmpVideoList = [];
      for (const x of document.getElementsByTagName('iframe')) {
        for (const y of x.contentDocument.getElementsByTagName('video')) {
          tmpVideoList.push(y);
        }
      }
      let LastVideo = null;
      for (const tmpvideo of tmpVideoList) {
        let compStyle = document.defaultView.getComputedStyle(tmpvideo, false)[
          'display'
        ];
        if (compStyle != 'none' && tmpvideo.src != '') {
          LastVideo = tmpvideo;
          break;
        }
      }
      if (LastVideo != null) {
        this.Player = LastVideo;
        HavePlayer = true;
      } else {
        HavePlayer = false;
      }
    }
    if (HavePlayer) {
      document.getElementById('videoGotten').innerText = '视频已获取';
      document.getElementById('videoGotten').style.border = '4px solid #3c763d';
    } else {
      document.getElementById('videoGotten').innerText = '视频未获取';
      document.getElementById('videoGotten').style.border = '4px solid #e74c3c';
    }

    if (HavePlayer) {
      //为视频添加Event检测VideoChangeTime
      let VideoList = document.getElementsByClassName('CatchedVideo');
      for (let ind = 0; ind < VideoList.length; ++ind) {
        VideoList[ind].classList.remove('CatchedVideo');
        VideoList[ind].removeEventListener('canplay');
        VideoList[ind].removeEventListener('seeking');
      }
      this.Player.classList.add('CatchedVideo');

      this.Player.addEventListener('seeking', () => {
        this.SeekingBeginTime = new Date();
        this.Seeking = true;
      });
      this.Player.addEventListener('canplay', () => {
        if (this.Seeking) {
          if (this.VideoChangeTime == 0) {
            this.VideoChangeTime =
              (new Date().getTime() - this.SeekingBeginTime.getTime()) / 1000;
          } else {
            this.VideoChangeTime =
              (this.VideoChangeTime * 8 +
                ((new Date().getTime() - this.SeekingBeginTime.getTime()) * 2) /
                  1000) /
              10;
          }
          this.Seeking = false;
        }
      });
      document.addEventListener('fullscreenchange', e => {
        if (!this.CheckVideo()) {
          return;
        }
        if (document.fullscreenElement) {
          this.Interaction.style.display = 'none';
          this.Interaction.style.visibility = 'hidden';
        } else {
          this.Interaction.style.display = '';
          this.Interaction.style.visibility = '';
        }
      });

      this.Catching = false;
      return true;
    } else {
      this.Catching = false;
      return false;
    }
  }
  CheckVideo() {
    //检测当前是否cathch到视频
    let VideoList = document.getElementsByClassName('CatchedVideo');
    if (VideoList.length == 1) {
      return true;
    } else {
      return false;
    }
  }
  ChangeStatus() {
    if (this.Run) {
      this.Run = false;
      if (typeof this.Interval != 'undefined') {
        clearInterval(this.Interval);
      }
      document.getElementById('ErrorTime').innerText = '-------';
      document.getElementById('RTTime').innerText = '-------';
      document.getElementById('StartupBtn').innerText = '启动';
      document.getElementById('SelfCode').value = '请启动后获取';
      document.getElementById('SelfCode').style.color = '#777';
    } else {
      this.Run = true;
      document.getElementById('StartupBtn').innerText = '停止';
      document.getElementById('SelfCode').value = '正在连接中..';
      document.getElementById('SelfCode').style.color = '#31708f';

      var FirstTime = true;

      this.Interval = setInterval(() => {
        if (!this.CatchVideo()) {
          alert('未找到视频，请确认视频存在或使用手动获取。');
          this.ChangeStatus();
          return;
        }

        var Url = 'https://ailidj.cn:9710/';
        this.xmlhttp.open('POST', Url, true);
        this.xmlhttp.setRequestHeader(
          'content-type',
          'application/x-www-form-urlencoded'
        );
        this.xmlhttp.onreadystatechange = () => {
          if (this.xmlhttp.readyState == 4) {
            if (this.xmlhttp.status == 200) {
              var endTime = new Date();
              if (this.RTT == 0) {
                this.RTT = (endTime.getTime() - beginTime.getTime()) / 2000;
              } else {
                this.RTT =
                  (this.RTT + (endTime.getTime() - beginTime.getTime()) / 2) /
                  2000;
              }
              if (this.RTT * 3000 > this.UploadTime) {
                //如果延迟很高，则延长Upload的间隔时间
                // console.log("Change UploadTime")
                this.UploadTime = this.RTT * 8000;
                this.ChangeStatus();
                this.ChangeStatus();
              }
              document.getElementById('RTTime').innerText = String(
                Math.round(this.RTT * 1000)
              );
              // console.log(this.xmlhttp.responseText);
              var Res = JSON.parse(this.xmlhttp.responseText);
              // console.log(Res);
              if (Res['code']) {
                this.Code = Res['code'];
                document.getElementById('SelfCode').value = this.Code;
                document.getElementById('SelfCode').style.color = '#3c763d';
              } else if (FirstTime) {
                document.getElementById('SelfCode').value = this.Code;
                document.getElementById('SelfCode').style.color = '#3c763d';
                FirstTime = false;
              }
              if (typeof Res['paused'] != 'undefined') {
                // console.log(Res["paused"])
                if (Res['paused']) {
                  this.pause();
                  if (typeof Res['newtime'] != 'undefined') {
                    this.currentTime = this.currentTime + Res['newtime'];
                  }
                } else {
                  // console.log("Play")
                  this.play();
                }
              }
              // console.log(Res["newtime"], this.currentTime, this.VideoChangeTime, this.MarginTime);
              if (typeof Res['newtime'] != 'undefined') {
                document.getElementById('ErrorTime').innerText = String(
                  Math.round(Res['newtime'] * 1000)
                );
                if (Math.abs(Res['newtime']) > this.MarginTime) {
                  this.currentTime =
                    this.currentTime + Res['newtime'] + this.VideoChangeTime;
                  // this.VideoChangeTime = (this.VideoChangeTime + Res["newtime"]) / 2;
                  // console.log("change", this.currentTime)
                }
              } else {
                document.getElementById('ErrorTime').innerText = '-------';
              }
              if (typeof Res['fromcode'] != 'undefined') {
                document
                  .getElementById('marginInput')
                  .removeAttribute('readonly');
                document
                  .getElementById('marginControl')
                  .removeAttribute('disabled');
                document
                  .getElementById('fromcodeControl')
                  .removeAttribute('disabled');
                document.getElementById('FromCode').value = Res['fromcode'];
              } else {
                document
                  .getElementById('marginInput')
                  .setAttribute('readonly', '');
                document
                  .getElementById('marginControl')
                  .setAttribute('disabled', 'disabled');
                document
                  .getElementById('fromcodeControl')
                  .setAttribute('disabled', 'disabled');
                document.getElementById('FromCode').value = '未受控';
              }
              for (let ind = 0; ind < Res['Mess'].length; ++ind) {
                alert(Res['Mess'][ind]);
              }
            }
          }
        };

        var Mess = {};
        Mess['paused'] = this.Player.paused;
        Mess['aimcode'] = this.aimCode;
        Mess['discontrol'] = this.DisControl;
        this.DisControl = false;
        this.aimCode = '';
        if (this.Code) {
          Mess['code'] = this.Code;
          document.getElementById('SelfCode').style.color = '#3c763d';
        }
        Mess['videotime'] = this.currentTime;
        Mess['RTT'] = this.RTT;
        var beginTime = new Date();
        this.xmlhttp.send(JSON.stringify(Mess));
      }, this.UploadTime);
    }
  }

  SyncAimTime(aimCode) {
    this.pause();
    this.aimCode = aimCode;
  }
  url() {
    return window.location.href;
  }
  pause() {
    this.Player.pause();
  }
  play() {
    this.Player.play();
  }
  sync() {
    this.Player.oncanplaythrough = event => {
      // console.log(event);
    };
  }
}

new VideoPlayer();
// var player = localStorage.setItem('player', JSON.stringify(new VideoPlayer()))
