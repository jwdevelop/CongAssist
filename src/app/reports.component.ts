import { Component, OnInit } from '@angular/core';
import { ReportService } from 'app/services/report.service';
import { TerritoryService } from 'app/services/territory.service';
import { Observable } from 'rxjs/Observable';
import { Territory } from 'app/classes/territory';
import { Subscription } from 'rxjs/Subscription';

@Component({
  templateUrl: './reports.component.html'
})

export class ReportsComponent implements OnInit {

  selectedReport = 'circuit';
  dateRange: any;
  columns = [
    '구역번호',
    '구역이름',
    '처음방문일',
    '전도인',
    '마지막방문일',
    '전도인'
  ];

  territories: Observable<Territory[]>;
  territoriesSubscription: Subscription;

  constructor(
    private territoryService: TerritoryService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.territories = this.territoryService.getTerritories()
  }

  viewReport() {
    this.territories = this.territoryService.getTerritories().map(territories => territories.map(territory => {
      territory.histories = this.reportService.getHistoryOfTerritory(territory.$key, this.dateRange);
      return territory;
    }));
  }

  resetReport() {
    if (confirm('확인버튼을 누르면 모든 봉사기록을 삭제합니다.')) {
      this.reportService.resetHistory();
    }
  }

}
