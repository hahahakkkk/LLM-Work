export interface ChatRecordQuery {
  pageNum: number;
  pageSize: number;
  senderId?: number;
  senderName?: string;
  receiverId?: string;
  receiverName?: string;
  startTime?: string;
  endTime?: string;
  content?: string;
}

export interface ChatRecordVO extends BaseEntity {
  id: number;
  receiverId: string | number;
  receiverName: string;
  senderId: string | number;
  senderName: string;
  payload: string;
  type: string;
  sendTime: string;
  status: string;
}

export interface ChatRecordForm extends BaseEntity {
  id?: number;
  receiverId?: string;
  senderId?: number;
  payload?: string;
  type?: 'text' | 'image' | 'file';
}
