import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'orderBy'})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: any, isAcceding: boolean = true): any[] {
    array.sort((a, b) => {
      a[field] = a[field] || 0;
      b[field] = b[field] || 0;

      if (a[field] < b[field]) {
        return isAcceding ? -1 : 1;
      } else if (a[field] > b[field]) {
        return isAcceding ? 1 : -1;
      } else {
        return 0;
      }
    });

    return array;
  }
}
