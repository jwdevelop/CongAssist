import { Component, OnInit } from '@angular/core';
import { Territory } from 'app/classes/territory';
import { AuthService } from 'app/services/auth.service';
import { TerritoryService } from 'app/services/territory.service';
import { ConfigurationService } from 'app/services/configuration.service';

@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  territories: Territory[] = [];
  isLoading = true;
  isAlertClosed = true;
  alertText = '';

  constructor(
    private authService: AuthService,
    private territoryService: TerritoryService,
    private configurationService: ConfigurationService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.territories = [];
      for (const key in user.territories) {
        if (user.territories.hasOwnProperty(key)) {
          this.territories.push(user.territories[key]);
          this.territories[this.territories.length - 1].$key = key;
        }
      }

      this.isLoading = false;
    });

    this.configurationService.getAnnouncement().subscribe(config => {
      if (config && config.text && config.isVisible) {
        this.alertText = config.text;
        this.isAlertClosed = false;
      }
    });
  }

  return(territoryKey: string) {
    const loginInfo = this.authService.getLoginInfo();
    this.territoryService.deleteTerritoryFromUser(loginInfo.userKey, territoryKey);
  }

}
