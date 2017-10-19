import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { User } from 'app/classes/user';
import { TerritoryService } from 'app/services/territory.service';
import { Territory } from 'app/classes/territory';

@Component({
  templateUrl: './assign.component.html'
})
export class AssignComponent implements OnInit {

  isAssignTerritoryOpen = false;
  territories: Territory[] = [];
  selectedUser: User;
  unassignedUsers: User[];
  assignedUsers: User[];

  constructor(
    private userService: UserService,
    private territoryService: TerritoryService
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(users => {
      this.unassignedUsers = users.filter(user => !user.territories && user.username !== 'admin');
      this.assignedUsers = users.filter(user => user.territories && user.username !== 'admin');
    });

    this.territoryService.getTerritories().subscribe(territories => this.territories = territories);
  }

  openAssignTerritory(user: User) {
    this.isAssignTerritoryOpen = true;
    this.selectedUser = user;
  }

  assignTerritory(territory: Territory) {
    this.territoryService.assignTerritoryToUser(territory, this.selectedUser.$key).then(() => this.isAssignTerritoryOpen = false);
  }

  deleteTerritory(user: User, territoryKey: string) {
    this.territoryService.deleteTerritoryFromUser(user.$key, territoryKey);
  }

  isAssignedTerritory(territory: Territory): boolean {
    if (!this.selectedUser || !this.selectedUser.territories) {
      return false
    };
    return Object.keys(this.selectedUser.territories).indexOf(territory.$key) !== -1;
  }

}
