import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { User } from 'app/classes/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  user: User;
  isLoading = true;
  isHome = false;

  constructor(
    private router: Router,
    private location: Location,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isHome = this.location.path() === '/home';

    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      this.isLoading = false;
    });
  }

  logout() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }

  goBack() {
    this.location.back();
  }
}
