import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';

const TOKEN_KEY = 'auth-token';
const REFRESHTOKEN_KEY = 'auth-refreshtoken';
const USER_KEY = 'auth-user';

const DEFAULT_USER: UserModel = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@nexus.local',
  firstName: 'Nexus Admin',
  roles: ['admin'],
  permissions: [
    'Permissions.Dashboard.View',
    'Permissions.Users.View',
    'Permissions.Users.Create',
    'Permissions.Users.Edit',
    'Permissions.Users.Delete',
    'Permissions.Roles.View',
    'Permissions.Roles.Edit',
    'Permissions.Roles.Delete',
    'Permissions.PostCategories.View',
    'Permissions.PostCategories.Create',
    'Permissions.PostCategories.Edit',
    'Permissions.PostCategories.Delete',
    'Permissions.Posts.View',
    'Permissions.Posts.Create',
    'Permissions.Posts.Edit',
    'Permissions.Posts.Delete',
    'Permissions.Posts.Approve',
    'Permissions.Series.View',
    'Permissions.Series.Create',
    'Permissions.Series.Edit',
    'Permissions.Series.Delete',
  ],
};
@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor() {}

  signOut(): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESHTOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }

  public saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);

    const user = this.getUser();
    if (user?.id) {
      this.saveUser({ ...user, accessToken: token });
    }
  }

  public getToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  public saveRefreshToken(token: string): void {
    window.localStorage.removeItem(REFRESHTOKEN_KEY);
    window.localStorage.setItem(REFRESHTOKEN_KEY, token);
  }

  public getRefreshToken(): string | null {
    return window.localStorage.getItem(REFRESHTOKEN_KEY);
  }

  public saveUser(user: UserModel | Record<string, unknown>): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): UserModel | null {
    const storedUser = window.localStorage.getItem(USER_KEY);
    if (storedUser) {
      return JSON.parse(storedUser) as UserModel;
    }

    this.saveUser(DEFAULT_USER);
    return DEFAULT_USER;
  }

  b64DecodeUnicode(str: string) {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), function (character: string) {
          return '%' + ('00' + character.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
  }
}
