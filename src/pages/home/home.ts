import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { SMS } from 'ionic-native';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    public remote:string;

    public temperature:number = 24;

    public power:boolean = true;

    public mode:string = 'C';

    public fanspeed:string = '2';

    private options:any = {
        replaceLineBreaks: false,
        android: {
            intent: ''
        }
    };

    constructor(public navCtrl:NavController) {

        if (typeof window.localStorage['settings'] != 'undefined') {
            let settings = JSON.parse(window.localStorage['settings']);

            this.remote = settings.remote;
            this.temperature = settings.temperature;
            this.power = settings.power;
            this.mode = settings.mode;
            this.fanspeed = settings.fanspeed;
        }

    }

    public onSendButtonClick() {
        this.persistSettings();
        let message:string = this.formatMessage();

        this.send(this.remote, message);
    }

    private formatMessage() {

        if(!this.power) {
            return 'OFF';
        }

        return `ON T:${this.temperature}F:${this.fanspeed}M:${this.mode}`;
    }

    private persistSettings() {
        let settings:any = {
            remote: this.remote,
            temperature: this.temperature,
            power: this.power,
            mode: this.mode,
            fanspeed: this.fanspeed
        };

        window.localStorage['settings'] = JSON.stringify(settings);
    }

    send(remote:string, message:string) {
        SMS.send(remote, message, this.options)
            .then(()=>{
                console.info(`Sent sms to: ${remote}, content: '${message}'`);
            },()=>{
              console.info(`Failed sending sms to: ${remote}, content: '${message}'`);
            });
    }

}
