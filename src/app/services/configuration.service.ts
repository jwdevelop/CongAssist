import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from 'app/services/auth.service';
import { TerritoryService } from 'app/services/territory.service';

@Injectable()
export class ConfigurationService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private territoryService: TerritoryService
  ) {}

  getAnnouncement() {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/configurations/announcement`);
  }

  updateAnnouncement(config: any) {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/configurations/announcement`).set(config);
  }

  fixDataError() {
    const congregation = this.authService.getCongregation();

    console.log('fixing assigned territories...');
    this.db.list(`${congregation}/users`).subscribe(users => {
      users.forEach(user => {
        if (user.hasOwnProperty('territories')) {
          for (const territoryKey in user.territories)  {
            if (user.territories[territoryKey] instanceof Object) {
              const userKey = user.$key;
              this.db.object(`${congregation}/users/${userKey}/territories`).remove();
              this.territoryService.assignTerritoryToUser(territoryKey, userKey);
            }
          }
        }
      });
    });

    console.log('fixing the number of houses in the territories...');
    this.db.list(`${congregation}/territories`).subscribe(territories => {
      territories.forEach(territory => {
        this.db.list(`${congregation}/houses/${territory.$key}`).subscribe(houses => {
          const count = {
            visited: houses.filter(house => house.hasOwnProperty('records')).length,
            total: houses.length
          };
          this.db.object(`${congregation}/territories/${territory.$key}`).update(count);
        });
      });
    });

    console.log('Done!');
  }
}
