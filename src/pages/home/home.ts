import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';

declare var SMS:any;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    public remote:string;

    public temperature:number = 24;

    public power:boolean = true;

    public mode:string = 'C';

    public fanSpeed:string = '2';

    public settingsPage:any;

    public roomTemperature:number = null;

    constructor(public navCtrl:NavController,
                public loadingCtrl:LoadingController) {
        this.settingsPage = SettingsPage;

        try {
            SMS.enableIntercept(true);
            SMS.startWatch();

            document.addEventListener('onSMSArrive', (e:any) => {
                let sms = e.data;

                this.onSmsArrive(sms);

                if (sms.address != this.remote) {
                    SMS.restoreSMS([sms]);
                }
            });
        } catch (e) {
            console.log('SMS not supported.');
        }

        if (typeof window.localStorage['settings'] != 'undefined') {
            let settings = JSON.parse(window.localStorage['settings']);

            this.remote = settings.remote;
            this.temperature = settings.temperature;
            this.power = settings.power;
            this.mode = settings.mode;
            this.fanSpeed = settings.fanSpeed;
            this.roomTemperature = settings.roomTemperature;
        }
    }

    private onSmsArrive(sms) {
        let body:string = sms.body;
        alert(body);
    }

    public onRoomTemperatureButtonClick() {
        this.send(this.remote, 'T?');
    }

    public onSendButtonClick() {
        this.persistSettings();
        let message:string = this.formatMessage();

        this.send(this.remote, message);
    }

    public validateRemote() {
        if (this.remote.substr(0, 1) == '0') {
            this.remote = '+381' + this.remote.substr(1, this.remote.length);
        }
    }

    private formatMessage() {

        if (!this.power) {
            return 'OFF';
        }

        if (this.mode == 'D' || this.mode == 'A') {
            return `ON ${this.mode}`;
        }

        return `ON T:${this.temperature} F:${this.fanSpeed} M:${this.mode}`;
    }

    private persistSettings() {
        let settings:any = {
            remote: this.remote,
            temperature: this.temperature,
            power: this.power,
            mode: this.mode,
            fanSpeed: this.fanSpeed,
            roomTemperature: this.roomTemperature
        };

        window.localStorage['settings'] = JSON.stringify(settings);
    }

    send(remote:string, message:string) {

        var loader:any = this.loadingCtrl.create({
            content: "Sending. Please wait...",
            duration: 2000,
            showBackdrop: false
        });

        loader.present();

        setTimeout(() => {
            loader.dismiss();
        }, 1000);

        try {
            SMS.sendSMS(remote, message,
                () => {
                    console.info(`Sent sms to: ${remote}, content: '${message}'`);
                }, () => {
                    console.info(`Failed sending sms to: ${remote}, content: '${message}'`);
                });
        } catch (e) {
            console.log('SMS not supported.');
        }

    }

}
