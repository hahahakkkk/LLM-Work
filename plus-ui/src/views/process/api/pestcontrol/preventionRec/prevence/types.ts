export interface VideoVO {
  total: number;
  rows: VideoRow[];
  code: number;
  msg: string;
}

export interface VideoRow {
  id: number;
  name: string;
  pic: string;
  video: string;
}
