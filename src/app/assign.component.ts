import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { User } from 'app/classes/user';
import { TerritoryService } from 'app/services/territory.service';
import { Territory } from 'app/classes/territory';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  templateUrl: './assign.component.html'
})
export class AssignComponent implements OnInit, OnDestroy {

  isAssignTerritoryOpen = false;
  territories: Observable<Territory[]>;
  territoriesSubscription: Subscription;
  selectedUser: User;
  unassignedUsers: User[];
  assignedUsers: User[];

  constructor(
    private userService: UserService,
    private territoryService: TerritoryService
  ) {}

  ngOnInit() {
    this.territories = this.territoryService.getTerritories().map(territories => territories.filter(territory => territory.users));
    this.territoriesSubscription = this.territories.subscribe(territories => {
      this.userService.getUsers().subscribe(users => {
        this.unassignedUsers = users.filter(user => !user.territories && user.username !== 'admin');
        this.assignedUsers = users.filter(user => user.territories && user.username !== 'admin').map(user => {
          user.territories = territories.filter(territory => territory.hasOwnProperty('users') &&
                                                              territory.users.hasOwnProperty(user.$key));
          return user;
        });
      });
    });
  }

  ngOnDestroy() {
    this.territoriesSubscription.unsubscribe();
  }

  openAssignTerritory(user: User) {
    this.isAssignTerritoryOpen = true;
    this.selectedUser = user;
  }

  assignTerritory(territory: Territory) {
    this.territoryService.assignTerritoryToUser(territory.$key, this.selectedUser.$key).then(() => this.isAssignTerritoryOpen = false);
  }

  deleteTerritory(user: User, territory: Territory) {
    this.territoryService.deleteTerritoryFromUser(user.$key, territory.$key);
  }

  isAssignedTerritory(territory: Territory): boolean {
    if (!this.selectedUser || !this.selectedUser.territories) {
      return false
    };
    return territory.hasOwnProperty('users') && territory.users.hasOwnProperty(this.selectedUser.$key);
  }

}
