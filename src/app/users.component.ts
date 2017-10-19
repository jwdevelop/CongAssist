import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { Signup } from 'app/classes/signup';
import { User } from 'app/classes/user';

@Component({
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {

  signups: Signup[] = [];
  users: User[] = [];
  alertText = '';
  isAlertClosed = true;
  selectedUser: User;
  editingUser: User;

  constructor(
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getSignups().subscribe(signups => this.signups = signups);
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  approve(signup: Signup) {
    this.userService.approveUser(signup);
  }

  disapprove(signup: Signup) {
    this.userService.removeSignup(signup.$key);
  }

  resetPassword(user: User) {
    this.userService.resetPassword(user).then(() => {
      this.alertText = '비밀번호가 초기화 되었습니다.';
      this.isAlertClosed = false;
      setTimeout(() => this.isAlertClosed = true, 1000);
    });
  }

  edit(user: User) {
    this.selectedUser = user;
    this.editingUser = Object.assign({}, user);
  }

  save() {
    this.editingUser.$key = this.selectedUser.$key;
    this.editingUser.phone = this.editingUser.phone.replace(/\D/g, '');
    this.userService.updateUser(this.editingUser);
    this.selectedUser = null;
  }

  remove(user: User) {
    this.userService.removeUser(user.$key).then(() => {
      this.alertText = '삭제되었습니다.';
      this.isAlertClosed = false;
      setTimeout(() => this.isAlertClosed = true, 1000);
    });
  }

}
