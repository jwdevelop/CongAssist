import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthService } from 'app/services/auth.service';
import { Signup } from 'app/classes/signup';
import { User } from 'app/classes/user';

@Injectable()
export class UserService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) {}

  /**
   * Get all signed up users within the current user's congregation
   *
   * @returns
   * @memberof UserService
   */
  getSignups() {
    const congregation = this.authService.getCongregation();
    return this.db.list(`/signup/${congregation}/`);
  }

  /**
   * Move signed up user information to users table
   *
   * @param {Signup} signup
   * @returns
   * @memberof UserService
   */
  approveUser(signup: Signup) {
    const congregation = this.authService.getCongregation();
    const user = {
      name: signup.name,
      phone: signup.phone,
      username: signup.phone,
      password: signup.password,
      role: 'member'
    };

    return this.db.list(`${congregation}/users`).push(user).then(() => this.removeSignup(signup.$key));
  }

  /**
   * Return observable user list
   *
   * @returns
   * @memberof UserService
   */
  getUsers() {
    const congregation = this.authService.getCongregation();
    return this.db.list(`${congregation}/users`);
  }

  /**
   * Remove signed up user information
   *
   * @param {string} key
   * @returns
   * @memberof UserService
   */
  removeSignup(key: string) {
    const congregation = this.authService.getCongregation();
    return this.db.list(`/signup/${congregation}/`).remove(key);
  }

  /**
   * Reset password to username
   *
   * @param {User} user
   * @returns
   * @memberof UserService
   */
  resetPassword(user: User) {
    return this.authService.changePassword(user.$key, user.username);
  }

  /**
   * Update user information
   *
   * @param {User} user
   * @returns
   * @memberof UserService
   */
  updateUser(user: User) {
    const congregation = this.authService.getCongregation();
    const userKey = user.$key;
    delete user.$key;
    return this.db.object(`${congregation}/users/${userKey}`).update(user);
  }

  removeUser(userKey: string) {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/users/${userKey}`).remove();
  }
}
