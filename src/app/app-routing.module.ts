import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Service
import { AuthGuard } from 'app/services/auth-guard.service';
// Component
import { UsersComponent } from './users.component';
import { LoginComponent } from './login.component';
import { HomeComponent } from './home.component';
import { HouseListComponent } from './house-list.component';
import { HouseDetailComponent } from './house-detail.component';
import { AssignComponent } from 'app/assign.component';
import { TerritoryComponent } from 'app/territory.component';
import { HouseComponent } from 'app/house.component';
import { SettingComponent } from 'app/setting.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [ AuthGuard ] },
  { path: 'users', component: UsersComponent, canActivate: [ AuthGuard ] },
  { path: 'assign', component: AssignComponent, canActivate: [ AuthGuard ] },
  { path: 'territory', component: TerritoryComponent, canActivate: [ AuthGuard ] },
  { path: 'setting', component: SettingComponent, canActivate: [ AuthGuard ] },
  { path: 'house/:key', component: HouseComponent, canActivate: [ AuthGuard ] },
  { path: 'houselist/:key', component: HouseListComponent, canActivate: [ AuthGuard ] },
  { path: 'housedetail/:key', component: HouseDetailComponent, canActivate: [ AuthGuard ] },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot( appRoutes )
  ],
  exports: [ RouterModule ],
  providers: [ AuthGuard ],
})

export class AppRoutingModule { }
