import { Row } from '@/views/process/api/pestcontrol/preventionRec/classify/types';
import { VideoRow } from '@/views/process/api/pestcontrol/preventionRec/prevence/types';

export interface NavItem {
  name: string;
  children?: SidebarItem[];
}

export interface SidebarItem {
  name: string;
  children?: SidebarItem[];
  payload?: Row[] | VideoRow;
}
