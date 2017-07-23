import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';
import { Http } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

  private _loginState = new BehaviorSubject<number>(0);
  currentLoginState = this._loginState.asObservable();

  constructor(private _http: Http, private _authHttp: AuthHttp) { }

  checkToken() {
    return this._authHttp.get(environment.apiUrl + 'auth/token')
        .map(res => res.json());
  }

  setLoginState(value: number) {
    this._loginState.next(value);
  }

  login(_form: FormGroup) {
    return this._http.post(environment.apiUrl + 'auth/login', _form.value)
      .map(res => res.json());
  }

  loginCallback(response: any) {
    if (response.status.code === 200 &&
        typeof(response.data.access_token) !== 'undefined' &&
        typeof(response.data.refresh_token) !== 'undefined')
    {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      this._loginState.next(2);
    }
  }

  registration(_form: FormGroup) {
    return this._http.post(environment.apiUrl + 'auth/register', _form.value)
      .map(res => res.json());
  }

  logout() {
    if (localStorage.getItem('token') && localStorage.getItem('refresh_token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      this._loginState.next(0);
    }
  }
}