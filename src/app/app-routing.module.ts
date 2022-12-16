import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FirstComponent } from './pages/first/first.component';
import { VimeoComponent } from './pages/vimeo/vimeo.component';

const routes: Routes = [
  { path: 'first', component: FirstComponent},
  { path: 'vimeo', component: VimeoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
