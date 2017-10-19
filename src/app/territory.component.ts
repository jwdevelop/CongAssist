import { Component, OnInit, ViewChild } from '@angular/core';
import { Territory } from 'app/classes/territory';
import { TerritoryService } from 'app/services/territory.service';
import { AuthService } from 'app/services/auth.service';
import { Wizard } from 'clarity-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DrawingManager } from '@ngui/map';
import { Path } from 'app/classes/path';

@Component({
  templateUrl: './territory.component.html'
})
export class TerritoryComponent implements OnInit {

  @ViewChild('newTerritory') wizard: Wizard;
  @ViewChild(DrawingManager) drawingManager: DrawingManager;
  isMapOpen = false;
  selectedTerritory: Territory;
  isNewTerritoryOpen = false;
  newTerritoryForm: FormGroup;
  currentPage = 1;
  polygons: any[] = [];
  map: any;
  myCongregation: string;

  territories: Territory[] = [];

  constructor(
    private territoryService: TerritoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.newTerritoryForm = new FormGroup({
      number: new FormControl('', [Validators.required, Validators.min(1)]),
      name: new FormControl('', Validators.required)
    });

    this.territoryService.getTerritories().subscribe(territories => this.territories = territories);

    this.drawingManager['initialized$'].subscribe(dm => {
      this.map = dm.map;
      google.maps.event.addListener(dm, 'polygoncomplete', polygon => {
        dm.setDrawingMode(null);
        google.maps.event.addListener(polygon, 'click', e => {
          polygon.setEditable(true);
        });
        this.polygons.push(polygon);
      });
    });

    this.myCongregation = this.authService.getCongregation();
  }

  viewMap(territory: Territory) {
    this.selectedTerritory = territory;
    this.isMapOpen = true;
  }

  restart(territory: Territory) {
    this.territoryService.restartTerritory(territory.$key);
  }

  clearMap() {
    this.polygons.map(polygon => polygon.setMap(null));
    this.polygons = [];
  }

  createTerritory() {
    const paths = [];
    this.polygons.map(polygon => {
      const path: Path[] = [];
      polygon.getPath().forEach(el => path.push({
        lat: el.lat(),
        lng: el.lng()
      }));
      paths.push(path);
    });
    const center = {
      lat: this.map.center.lat(),
      lng: this.map.center.lng()
    }

    const territory: Territory = {
      number: this.newTerritoryForm.get('number').value,
      name: this.newTerritoryForm.get('name').value,
      center: center,
      zoom: this.map.zoom,
      paths: paths
    };

    this.territoryService.createTerritory(territory);
    this.currentPage = 1;
    this.wizard.reset();
    this.newTerritoryForm.reset();
    this.clearMap();
  }

}
