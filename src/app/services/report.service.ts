import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from 'app/services/auth.service';
import { TerritoryService } from 'app/services/territory.service';

@Injectable()
export class ReportService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private territoryService: TerritoryService
  ) {}

  getHistoryOfTerritory(territoryKey: string, dateRange: Date[]) {
    const congregation = this.authService.getCongregation();
    dateRange[1] = dateRange[1] ? dateRange[1] : new Date();

    return this.db.list(`${congregation}/history/houses`).map(houses => {
      const histories = [];
      houses.forEach(history => {
        for (const key in history) {
          if (history.hasOwnProperty(key)) {
            if (history[key].territoryKey !== territoryKey ||
                dateRange[0].getTime() > history[key].timestamp ||
                dateRange[1].getTime() < history[key].timestamp) {
              continue;
            }

            while (histories.length < 2) {
              histories.push(history[key]);
            }
            if (histories[0].timestamp > history[key].timestamp) {
              histories[0] = history[key];
            }
            if (histories[1].timestamp < history[key].timestamp) {
              histories[1] = history[key];
            }
          }
        }
      });
      return histories;
    });
  }

  resetHistory() {
    const congregation = this.authService.getCongregation();

    return this.db.list(`${congregation}/history`).remove();
  }
}
