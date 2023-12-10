import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {IonicModule, ToastController} from '@ionic/angular';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../auths/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder,private auth: AuthService, private route: ActivatedRoute,
              private router: Router, private toastController: ToastController) { }

  ngOnInit() {
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



}
