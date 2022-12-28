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
  @Input() thumbnail: Thumbnail = null;
  @Input() videos: Video[] = [];
  @Input() autoPlay = true;
  @Input() loadingView = '/assets/img/Double%20Ring-2.6s-201px.svg';

  constructor() {}

  ngOnInit() {
    this.videoContainer = new VideoContainer(
        this.group,
        this.width,
        this.thumbnail,
        this.videos,
        this.autoPlay);
  }

  ngAfterViewInit(): void {
    this.videoContainer.init();
  }
}

class VideoContainer {
  groupId: string;
  width: number;
  height: string;
  videos: Video[];
  currentVideo: Video;
  thumbnail: Thumbnail;
  volume = false;
  totalPlayTime = 0;
  currentPlayTime = 0;
  playStatus = PlayStatus.STOPPED;
  isInit: boolean;
  autoPlay: boolean;

  constructor(groupId: string, width: number, thumbnail: Thumbnail, videos: Video[], autoPlay: boolean) {
    this.isInit = false;
    this.autoPlay = autoPlay;
    this.groupId = groupId;
    this.width = width;
    this.height = '0px';
    this.thumbnail = thumbnail;
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
    }

    this.currentVideo = this.videos[0];
  }

  init() {
    const groupDiv = $('#' + this.groupId);
    if (this.thumbnail != null) {
      this.thumbnail.init(groupDiv, this.width + 'px');
    }

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

      this.setCurrentVideo(this.videos[0]);
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
    const width = video.playerDiv.children('iframe').css('width');
    this.height = video.playerDiv.children('iframe').css('height');
    this.thumbnail.setSize(width, this.height);
    this.thumbnail.setShow(true);
  }

  onLoaded(video: Video) {
    console.log(video.id + ': Loaded');
  }

  onPlay(video: Video) {
    if (this.playStatus !== PlayStatus.PLAYING || this.currentVideo !== video) {
      return;
    }
    console.log(video.id + ': Play');
    // this.height = video.playerDiv.children('iframe').css('height');
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
    if (this.currentVideo != null) {
      this.playStatus = PlayStatus.PLAYING;
      this.thumbnail.setShow(false);
      this.currentVideo.play();
    }
  }

  stop() {
    this.videos.forEach(video => video.stop());
    this.currentPlayTime = 0;
    this.setCurrentVideo(null);
    if (this.videos.length > 0) {
      this.setCurrentVideo(this.videos[0]);
    }
    this.thumbnail.setShow(true);
    this.playStatus = PlayStatus.STOPPED;
  }

  pause() {
    if (this.currentVideo != null && this.playStatus !== PlayStatus.STOPPED) {
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
      this.currentVideo.play();
    }
  }

  setVolume(volume: boolean) {
    this.volume = volume;
    this.videos.forEach(video => video.setVolume(volume));
  }

  seek(timeCode) {
    const playStatus = this.playStatus;
    this.stop();
    const gotoVideo: CurrentVideo = this.calcCurrentVideo(timeCode);
    this.setCurrentVideo(gotoVideo.video);
    const subTime = gotoVideo.video.seek(gotoVideo.startTime);
    this.setCurrentPlayTime(timeCode);
    this.thumbnail.setShow(false);
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
    if (this.isInit && this.autoPlay) {
      this.play();
    }
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
  isInit: boolean;

  constructor(id: number, startTimeCode: number, endTimeCode: number) {
    this.isInit = false;
    this.id = id;
    this.startTimeCode = startTimeCode;
    this.endTimeCode = endTimeCode;
    this.currentTimeCode = 0;
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

      this.playerDiv = $('<div style="display: none" id="' + madeId + '"></div>');
      groupDiv.append(this.playerDiv);
      this.player = new Player(madeId, {
        id: this.id,
        width: this.parent.width,
        controls: false,
        autoplay: false,
        autopause: false
      });

      this.player.setVolume(0);
      this.player.setCurrentTime(this.startTimeCode);

      this.player.on('timeupdate', function(data) {
        _this.currentTimeCode = data.seconds;
        _this.parent.onTimeupdate(_this, data);
        if (data.seconds > _this.endTimeCode) {
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

  play() {
    const _this = this;
    this.player.play()
        .then(function(data) {
          console.log('played');
        })
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

  setVolume(volume: boolean) {
    if (this.player != null) {
      this.player.setVolume(volume ? 1 : 0);
    }
  }

  getDuration() {
    return this.endTimeCode - this.startTimeCode;
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

export class Thumbnail {
  src: string;
  videoIndex: number;
  timeCode: number;
  dom: any;
  private show: boolean;

  constructor(src: string, videoIndex: number, timeCode: number) {
    this.src = src;
    this.videoIndex = videoIndex;
    this.timeCode = timeCode;
  }

  init(groupDiv, width) {
    this.dom = $('<img/>');
    groupDiv.prepend(this.dom);
    this.dom.attr('src', this.src);
    this.dom.css('position', 'absolute');
    this.dom.css('left', '0px');
    this.dom.css('top', '0px');
    this.setSize(width, '0px');
    this.setShow(false);
  }

  setSize(width, height) {
    this.dom.css('width', width);
    this.dom.css('height', height);
  }

  setShow(show) {
    this.show = show;
    if ((this.videoIndex != null && this.timeCode != null) && show) {
      return;
    }
    this.dom.css('display', show ? 'block' : 'none');
  }

  isShow() {
    return this.show;
  }
}

export enum PlayStatus {
  STOPPED,
  PLAYING,
  PAUSED
}
