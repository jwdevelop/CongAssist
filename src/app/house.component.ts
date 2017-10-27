import { Component, OnInit } from '@angular/core';
import { TerritoryService } from 'app/services/territory.service';
import { House } from 'app/classes/house';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';


@Component({
  templateUrl: './house.component.html'
})
export class HouseComponent implements OnInit {

  houses: Observable<House[]>;
  territoryKey: string;
  selectedHouse: House = null;
  editingHouse: House = null;
  newHouse: House = {
    order: 1,
    name: ''
  };
  isAlertWindowOpen = false;
  alertWindowTitle = '';
  alertWindowText = '';

  constructor(
    private territoryService: TerritoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.houses = this.route.paramMap.switchMap((params: ParamMap) => {
      this.territoryKey = params.get('key');
      return this.territoryService.getHouses(this.territoryKey);
    });
  }

  openAlertHouse(house: House) {
    this.alertWindowTitle = '집 삭제';
    this.alertWindowText = `'${house.name}'을 삭제하시겠습니까?`;
    this.isAlertWindowOpen = true;
    this.editingHouse = house;
  }

  openAlertTerritory() {
    this.alertWindowTitle = '구역 삭제';
    this.alertWindowText = '이 구역을 삭제하시겠습니까?';
    this.isAlertWindowOpen = true;
    this.selectedHouse = null;
    this.editingHouse = null;
  }

  deleteTerritory() {
    this.territoryService.deleteTerritory(this.territoryKey).then(() => {
      this.isAlertWindowOpen = false;
      this.router.navigate(['/territory']);
    });
  }

  addRow() {
    this.selectedHouse = this.newHouse;
    this.editingHouse = Object.assign({}, this.newHouse);
  }

  save() {
    if (this.selectedHouse.$key) {
      this.editingHouse.$key = this.selectedHouse.$key;
      this.territoryService.updateHouse(this.territoryKey, this.editingHouse).then(() => {
        this.selectedHouse = null;
      });
    } else {
      this.territoryService.createHouse(this.territoryKey, this.editingHouse);
    }
  }

  edit(house: House) {
    this.selectedHouse = house;
    this.editingHouse = Object.assign({}, house);
  }

  deleteHouse() {
    this.territoryService.deleteHouse(this.territoryKey, this.editingHouse.$key).then(() => this.isAlertWindowOpen = false);
  }

}
