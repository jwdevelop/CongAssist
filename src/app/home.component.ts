import { Component, OnInit, OnDestroy } from '@angular/core';
import { Territory } from 'app/classes/territory';
import { AuthService } from 'app/services/auth.service';
import { TerritoryService } from 'app/services/territory.service';
import { ConfigurationService } from 'app/services/configuration.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {

  territories: Observable<Territory[]>;
  territoriesSubscription: Subscription;
  isLoading = true;
  isAlertClosed = true;
  alertText = '';

  constructor(
    private authService: AuthService,
    private territoryService: TerritoryService,
    private configurationService: ConfigurationService
  ) {}

  ngOnInit() {
    this.territories = this.territoryService.getMyTerritories();
    this.territoriesSubscription = this.territories.subscribe(() => this.isLoading = false);

    this.configurationService.getAnnouncement().subscribe(config => {
      if (config && config.text && config.isVisible) {
        this.alertText = config.text;
        this.isAlertClosed = false;
      }
    });
  }

  ngOnDestroy() {
    this.territoriesSubscription.unsubscribe();
  }

  return(territoryKey: string) {
    const loginInfo = this.authService.getLoginInfo();
    this.territoryService.deleteTerritoryFromUser(loginInfo.userKey, territoryKey);
  }

}
