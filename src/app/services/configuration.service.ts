import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from 'app/services/auth.service';

@Injectable()
export class ConfigurationService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) {}

  getAnnouncement() {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/configurations/announcement`);
  }

  updateAnnouncement(config: any) {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/configurations/announcement`).set(config);
  }
}
