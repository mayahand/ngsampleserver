import { Component, OnInit } from '@angular/core';
import { Thumbnail, Video } from '../../components/vimeo/vimeo.component';

@Component({
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css']
})
export class FirstComponent implements OnInit {

  thumbnail: Thumbnail;
  videos1: Video[];
  videos2: Video[];
  videos3: Video[];

  constructor() {
  }

  ngOnInit() {
    const _this = this;

    _this.thumbnail = new Thumbnail(
        'https://d2njprwt6vp5kv.cloudfront.net/vendor/21913/main/012522newvendorbannersvivacurvydesktop1643647488844.jpg',
        null,
        null
    );

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

}
