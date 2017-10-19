import { Injectable } from '@angular/core';
// Firebase
import { AngularFireDatabase } from 'angularfire2/database';
// Third party
import * as CryptoJS from 'crypto-js';
// Class
import { Signup } from 'app/classes/signup';
import { User } from 'app/classes/user';

@Injectable()
export class AuthService {
  user: User;
  isLoggedIn = false;

  constructor(
    private db: AngularFireDatabase
  ) {}

  /**
   * Push requesting users into the database
   *
   * @param {Signup} signup
   * @returns
   * @memberof AuthService
   */
  signup(signup: Signup) {
    const congregation = signup.congregation.toUpperCase();
    signup.phone.replace(/\D/g, '');
    signup.password = CryptoJS.MD5(signup.password).toString();

    return this.db.list(`signup/${congregation}`).push(signup);
  }

  /**
   * User validation. Save login info into local storage. Redirect to /home
   *
   * @param {string} congregation
   * @param {string} username
   * @param {string} password
   * @memberof AuthService
   */
  login(congregation: string, username: string, password: string) {
    congregation = congregation.toUpperCase();
    localStorage.removeItem('isLoggedIn');

    return this.db.object(`/${congregation}/users`).$ref.orderByChild('username').equalTo(username).once('value').then(snapshot => {
      let user: User;
      snapshot.forEach(child => {
        user = child.val();
        user.$key = child.key;
        return true;
      });

      password = CryptoJS.MD5(password).toString();

      if (user && user.password === password) {
        const loginInfo = {
          congregation: congregation,
          username: username,
          password: password,
          userKey: user.$key
        };

        localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
        localStorage.setItem('isLoggedIn', '1');
        localStorage.setItem('username', user.name);
        this.isLoggedIn = true;

        return true;
      }

      return false;
    });
  }

  /**
   * Logout. Remove user item from the local storage. Redirect to /login.
   *
   * @memberof AuthService
   */
  logout() {
    this.isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');

    return Promise.resolve(true);
  }

  /**
   * Check login method used by Auth Guard Service
   *
   * @returns {boolean}
   * @memberof AuthService
   */
  checkLogin(): boolean {
    // TODO: Apply session
    return this.isLoggedIn || localStorage.getItem('isLoggedIn') !== null;
  }

  /**
   * Return user's congregation
   *
   * @returns {string}
   * @memberof AuthService
   */
  getCongregation(): string {
    return this.getLoginInfo().congregation;
  }

  /**
   * Return login information from the local storage
   *
   * @returns
   * @memberof AuthService
   */
  getLoginInfo() {
    return JSON.parse(localStorage.getItem('loginInfo'));
  }

  /**
   * Return username from the local storage
   *
   * @returns
   * @memberof AuthService
   */
  getUserName() {
    return localStorage.getItem('username');
  }

  /**
   * Return user information
   *
   * @returns
   * @memberof AuthService
   */
  getCurrentUser() {
    const loginInfo = this.getLoginInfo();
    const congregation = loginInfo.congregation;
    const userKey = loginInfo.userKey;

    return this.db.object(`${congregation}/users/${userKey}`);
  }

  changePassword(userKey: string, newPassword: string) {
    const congregation = this.getCongregation();
    const password = CryptoJS.MD5(newPassword).toString();

    return this.db.object(`${congregation}/users/${userKey}`).update({
      password: password
    });
  }

}
