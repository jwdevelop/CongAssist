import { Component, OnInit } from '@angular/core';
import { TerritoryService } from 'app/services/territory.service';
import { House } from 'app/classes/house';
import { ActivatedRoute, ParamMap } from '@angular/router';

import 'rxjs/add/operator/switchMap';

@Component({
  templateUrl: './house.component.html'
})
export class HouseComponent implements OnInit {

  houses: House[] = [];
  territoryKey: string;
  selectedHouse: House;
  editingHouse: House;

  constructor(
    private territoryService: TerritoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.switchMap((params: ParamMap) => {
      this.territoryKey = params.get('key');
      return this.territoryService.getHouses(this.territoryKey);
    }).subscribe(houses => this.houses = houses);
  }

  addRow() {
    this.houses.push({
      name: '',
      order: 1
    });
    this.selectedHouse = this.houses[this.houses.length - 1];
    this.editingHouse = Object.assign({}, this.houses[this.houses.length - 1]);
  }

  save() {
    if (this.selectedHouse.$key) {
      this.editingHouse.$key = this.selectedHouse.$key;
      this.territoryService.updateHouse(this.territoryKey, this.editingHouse).then(() => {
        this.selectedHouse = null;
      });
    } else {
      this.territoryService.createHouse(this.territoryKey, this.editingHouse).then(() => {
        this.selectedHouse = null;
        this.houses = this.houses.filter(house => house.$key);
      });
    }
  }

  edit(house: House) {
    this.selectedHouse = house;
    this.editingHouse = Object.assign({}, house);
  }

  cancel() {
    this.selectedHouse = null;
    this.houses = this.houses.filter(house => house.$key);
  }

  delete(house: House) {
    this.territoryService.deleteHouse(this.territoryKey, house);
  }

}
