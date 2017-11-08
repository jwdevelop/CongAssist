import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TerritoryService } from 'app/services/territory.service';
import { House } from 'app/classes/house';

import 'rxjs/add/operator/switchMap';

@Component({
  templateUrl: './house-list.component.html'
})
export class HouseListComponent implements OnInit {

  territoryKey: string;
  houses: House[] = [];
  selectedHouse: House;
  isMakeNoteOpen = false;
  note = '';

  constructor(
    private route: ActivatedRoute,
    private territoryService: TerritoryService
  ) { }

  ngOnInit() {
    this.route.paramMap.switchMap((params: ParamMap) => {
      this.territoryKey = params.get('key');
      return this.territoryService.getHouses(this.territoryKey);
    }).subscribe(houses => {
      houses.map(house => {
        if (house.records) {
          let timestamp = 0;
          for (const code in house.records) {
            if (!house.records.hasOwnProperty(code)) { continue; }
            for (const houseKey in house.records[code]) {
              if (!house.records[code].hasOwnProperty(houseKey)) { continue; }
              for (const userKey in house.records[code][houseKey]) {
                if (userKey === 'note' || !house.records[code][houseKey].hasOwnProperty(userKey)) { continue; }
                if (timestamp < house.records[code][houseKey][userKey]) {
                  timestamp = house.records[code][houseKey][userKey];
                  if (code === '1') { house.note = '만남: '; }
                  if (code === '2') { house.note = '부재: '; }
                  if (code === '3') { house.note = '거절: '; }
                  if (code === '4') { house.note = '노트: '; }
                  house.note += new Date(timestamp).toISOString().substring(0, 10);
                }
              }
            }
          }
        }
      });

      this.houses = houses;
    });
  }

  visit(house: House, code: number) {
    if (code === 4) {
      this.isMakeNoteOpen = true;
      this.selectedHouse = house;
    } else {
      this.territoryService.recordVisit(this.territoryKey, code, house.$key);
    }
  }

  makeNote() {
    this.territoryService.makeNote(this.territoryKey, 4, this.selectedHouse.$key, this.note).then(() => this.isMakeNoteOpen = false);
  }

}
