import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ConfigurationService } from 'app/services/configuration.service';

@Component({
  templateUrl: './configurations.component.html'
})
export class ConfigurationsComponent implements OnInit {

  isAlertClosed = true;
  alertText: string;
  configForm: FormGroup;
  isAnnouncementShowing = false;
  isLoading = true;

  constructor(
    private configurationService: ConfigurationService
  ) {}

  ngOnInit() {
    this.configForm = new FormGroup({
      announcement: new FormControl('')
    });

    this.configurationService.getAnnouncement().subscribe((config) => {
      if (config && config.text) {
        this.configForm.get('announcement').setValue(config.text);
      }
      this.isAnnouncementShowing = config.isVisible;

      this.isLoading = false;
    });
  }

  updateAnnouncement(isVisible: boolean) {
    const announcement = this.configForm.get('announcement').value;
    let callback: any;

    if (announcement) {
      callback = this.configurationService.updateAnnouncement({
        isVisible: isVisible,
        text: announcement
      });
    } else {
      callback = this.configurationService.updateAnnouncement({
        isVisible: isVisible
      });
    }

    callback.then(() => {
      this.alertText = '업데이가 완료되었습니다.';
      this.isAlertClosed = false;
      setTimeout(() => this.isAlertClosed = true, 1000);
    });
  }

  fixDataError() {
    this.configurationService.fixDataError();
  }

}
