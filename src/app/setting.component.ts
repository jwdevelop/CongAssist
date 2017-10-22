import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/classes/user';
import { UserService } from 'app/services/user.service';

@Component({
  templateUrl: './setting.component.html'
})
export class SettingComponent implements OnInit {

  userForm: FormGroup;
  user: User;
  isAlertClosed = true;
  alertText: string;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userForm = new FormGroup({
      name: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      password: new FormControl('')
    });

    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      const phone = this.user.phone ? this.user.phone : '';

      this.userForm.setValue({
        name: this.user.name,
        phone: phone,
        username: this.user.username,
        password: ''
      });
    });
  }

  save() {
    const userInfo = Object.assign({}, this.user);

    userInfo.$key = this.user.$key;
    userInfo.name = this.userForm.get('name').value;
    userInfo.phone = this.userForm.get('phone').value.replace(/\D/g, '');
    userInfo.username = this.userForm.get('username').value;
    const password = this.userForm.get('password').value;

    if (password) {
      this.authService.changePassword(this.user.$key, password).then(() => {
        this.userForm.get('password').setValue('');
      });
    }

    this.userService.updateUser(userInfo).then(() => {
      this.alertText = (password ? '비밀번호, ' : '') + '사용자정보가 변경 되었습니다.';
      this.isAlertClosed = false;
      setTimeout(() => this.isAlertClosed = true, 1000);
    });
  }

}
