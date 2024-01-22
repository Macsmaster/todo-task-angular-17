import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { initializeApp } from "firebase/app";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements  OnInit {
  title = 'todo-list';
firebaseConfig = {
  apiKey: "AIzaSyBTTkLiql1eS6Vxc6nk2hRLnAgdJrEsP3g",
  authDomain: "todo-task-75fae.firebaseapp.com",
  projectId: "todo-task-75fae",
  storageBucket: "todo-task-75fae.appspot.com",
  messagingSenderId: "241756985435",
  appId: "1:241756985435:web:2fc59bc3a1d1fcf1a3877e"
};

constructor() {

  }

  ngOnInit(): void {
    this.initializeApp(this.firebaseConfig);
  }


  initializeApp(firebaseConfig: any) {
  const app = initializeApp(firebaseConfig);
  return app;
  };
}
