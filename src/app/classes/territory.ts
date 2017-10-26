import { Path } from 'app/classes/path';

export interface Territory {
  number: number;
  name: string;
  center?: Path;
  zoom?: number;
  paths?: any[];
  $key?: any;
}
