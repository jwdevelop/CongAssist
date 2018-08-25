import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'filter'})
export class FilterPipe implements PipeTransform {
  transform(array: any[], field: any): any[] {
    return !array ? [] : array.filter(el => !el[field]);
  }
}
