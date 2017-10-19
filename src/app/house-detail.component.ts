import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TerritoryService } from 'app/services/territory.service';

import 'rxjs/add/operator/switchMap';

@Component({
  templateUrl: './house-detail.component.html'
})
export class HouseDetailComponent implements OnInit {

  history = [];

  constructor(
    private route: ActivatedRoute,
    private territoryService: TerritoryService
  ) {}

  ngOnInit() {
    this.route.paramMap.switchMap((params: ParamMap) => {
      const houseKey = params.get('key');
      return this.territoryService.getHouseHistory(houseKey);
    }).subscribe(history => {
      console.log(history)
      for (const record of history) {
        if (record.code === 1) { record.code = '만남'; }
        if (record.code === 2) { record.code = '부재'; }
        if (record.code === 3) { record.code = '거절'; }
      }
      this.history = history;
    });
  }

}
