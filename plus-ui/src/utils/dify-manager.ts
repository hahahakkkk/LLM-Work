// Dify 配置接口
export interface DifyConfig {
  token: string;
  baseUrl: string;
  systemVariables?: Record<string, any>;
  tools?: {
    authentication: {
      enabled: boolean;
      type: string;
      content: string;
    };
  };
}

// Dify 管理器类
export class DifyManager {
  private static instance: DifyManager;
  private config: DifyConfig;
  private isInitialized = false;
  private readonly preHideStyleId = 'pre-hide-dify-style';
  private readonly scriptId: string;

  private constructor(config: DifyConfig) {
    this.config = config;
    this.scriptId = config.token;
  }

  static getInstance(config?: DifyConfig): DifyManager {
    if (!DifyManager.instance && config) {
      DifyManager.instance = new DifyManager(config);
    }
    return DifyManager.instance;
  }

  // 检查是否已初始化
  isDifyInitialized(): boolean {
    return this.isInitialized || !!(window as any).difyInitialized;
  }

  // 添加预隐藏样式（防止闪烁）
  private addPreHideStyle(): void {
    if (document.getElementById(this.preHideStyleId)) return;

    const style = document.createElement('style');
    style.id = this.preHideStyleId;
    style.innerHTML = `
      #dify-chatbot-bubble-button,
      #dify-chatbot-bubble-window,
      [id^="dify-chatbot-"],
      [class*="dify-chatbot"],
      .dify-chatbot {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 移除预隐藏样式
  private removePreHideStyle(): void {
    const preHideStyle = document.getElementById(this.preHideStyleId);
    if (preHideStyle) {
      preHideStyle.remove();
    }
  }

  // 添加自定义样式
  private addCustomStyles(): void {
    const existingStyle = document.getElementById('dify-custom-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'dify-custom-styles';
    style.innerHTML = `
      #dify-chatbot-bubble-button {
        background-color: #1C64F2 !important;
        right: 40px !important;
        bottom: 40px !important;
        z-index: 99999 !important;
        transition: opacity 0.3s ease, visibility 0.3s ease !important;
      }
      #dify-chatbot-bubble-window {
        width: 24rem !important;
        height: 40rem !important;
        z-index: 99998 !important;
        transition: opacity 0.3s ease, visibility 0.3s ease !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 确保 Dify 元素可见
  private ensureDifyVisible(): void {
    setTimeout(() => {
      const bubbleButton = document.getElementById('dify-chatbot-bubble-button');
      const chatWindow = document.getElementById('dify-chatbot-bubble-window');

      if (bubbleButton) {
        bubbleButton.style.display = 'block';
        bubbleButton.style.visibility = 'visible';
        bubbleButton.style.opacity = '1';
        bubbleButton.style.pointerEvents = 'auto';
      }
      if (chatWindow) {
        chatWindow.style.visibility = 'visible';
        chatWindow.style.opacity = '1';
        chatWindow.style.pointerEvents = 'auto';
      }
    }, 300);
  }

  // 移除 Dify 所有相关元素
  removeDifyElements(): void {
    // 移除 Dify 脚本
    const script = document.getElementById(this.scriptId);
    if (script) {
      script.remove();
    }

    // 移除 Dify 样式
    const styles = document.querySelectorAll('style');
    styles.forEach((style) => {
      if (style.innerHTML.includes('dify-chatbot') || style.innerHTML.includes('dify-chat')) {
        style.remove();
      }
    });

    // 移除 Dify DOM 元素
    const difyElements = document.querySelectorAll('[id*="dify"], [class*="dify"]');
    difyElements.forEach((el) => el.remove());

    // 移除预隐藏样式
    this.removePreHideStyle();

    // 移除自定义样式
    const customStyle = document.getElementById('dify-custom-styles');
    if (customStyle) {
      customStyle.remove();
    }

    // 重置初始化标记和配置
    (window as any).difyInitialized = false;
    if (window.difyChatbotConfig) {
      delete window.difyChatbotConfig;
    }

    this.isInitialized = false;
  }

  // 初始化 Dify 聊天
  initDifyChat(token?: string): void {
    // 防止重复加载
    if (this.isDifyInitialized() || document.getElementById(this.scriptId)) return;

    // 确保 window 对象存在
    if (typeof window === 'undefined') return;

    // 在加载前先添加隐藏样式
    this.addPreHideStyle();

    // 更新认证令牌
    const authToken = token || this.config.tools?.authentication.content.replace('Bearer ', '');

    // 创建配置对象
    window.difyChatbotConfig = {
      token: this.config.token,
      baseUrl: this.config.baseUrl,
      systemVariables: this.config.systemVariables || {},
      tools: {
        authentication: {
          enabled: true,
          type: 'bearer',
          content: `Bearer ${authToken}`
        }
      }
    };

    // 添加标记防止重复初始化
    (window as any).difyInitialized = true;
    this.isInitialized = true;

    // 加载Dify SDK
    const difyScript = document.createElement('script');
    difyScript.src = `${this.config.baseUrl}/embed.min.js`;
    difyScript.id = this.scriptId;
    difyScript.defer = true;

    // 监听脚本加载完成
    difyScript.onload = () => {
      this.removePreHideStyle();
      this.addCustomStyles();
      this.ensureDifyVisible();
    };

    // 脚本加载错误处理
    difyScript.onerror = () => {
      console.error('Failed to load Dify chatbot script');
      (window as any).difyInitialized = false;
      this.isInitialized = false;
      this.removeDifyElements();
    };

    document.head.appendChild(difyScript);
  }

  // 更新配置
  updateConfig(newConfig: Partial<DifyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 更新认证令牌
  updateAuthToken(token: string): void {
    if (this.config.tools?.authentication) {
      this.config.tools.authentication.content = `Bearer ${token}`;
    }

    // 如果当前已初始化，重新初始化以应用新令牌
    if (this.isDifyInitialized()) {
      this.removeDifyElements();
      this.initDifyChat(token);
    }
  }
}
