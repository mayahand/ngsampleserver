import { Component, OnInit } from '@angular/core';
import { Thumbnail, Video } from '../../components/vimeo/vimeo.component';

@Component({
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css']
})
export class FirstComponent implements OnInit {

  thumbnail1: Thumbnail;
  thumbnail2: Thumbnail;
  thumbnail3: Thumbnail;
  videos1: Video[];
  videos2: Video[];
  videos3: Video[];

  constructor() {
  }

  ngOnInit() {
    const _this = this;
    this.delay(3000).then(function () {
      _this.thumbnail1 = new Thumbnail(
          'https://d2njprwt6vp5kv.cloudfront.net/vendor/21913/main/012522newvendorbannersvivacurvydesktop1643647488844.jpg',
          null,
          null
      );

      _this.videos1 = [
        new Video(742451862, 3, 13),
        new Video(349093088, 10, 20),
        new Video(540384396, 5, 15),
        new Video(622786084, 10, 20),
        new Video(349093088, 0, 10)
      ];
    });

    this.delay(5000).then(function () {
      _this.thumbnail2 = new Thumbnail(
          'https://d2njprwt6vp5kv.cloudfront.net/vendor/21913/main/012522newvendorbannersvivacurvydesktop1643647488844.jpg',
          null,
          null
      );

      _this.videos2 = [
        new Video(540384396, 5, 15),
        new Video(622786084, 10, 20)
      ];
    });

    this.delay(1000).then(function () {
      _this.thumbnail3 = new Thumbnail(
          'https://d2njprwt6vp5kv.cloudfront.net/vendor/21913/main/012522newvendorbannersvivacurvydesktop1643647488844.jpg',
          null,
          null
      );

      _this.videos3 = [
        new Video(622786084, 10, 20),
        new Video(349093088, 0, 10)
      ];
    });
  }

  delay(t) {
    return new Promise(f => setTimeout(f, t));
  }

}
