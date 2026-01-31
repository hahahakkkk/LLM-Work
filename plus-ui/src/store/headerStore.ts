/* eslint-disable */
import { defineStore } from 'pinia';

/**
 * Header组件的状态管理
 * 用于存储和持久化Header组件的activeButton状态
 */
export const useHeaderStore = defineStore('header', {
  state: () => ({
    // 从localStorage中恢复activeButton的值，如果不存在则默认为0
    activeButton: parseInt(localStorage.getItem('activeButton') || '0') || 0,
    activeURL: localStorage.getItem('activeURL') || '/',
    baseName: localStorage.getItem('baseName') || ''
  }),
  actions: {
    /**
     * 设置当前活动按钮
     * @param buttonIndex 按钮索引
     * @param url 按钮目标URL
     */
    setActiveButton(buttonIndex: number, url: string) {
      this.activeButton = buttonIndex;
      // 将状态持久化到localStorage
      localStorage.setItem('activeButton', buttonIndex.toString());
      localStorage.setItem('activeURL', url);
    },

    /**
     * 设置基地名称
     * @param name 基地名称
     */
    setBaseName(name: string) {
      this.baseName = name;
      localStorage.setItem('baseName', name);
    }
  }
});
