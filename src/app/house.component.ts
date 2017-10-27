import { Component, OnInit } from '@angular/core';
import { TerritoryService } from 'app/services/territory.service';
import { House } from 'app/classes/house';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';


@Component({
  templateUrl: './house.component.html'
})
export class HouseComponent implements OnInit {

  houses: Observable<House[]>;
  territoryKey: string;
  selectedHouse: House;
  editingHouse: House;
  newHouse: House = {
    order: 1,
    name: ''
  };

  constructor(
    private territoryService: TerritoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.houses = this.route.paramMap.switchMap((params: ParamMap) => {
      this.territoryKey = params.get('key');
      return this.territoryService.getHouses(this.territoryKey);
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
      this.territoryService.createHouse(this.territoryKey, this.editingHouse).then(() => {
        this.selectedHouse = null;
      });
    }
  }

  edit(house: House) {
    this.selectedHouse = house;
    this.editingHouse = Object.assign({}, house);
  }

  cancel() {
    this.selectedHouse = null;
  }

  delete(house: House) {
    this.territoryService.deleteHouse(this.territoryKey, house.$key);
  }

}
