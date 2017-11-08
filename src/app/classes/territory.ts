import { Path } from 'app/classes/path';
import { Observable } from 'rxjs/Observable';

export interface Territory {
  number: number;
  name: string;
  center?: Path;
  zoom?: number;
  paths?: any[];
  users?: any;
  visited?: number;
  total?: number;
  histories?: Observable<any[]>;
  $key?: any;
}
