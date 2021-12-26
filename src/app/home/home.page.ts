/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  private headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getApi();
  }

  getApi() {
    this.http.get('http://www.igofresh.in/categories/').toPromise();
  }

  postApi() {
    const loginData = new URLSearchParams({ user: mobile, pwd: password });
    return this.http.post(
      'http://www.igofresh.in/users/login',
      loginData.toString(),
      {
        headers: this.headers,
      }
    );
  }
}
