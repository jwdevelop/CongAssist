import { Component, OnInit, ViewChild } from '@angular/core';
import { Territory } from 'app/classes/territory';
import { TerritoryService } from 'app/services/territory.service';
import { AuthService } from 'app/services/auth.service';
import { Wizard } from 'clarity-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DrawingManager } from '@ngui/map';
import { Path } from 'app/classes/path';
import { House } from 'app/classes/house';
import { Observable } from 'rxjs/Observable';

@Component({
  templateUrl: './territory.component.html'
})
export class TerritoryComponent implements OnInit {

  @ViewChild('newTerritory') wizard: Wizard;
  @ViewChild(DrawingManager) drawingManager: DrawingManager;
  newTerritoryForm: FormGroup;
  selectedTerritory: Territory;
  myCongregation: string;
  isMapOpen = false;
  isNewTerritoryOpen = false;
  polygons: any[] = [];
  map: any;
  isRestarting = false;

  territories: Observable<Territory[]>;
  deletedTerritories: Observable<Territory[]>;

  constructor(
    private territoryService: TerritoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.newTerritoryForm = new FormGroup({
      number: new FormControl('', [Validators.required, Validators.min(1)]),
      name: new FormControl('', Validators.required),
      isApartment: new FormControl(false),
      buildings: new FormControl(''),
      levelFrom: new FormControl(null),
      levelTo: new FormControl(null),
      numberFrom: new FormControl(null),
      numberTo: new FormControl(null)
    });

    this.territories = this.territoryService.getTerritories();

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

  addTerritory() {
    this.resetWizard();
    this.selectedTerritory = null;
    this.isNewTerritoryOpen = true;
  }

  viewMap(territory: Territory) {
    this.selectedTerritory = territory;
    this.isMapOpen = true;
  }

  restart(territory: Territory) {
    this.isRestarting = true;
    this.territoryService.restartTerritory(territory.$key).then(() => this.isRestarting = false);
  }

  clearMap() {
    this.polygons.forEach(polygon => polygon.setMap(null));
    this.polygons = [];
  }

  resetWizard() {
    this.wizard.reset();
    this.newTerritoryForm.reset();
    this.clearMap();
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

    this.territoryService.createTerritory(territory).then((ref) => {
      if (this.newTerritoryForm.get('isApartment').value) {
        const territoryKey = ref.key;
        const buildings = this.newTerritoryForm.get('buildings').value.toString().trim().split(',');
        const levelFrom = +this.newTerritoryForm.get('levelFrom').value.toString().replace(/\D/g, '').trim();
        const levelTo = +this.newTerritoryForm.get('levelTo').value.toString().replace(/\D/g, '').trim();
        const numberFrom = +this.newTerritoryForm.get('numberFrom').value.toString().replace(/\D/g, '').trim();
        const numberTo = +this.newTerritoryForm.get('numberTo').value.toString().replace(/\D/g, '').trim();

        let order = 1;
        buildings.forEach(building => {
          for (let i = levelFrom; i <= levelTo; i++) {
            for (let j = numberFrom; j <= numberTo; j++) {
              const house: House = {
                name: building + '동 ' + i.toString() + '0' + j.toString() + '호',
                order: order++
              };
              this.territoryService.createHouse(territoryKey, house);
            }
          }
        });
      }
    });
  }

  editTerritory(territory: Territory) {
    this.resetWizard();
    this.selectedTerritory = territory;
    this.newTerritoryForm.get('number').setValue(territory.number);
    this.newTerritoryForm.get('name').setValue(territory.name);
    this.isNewTerritoryOpen = true;
  }

  updateTerritory() {
    const territory: Territory = {
      $key: this.selectedTerritory.$key,
      number: this.newTerritoryForm.get('number').value,
      name: this.newTerritoryForm.get('name').value
    };

    if (this.polygons.length) {
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

      territory.center = center;
      territory.zoom = this.map.zoom;
      territory.paths = paths;
    }

    this.territoryService.updateTerritory(territory);
  }

  fetchDeleteTerritories() {
    if (!this.deletedTerritories) {
      this.deletedTerritories = this.territoryService.getDeletedTerritories();
    }
  }

  recoverTerritory(territory: Territory) {
    this.territoryService.recoverTerritory(territory.$key);
  }

}
