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
    return this.db.list(`${congregation}/territories`);
  }

  /**
   * Return single territory
   *
   * @param {string} key
   * @returns
   * @memberof TerritoryService
   */
  getTerritory(territoryKey: string) {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/territories/${territoryKey}`);
  }

  /**
   * Assign territory to user
   *
   * @param {string} territoryKey
   * @param {string} userKey
   * @returns
   * @memberof TerritoryService
   */
  assignTerritoryToUser(territory: Territory, userKey: string) {
    const congregation = this.authService.getCongregation();
    return this.db.object(`${congregation}/users/${userKey}/territories`).update({[territory.$key]: territory});
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
    return Promise.resolve(this.db.list(`${congregation}/houses/${territoryKey}`).subscribe(houses => {
      houses.forEach(house => {
        if (!house.records) { return; }
        this.db.object(`${congregation}/houses/${territoryKey}/${house.$key}/records`).remove();
      });
    }));
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
    delete house.$key;
    return this.db.list(`${congregation}/houses/${territoryKey}`).push(house);
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
  deleteHouse(territoryKey: string, house: House) {
    const congregation = this.authService.getCongregation();
    const houseKey = house.$key;
    return this.db.object(`${congregation}/houses/${territoryKey}/${houseKey}`).remove();
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
    return this.db.list(`${congregation}/houses/${territoryKey}`);
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
      userKey: userKey,
      username: username,
      timestamp: timestamp,
      code: code
    };

    return this.db.list(`${congregation}/houses/${territoryKey}/${houseKey}/records/${code}`).push({[userKey]: timestamp})
          .then(() => this.makeHistory(historyLocation, history));
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
      userKey: userKey,
      username: username,
      timestamp: timestamp,
      code: code,
      note: note
    };

    return this.db.list(`${congregation}/houses/${territoryKey}/${houseKey}/records/${code}`).push(record)
          .then(() => this.makeHistory(historyLocation, history));
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

}
