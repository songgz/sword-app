import { Component, OnInit } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {IonicModule, ToastController} from '@ionic/angular';
import {AuthService} from "../auths/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CtxStorageService} from "../services/ctx-storage.service";

@Component({
  selector: 'app-login2',
  templateUrl: './login2.page.html',
  styleUrls: ['./login2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgOptimizedImage, ReactiveFormsModule]
})
export class Login2Page implements OnInit {
  loggedIn: boolean = true;
  edited: boolean = false;
  loginForm!: UntypedFormGroup;
  users: any[] = [];
  items: any[] = [
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},
    {title: '中中中工',avatar: "https://picsum.photos/200/300"},

  ];

  constructor(private formBuilder: UntypedFormBuilder, private auth: AuthService, private route: ActivatedRoute,
              private router: Router, private toastController: ToastController, private store: CtxStorageService) {

  }

  ngOnInit() {
    this.users = this.store.getUsers();
    this.loginForm = this.formBuilder.group({
      username: ['IUGX159368', [Validators.required]],
      password: ['159368', Validators.required],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    };

    this.auth.login(this.f['username'].value,this.f['password'].value).subscribe({
      next: res => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl).then();
      },
      error: err => {
        this.presentToast(err.error.error, "bottom").then();
        console.log('aa');
        console.log(err);
        //this.toastService.show(data.data, { classname: 'bg-danger text-white', delay: 15000 });
      }
    });


  }


  async presentToast(msg: string, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: position,
      color: 'danger'
    });

    await toast.present();
  }

  toggleLongedIn() {
    this.loggedIn = !this.loggedIn;
  }


  fastLogin(index: number) {

    this.auth.login(this.users[index].acct_no, this.users[index].password).subscribe({
      next: res => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl).then();
      },
      error: err => {
        this.presentToast(err.error.error, "bottom").then();
      }
    });
  }

  toggleEdit() {
    this.edited = !this.edited;
  }

  delUser(index: number) {
    this.users.splice(index, 1);
    this.store.saveUsers(this.users);
  }

}
