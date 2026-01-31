import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ChatRecordVO, ChatRecordForm, ChatRecordQuery } from './types';

/**
 * 查询聊天记录列表
 * @param query
 * @returns {*}
 */
export const listChatRecord = (query?: ChatRecordQuery) => {
  return request({
    url: '/im/chatRecord/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询聊天记录详细
 * @param id
 */
export const getChatRecord = (id: string | number): AxiosPromise<ChatRecordVO> => {
  return request({
    url: '/im/chatRecord/' + id,
    method: 'get'
  });
};

/**
 * 新增聊天记录
 * @param data
 */
export const addChatRecord = (data: ChatRecordForm) => {
  return request({
    url: '/im/chatRecord',
    method: 'post',
    data: data
  });
};

/**
 * 修改聊天记录
 * @param data
 */
export const updateChatRecord = (data: ChatRecordForm) => {
  return request({
    url: '/im/chatRecord',
    method: 'put',
    data: data
  });
};

/**
 * 删除聊天记录
 * @param id
 */
export const delChatRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/im/chatRecord/' + id,
    method: 'delete'
  });
};
