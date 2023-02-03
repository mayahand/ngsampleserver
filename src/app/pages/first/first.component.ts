import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Video } from '../../components/vimeo/vimeo.component';

@Component({
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css']
})
export class FirstComponent implements OnInit {
  @ViewChild('player') player: ElementRef;

  videos1: Video[];
  videos2: Video[];
  videos3: Video[];
  width: Number = 640;

  constructor() {
  }

  ngOnInit() {
    const _this = this;

    // this.delay(1).then(function () {
    //   _this.videos1 = [
    //     new Video(742451862, 3, 13, false)
    //   ];
    // });

    this.delay(1).then(function () {
      _this.videos1 = [
        new Video(742451862, 3, 13, false),
        new Video(349093088, 10, 20, true),
        new Video(540384396, 5, 15, false),
        new Video(622786084, 10, 20, false),
        new Video(349093088, 0, 10, false)
      ];
    });

    this.delay(1).then(function () {
      _this.videos2 = [
        new Video(540384396, 5, 15, false),
        new Video(622786084, 0, 20, true, 2)
      ];
    });

    this.delay(1).then(function () {
      _this.videos3 = [
        new Video(622786084, 10, 20, false),
        new Video(349093088, 0, 10, true)
      ];
    });
  }

  delay(t) {
    return new Promise(f => setTimeout(f, t));
  }

  requestFullScreen () {
    if (this.player.nativeElement.requestFullscreen) {
      this.player.nativeElement.requestFullscreen();
    } else if (this.player.nativeElement.msRequestFullscreen) {
      this.player.nativeElement.msRequestFullscreen();
    } else if (this.player.nativeElement.mozRequestFullScreen) {
      this.player.nativeElement.mozRequestFullScreen();
    } else if (this.player.nativeElement.webkitRequestFullscreen) {
      this.player.nativeElement.webkitRequestFullscreen();
    }
  }

  exitFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}
