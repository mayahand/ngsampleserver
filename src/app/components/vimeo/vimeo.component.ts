import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import * as $ from 'jquery';
import Player from '@vimeo/player';

@Component({
  selector: 'app-vimeo',
  templateUrl: './vimeo.component.html',
  styleUrls: ['./vimeo.component.css']
})
export class VimeoComponent implements OnInit, AfterViewInit {

  videoContainer: VideoContainer;

  @Input() group: string;
  @Input() width: number;
  @Input() videos: Video[] = [];
  @Input() autoPlay = true;

  constructor() {}

  ngOnInit() {
    this.videoContainer = new VideoContainer(
        this.group,
        this.videos,
        this.autoPlay);
  }

  ngAfterViewInit(): void {
    this.videoContainer.init();
  }
}

class VideoContainer {
  groupId: string;
  videos: Video[];
  currentVideo: Video;
  mainVideo: Video;
  volume = false;
  totalPlayTime = 0;
  currentPlayTime = 0;
  playStatus = PlayStatus.STOPPED;
  isInit: boolean;
  autoPlay: boolean;
  isFullScreen: boolean;

  constructor(groupId: string, videos: Video[], autoPlay: boolean) {
    this.isInit = false;
    this.isFullScreen = false;
    this.autoPlay = autoPlay;
    this.groupId = groupId;
    this.videos = [];
    if (videos != null) {
      this.videos = videos;
      let index = 0;
      this.videos.forEach(video => {
        video.index = index++;
      });

      this.totalPlayTime = this.videos.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.getDuration();
      }, 0);

      this.mainVideo = videos.find(video => video.isMain);
    }

    this.currentVideo = this.videos[0];
  }

  init() {
    const groupDiv = $('#' + this.groupId);

    if (this.videos.length > 0) {
      this.videos.reduce((previousValue, currentValue) => {
        currentValue.parent = this;
        if (previousValue === currentValue) {
          currentValue.init(groupDiv, true);
          return currentValue;
        }
        currentValue.init(groupDiv, false);
        previousValue.nextVideo = currentValue;
        return currentValue;
      }, this.videos[0]);
    }

    console.log('total Time: ' + this.totalPlayTime + 's');
  }

  calcCurrentVideo(timeCode) {
    return this.videos.reduce((previousValue, currentValue) => {
      if (previousValue.video != null) {
        return previousValue;
      }

      const t = previousValue.startTime - currentValue.getDuration();
      if (t < 0) {
        previousValue.video = currentValue;
        return previousValue;
      }

      previousValue.startTime = t;

      return previousValue;
    }, new CurrentVideo(timeCode, null));
  }

  setCurrentVideo(video: Video) {
    this.videos.forEach(v => v.playerDiv.css('display', 'none'));
    this.currentVideo = video;
    if (this.currentVideo != null) {
      this.currentVideo.playerDiv.css('display', 'block');
    }
  }

  setCurrentPlayTime(time: number) {
    this.currentPlayTime = time;
  }

  onReady(video: Video) {
    console.log(video.id + ': onReady');
  }

  onLoaded(video: Video) {
    console.log(video.id + ': Loaded');
  }

  onPlay(video: Video) {
    if (this.playStatus !== PlayStatus.PLAYING || this.currentVideo !== video) {
      return;
    }
    console.log(video.id + ': Play');
  }

  onEndReached(video: Video, data) {
    if (video === this.currentVideo) {
      console.log(data);
      this.next();
    }
  }

  onTimeupdate(video: Video, data) {
    if (this.playStatus !== PlayStatus.PLAYING || this.currentVideo !== video) {
      video.player.pause();
      return;
    }

    let ignore = false;
    this.setCurrentPlayTime(this.videos.reduce((previousValue, currentValue) => {
      if (video === currentValue || ignore) {
        ignore = true;
        return previousValue;
      }
      return previousValue + currentValue.getDuration();
    }, data.seconds - video.startTimeCode));

    console.log('Current Time ' + this.currentPlayTime + 's');
  }

  play() {
    if (this.playStatus === PlayStatus.STOPPED) {
      this.currentPlayTime = 0;
      this.setCurrentVideo(this.videos[0]);
      this.currentVideo.stop();
    }

    if (this.currentVideo != null) {
      this.playStatus = PlayStatus.PLAYING;
      this.currentVideo.play((data) => {});
    }
  }

  stop() {
    this.videos.forEach(video => video.stop());
    this.currentPlayTime = 0;
    this.setCurrentVideo(null);
    if (this.videos.length > 0) {
      if (this.mainVideo != null) {
        this.setCurrentVideo(this.mainVideo);
      } else {
        this.setCurrentVideo(this.videos[0]);
      }
      this.currentVideo.stop();
      this.currentVideo.gotoStillCut();
    }
    this.playStatus = PlayStatus.STOPPED;
  }

  pause() {
    if (this.currentVideo != null) {
      this.currentVideo.pause();
      this.playStatus = PlayStatus.PAUSED;
    }
  }

  next() {
    if (this.currentVideo != null) {
      this.currentVideo.stop();
      if (this.currentVideo.nextVideo == null) {
        this.stop();
        // this.play();
        return;
      }
      this.setCurrentVideo(this.currentVideo.nextVideo);
      this.currentVideo.stop();
      this.currentVideo.play((data) => {});
    }
  }

  setVolume(volume: boolean) {
    this.volume = volume;
    this.videos.forEach(video => video.setVolume(volume));
  }

  requestFullscreen() {
    const groupDiv = $('#' + this.groupId);
    groupDiv[0].requestFullscreen();
    this.isFullScreen = true;
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    this.isFullScreen = false;
  }

  seek(timeCode) {
    const playStatus = this.playStatus;
    this.pause();
    const gotoVideo: CurrentVideo = this.calcCurrentVideo(timeCode);
    this.setCurrentVideo(gotoVideo.video);
    const subTime = gotoVideo.video.seek(gotoVideo.startTime);
    this.setCurrentPlayTime(timeCode);
    console.log('Seeked Time' + timeCode + 's');
    console.log('Seeked Video - ID(' + gotoVideo.video.id + ') SubTime(' + subTime + 's)');
    if (playStatus === PlayStatus.PLAYING) {
      this.play();
    }
  }

  onProgressbarClick(e) {
    const scrubTime = (e.offsetX / e.target.offsetWidth) * this.totalPlayTime;
    this.seek(scrubTime);
  }

  onInit() {
    this.isInit = !this.videos.some(video => !video.isInit);

    if (this.isInit) {
      if (this.mainVideo != null) {
        this.setCurrentVideo(this.mainVideo);
      } else {
        this.setCurrentVideo(this.videos[0]);
      }

      this.currentVideo.gotoStillCut();
    }

    if (this.isInit && this.autoPlay) {
      this.play();
    }
  }

  calcVideoWidth(height): number {
    if (!this.isInit) {
      return 0;
    }
    return this.currentVideo.getVideoWidth() * height / this.currentVideo.getVideoHeight();
  }

  calcVideoHeight(width): number {
    if (!this.isInit) {
      return 0;
    }

    return this.currentVideo.getVideoHeight() * width / this.currentVideo.getVideoWidth();
  }

  getWidth() {
    return $('#' + this.groupId)[0].scrollWidth;
  }
}

export class Video {
  index: number;
  id: number;
  startTimeCode: number;
  endTimeCode: number;
  player: Player = null;
  playerDiv: any = null;
  nextVideo: Video = null;
  parent: VideoContainer = null;
  currentTimeCode: number;
  callbackMessage: string;
  isMain: boolean;
  isInit: boolean;
  stillCutTimeStamp: number;
  videoWidth: number;
  videoHeight: number;

  constructor(id: number, startTimeCode: number, endTimeCode: number, isMain: boolean, stillCutTimeStamp = 0) {
    this.isInit = false;
    this.id = id;
    this.startTimeCode = startTimeCode;
    this.endTimeCode = endTimeCode;
    this.currentTimeCode = 0;
    this.isMain = isMain;
    this.stillCutTimeStamp = stillCutTimeStamp;
  }

  init(groupDiv: any, mainPlayer: boolean) {
    const _this = this;
    if (!this.player) {
      const playerId = this.parent.groupId + '_' + 'player_' + this.id;
      let madeId = playerId;
      let idx = 1;
      this.playerDiv = $('#' + madeId);
      while (this.playerDiv != null && this.playerDiv.length > 0) {
        madeId = playerId + '_' + idx++;
        this.playerDiv = $('#' + madeId);
      }

      this.playerDiv = $('<div style="display: none;width: 100%;height: 100%;" id="' + madeId + '"></div>');
      groupDiv.append(this.playerDiv);
      this.player = new Player(madeId, {
        id: this.id,
        title: false,
        byline: false,
        portrait: false,
        controls: false,
        keyboard: false,
        autoplay: false,
        autopause: false
      });

      this.player.setVolume(0);
      this.player.setCurrentTime(this.startTimeCode);

      this.player.on('timeupdate', function(data) {
        _this.currentTimeCode = data.seconds;
        _this.parent.onTimeupdate(_this, data);
        if (_this.parent.playStatus === PlayStatus.PLAYING && data.seconds > _this.endTimeCode) {
          _this.parent.onEndReached(_this, data);
        }
      });

      this.player.on('play', function() {
        _this.parent.onPlay(_this);
      });

      this.player.on('loaded', function() {
        _this.parent.onLoaded(_this);
        this.play().then(function() {
          _this.player.pause().then(function() {
            _this.player.setCurrentTime(_this.startTimeCode);
            _this.isInit = true;
            const iframe = _this.playerDiv.find('iframe');
            iframe.attr('width', '100%');
            iframe.attr('height', '100%');
            _this.player.getVideoWidth().then((w) => _this.videoWidth = w);
            _this.player.getVideoHeight().then((h) => _this.videoHeight = h);
            _this.parent.onInit();
          });
        });
      });

      if (mainPlayer) {
        this.player.ready().then(function() {
          _this.parent.onReady(_this);
        });
      }
    }
  }

  stop() {
    this.player.pause();
    this.player.setCurrentTime(this.startTimeCode);
  }

  play(callBack: (data: string) => void) {
    const _this = this;
    this.player.play()
        .then(callBack)
        .catch(function(error) {
          _this.callbackMessage = error.name;
        });
  }

  pause() {
    this.player.pause();
  }

  seek(timeCode) {
    const subTime =  this.startTimeCode + timeCode;
    this.currentTimeCode = subTime;
    this.player.setCurrentTime(subTime);
    return subTime;
  }

  gotoStillCut() {
    this.player.setCurrentTime(this.stillCutTimeStamp);
  }

  setVolume(volume: boolean) {
    if (!this.player) {
      return;
    }
    this.player.setVolume(volume ? 1 : 0);
  }

  requestFullscreen() {
    if (!this.player) {
      return;
    }
    this.player.requestFullscreen();
  }

  getDuration() {
    return this.endTimeCode - this.startTimeCode;
  }

  getVideoWidth() {
    return this.videoWidth;
  }

  getVideoHeight() {
    return this.videoHeight;
  }
}

class CurrentVideo {
  startTime: number;
  video: Video;

  constructor(startTime: number, video: Video) {
    this.startTime = startTime;
    this.video = video;
  }
}

export enum PlayStatus {
  STOPPED,
  PLAYING,
  PAUSED
}
