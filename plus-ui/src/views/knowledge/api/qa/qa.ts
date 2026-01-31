import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 问题接口类型定义
export interface Question {
  questionId: string | number;
  userId: string | number;
  categoryDictValue: string;
  title: string;
  content: string;
  isHot: number;
  expert: number;
  answerCount: number;
  viewCount: number;
  likeCount: number;
  status: string;
  publishedAt: string;
  updatedAt: string;
  userName?: string;
  categoryName?: string;
}

// 回答接口类型定义
export interface Answer {
  answerId: string | number;
  questionId: string | number;
  userId: string | number;
  content: string;
  likeCount: number;
  replyCount: number;
  status: string;
  publishedAt: string;
  updatedAt: string;
  userName?: string;
}

// 回复接口类型定义
export interface Reply {
  replyId: string | number;
  answerId: string | number;
  userId: string | number;
  replyToUserId: string | number;
  content: string;
  likeCount: number;
  status: string;
  publishedAt: string;
  userName?: string;
  replyToUserName?: string;
}

// 查询参数
export interface QueryParams {
  pageNum?: number;
  pageSize?: number;
  [key: string]: any;
}

// 问题列表
export function listQuestions(query?: QueryParams): AxiosPromise<any> {
  return request({
    url: '/im/qa/question/list',
    method: 'get',
    params: query
  });
}

// 问题详情
export function getQuestionDetail(id: string | number): AxiosPromise<any> {
  return request({
    url: `/im/qa/question/${id}`,
    method: 'get'
  });
}

// 删除问题（支持批量）
export function deleteQuestions(ids: string | number | Array<string | number>): AxiosPromise<any> {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids;
  return request({
    url: `/im/qa/question/${idStr}`,
    method: 'delete'
  });
}

// 增加浏览量
export function viewQuestion(id: string | number): AxiosPromise<any> {
  return request({
    url: `/im/qa/question/addView/${id}`,
    method: 'put'
  });
}

// 查询回答列表
export function listAnswers(questionId: string | number, params?: QueryParams): AxiosPromise<any> {
  return request({
    url: '/im/qa/answer/list',
    method: 'get',
    params: { questionId, ...params }
  });
}

// 删除回答（支持批量）
export function deleteAnswers(ids: string | number | Array<string | number>): AxiosPromise<any> {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids;
  return request({
    url: `/im/qa/answer/${idStr}`,
    method: 'delete'
  });
}

// 查询回复列表
export function listReplies(answerId: string | number, params?: QueryParams): AxiosPromise<any> {
  return request({
    url: '/im/qa/reply/list',
    method: 'get',
    params: { answerId, ...params }
  });
}

// 删除回复（支持批量）
export function deleteReplies(ids: string | number | Array<string | number>): AxiosPromise<any> {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids;
  return request({
    url: `/im/qa/reply/${idStr}`,
    method: 'delete'
  });
}
