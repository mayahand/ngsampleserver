import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { FirstComponent } from './pages/first/first.component';
import { VimeoComponent } from './pages/vimeo/vimeo.component';


@NgModule({
  declarations: [
    AppComponent,
    FirstComponent,
    VimeoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
