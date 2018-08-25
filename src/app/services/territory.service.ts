import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from './auth.service';
import { Territory } from 'app/classes/territory';
import { House } from 'app/classes/house';

@Injectable()
export class TerritoryService {
  constructor(
    private authService: AuthService,
    private db: AngularFireDatabase
  ) {}

  /**
   * Push territory
   *
   * @param {Territory} territory
   * @returns
   * @memberof TerritoryService
   */
  createTerritory(territory: Territory) {
    const congregation = this.authService.getCongregation();
    return this.db.list(`${congregation}/territories`).push(territory);
  }

  /**
   * Return all territories
   *
   * @returns
   * @memberof TerritoryService
   */
  getTerritories() {
    const congregation = this.authService.getCongregation();
    return this.db.list(`${congregation}/territories`, {
      query: {
        orderByChild: 'disabled',
        endAt: null
      }
    }).map(territories => territories.sort((a, b) => +a.number < +b.number ? -1 : 1));
  }

  /**
   * Assign territory to user
   *
   * @param {string} territoryKey
   * @param {string} userKey
   * @returns
   * @memberof TerritoryService
   */
  assignTerritoryToUser(territoryKey: string, userKey: string) {
    const congregation = this.authService.getCongregation();
    const timestamp = Date.now();
    this.db.object(`${congregation}/territories/${territoryKey}/users`).update({[userKey]: timestamp});
    return this.db.object(`${congregation}/users/${userKey}/territories`).update({[territoryKey]: timestamp});
  }

  /**
   * Delete assigned territory from the user
   *
   * @param {string} userKey
   * @param {string} territoryKey
   * @returns
   * @memberof TerritoryService
   */
  deleteTerritoryFromUser(userKey: string, territoryKey: string) {
    const congregation = this.authService.getCongregation();
    this.db.object(`${congregation}/territories/${territoryKey}/users/${userKey}`).remove()
    return this.db.object(`${congregation}/users/${userKey}/territories/${territoryKey}`).remove();
  }

  /**
   * Remove all house visit history of current session
   * All history will remain in the history table only
   *
   * @param {string} territoryKey
   * @returns
   * @memberof TerritoryService
   */
  restartTerritory(territoryKey: string) {
    const congregation = this.authService.getCongregation();

    this.db.list(`${congregation}/houses/${territoryKey}`).$ref.once('value', snapshot => {
      const houses = snapshot.val();

      for (const houseKey in houses) {
        if (houses[houseKey].hasOwnProperty('records')) {
          this.db.object(`${congregation}/houses/${territoryKey}/${houseKey}/records`).remove();
        }
      }
    });

    return this.db.object(`${congregation}/territories/${territoryKey}`).update({ visited: 0 });
  }

  /**
   * Push house into database
   *
   * @param {string} territoryKey
   * @param {House} house
   * @returns
   * @memberof TerritoryService
   */
  createHouse(territoryKey: string, house: House) {
    const congregation = this.authService.getCongregation();
    if (house.$key) { delete house.$key; }

    return this.db.list(`${congregation}/houses/${territoryKey}`).push(house).then(() => {
      this.db.list(`${congregation}/houses/${territoryKey}`).subscribe(houses => {
        this.db.object(`${congregation}/territories/${territoryKey}`).update({ total: houses.length });
      });
    });
  }

  /**
   * Update house
   *
   * @param {string} territoryKey
   * @param {House} house
   * @returns
   * @memberof TerritoryService
   */
  updateHouse(territoryKey: string, house: House) {
    const congregation = this.authService.getCongregation();
    const houseKey = house.$key;
    delete house.$key;
    return this.db.object(`${congregation}/houses/${territoryKey}/${houseKey}`).update(house);
  }

  /**
   * Delete house
   *
   * @param {string} territoryKey
   * @param {House} house
   * @returns
   * @memberof TerritoryService
   */
  deleteHouse(territoryKey: string, houseKey: string) {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/houses/${territoryKey}/${houseKey}`).update({ disabled: true });
  }

  /**
   * Return houses according to the territory key
   *
   * @param {string} territoryKey
   * @returns
   * @memberof TerritoryService
   */
  getHouses(territoryKey: string) {
    const congregation = this.authService.getCongregation();
    return this.db.list(`${congregation}/houses/${territoryKey}`, {
      query: {
        orderByChild: 'disabled',
        endAt: null
      }
    }).map(houses => houses.sort((a, b) => +a.order < +b.order ? -1 : 1));
  }

  /**
   * Record visit history except note
   *
   * @param {string} territoryKey
   * @param {number} code
   * @param {House} house
   * @returns
   * @memberof TerritoryService
   */
  recordVisit(territoryKey: string, code: number, houseKey: string) {
    const loginInfo = this.authService.getLoginInfo();
    const congregation = loginInfo.congregation;
    const userKey = loginInfo.userKey;
    const timestamp = Date.now();

    const username = this.authService.getUserName();
    const historyLocation = `${congregation}/history/houses/${houseKey}`;
    const history = {
      territoryKey: territoryKey,
      houseKey: houseKey,
      userKey: userKey,
      username: username,
      timestamp: timestamp,
      code: code
    };

    this.db.list(`${congregation}/houses/${territoryKey}`).subscribe(houses => {
      this.db.object(`${congregation}/territories/${territoryKey}`)
              .update({ visited: houses.filter(house => house.hasOwnProperty('records')).length });
    });
    this.db.list(`${congregation}/houses/${territoryKey}/${houseKey}/records/${code}`).push({[userKey]: timestamp});
    return this.makeHistory(historyLocation, history);
  }

  /**
   * Make a note of the house
   *
   * @param {string} territoryKey
   * @param {number} code
   * @param {House} house
   * @returns
   * @memberof TerritoryService
   */
  makeNote(territoryKey: string, code: number, houseKey: string, note: string) {
    const loginInfo = this.authService.getLoginInfo();
    const congregation = loginInfo.congregation;
    const userKey = loginInfo.userKey;
    const timestamp = Date.now();

    const record = {
      [userKey]: timestamp,
      note: note
    };

    const username = this.authService.getUserName();
    const historyLocation = `${congregation}/history/houses/${houseKey}`;
    const history = {
      territoryKey: territoryKey,
      houseKey: houseKey,
      userKey: userKey,
      username: username,
      timestamp: timestamp,
      code: code,
      note: note
    };

    this.db.list(`${congregation}/houses/${territoryKey}`).subscribe(houses => {
      this.db.object(`${congregation}/territories/${territoryKey}`)
              .update({ visited: houses.filter(house => house.hasOwnProperty('records')).length });
    });
    this.db.list(`${congregation}/houses/${territoryKey}/${houseKey}/records/${code}`).push(record);
    return this.makeHistory(historyLocation, history);
  }

  /**
   * Make visit history of the house
   *
   * @param {string} historyLocation
   * @param {*} history
   * @returns
   * @memberof TerritoryService
   */
  makeHistory(historyLocation: string, history: any) {
    return this.db.list(historyLocation).push(history);
  }

  /**
   * Return visit history of the house
   *
   * @param {string} houseKey
   * @returns
   * @memberof TerritoryService
   */
  getHouseHistory(houseKey: string) {
    const congregation = this.authService.getCongregation();
    return this.db.list(`${congregation}/history/houses/${houseKey}`);
  }

  /**
   * Update territory information
   *
   * @param {Territory} territory
   * @returns
   * @memberof TerritoryService
   */
  updateTerritory(territory: Territory) {
    const congregation = this.authService.getCongregation();
    const territoryKey = territory.$key;
    delete territory.$key;

    return this.db.object(`${congregation}/territories/${territoryKey}`).update(territory);
  }

  deleteTerritory(territoryKey: string) {
    const congregation = this.authService.getCongregation();

    this.db.list(`${congregation}/users`, {
      query: {
        orderByChild: 'territories',
        startAt: ''
      }
    }).map(users => {
      users.filter(user => user.territories.hasOwnProperty(territoryKey)).forEach(user => {
        this.deleteTerritoryFromUser(user.$key, territoryKey);
      });
    });

    return this.db.object(`${congregation}/territories/${territoryKey}`).update({ disabled: true });
  }

  getDeletedTerritories() {
    const congregation = this.authService.getCongregation();
    return this.db.list(`${congregation}/territories`, {
      query: {
        orderByChild: 'disabled',
        equalTo: true
      }
    }).map(territories => territories.sort((a, b) => +a.number < +b.number ? -1 : 1));
  }

  recoverTerritory(territoryKey) {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/territories/${territoryKey}/disabled`).remove();
  }

  getDeletedHouses(territoryKey: string) {
    const congregation = this.authService.getCongregation();
    return this.db.list(`${congregation}/houses/${territoryKey}`, {
      query: {
        orderByChild: 'disabled',
        equalTo: true
      }
    }).map(houses => houses.sort((a, b) => +a.order < +b.order ? -1 : 1));
  }

  recoverHouse(territoryKey: string, houseKey: string) {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/houses/${territoryKey}/${houseKey}/disabled`).remove();
  }

  getMyTerritories() {
    const loginInfo = this.authService.getLoginInfo();
    const userKey = loginInfo.userKey;

    return this.getTerritories()
      .map(territories => territories.filter(territory => territory.hasOwnProperty('users') && territory.users.hasOwnProperty(userKey)));
  }

}
