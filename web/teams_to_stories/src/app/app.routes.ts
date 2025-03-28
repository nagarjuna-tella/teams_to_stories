import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ReviewComponent } from './pages/review/review.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'review', component: ReviewComponent },
  { path: '**', redirectTo: '' }
];