import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { Signup } from 'app/classes/signup';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;

  isLoading = false;
  isSubmitted = false;
  isSignupOpen = false;
  isAlertClosed = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const loginInfo = this.authService.getLoginInfo();
    const congregation = loginInfo ? loginInfo.congregation : '';
    const username = loginInfo ? loginInfo.username : '';

    this.loginForm = new FormGroup({
      congregation: new FormControl(congregation, Validators.required),
      username: new FormControl(username, Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.signupForm = new FormGroup({
      congregation: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    if (this.authService.checkLogin()) { this.router.navigate(['/home']); }
  }

  login() {
    const congregation = this.loginForm.get('congregation').value;
    const username = this.loginForm.get('username').value;
    const password = this.loginForm.get('password').value;

    this.isLoading = true;
    this.isSubmitted = true;
    this.authService.login(congregation, username, password).then(isValid => {
      this.isLoading = false;
      if (isValid) { this.router.navigate(['/home']); }
    });
  }

  signup() {
    const signup: Signup = {
      congregation: this.signupForm.get('congregation').value,
      name: this.signupForm.get('name').value,
      phone: this.signupForm.get('phone').value,
      password: this.signupForm.get('password').value
    };
    this.authService.signup(signup).then(() => {
      this.isSignupOpen = false;
      this.isAlertClosed = false;
      setTimeout(() => this.isAlertClosed = true, 1000);
    });
  }

}
