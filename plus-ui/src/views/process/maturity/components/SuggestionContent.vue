<template>
  <div class="suggestion-content">
    <p v-for="(paragraph, index) in formattedParagraphs" :key="index" class="suggestion-paragraph">
      {{ paragraph }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface SuggestionContentProps {
  content: string;
}

const props = defineProps<SuggestionContentProps>();

const formattedParagraphs = computed(() => {
  let text = props.content;

  // 🔥 先把 <br> 替换成特殊标记（防止被句号按段落拆散）
  text = text.replace(/<br\s*\/?>/gi, '[[BR]]');

  // 原有的按句号、问号、感叹号拆句逻辑
  const sentences = text.split(/([。！？])/).filter((s) => s.length > 0);

  const fullSentences: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    if (i + 1 < sentences.length) {
      fullSentences.push(sentences[i] + sentences[i + 1]);
    } else {
      fullSentences.push(sentences[i]);
    }
  }

  // 合并 [[BR]] 标记（用户手动换行）
  const merged: string[] = [];
  fullSentences.forEach((sen) => {
    if (sen.includes('[[BR]]')) {
      merged.push(...sen.split('[[BR]]').filter((s) => s.trim() !== ''));
    } else {
      merged.push(sen);
    }
  });

  // 如果句子不到 2 句，不进行段落拆分
  if (merged.length <= 2) return merged;

  // 前两句作为第一段
  const firstParagraph = merged[0] + merged[1];

  // 后面每句一段，最多两段
  const otherParagraphs = merged.slice(2, 4);

  return [firstParagraph, ...otherParagraphs];
});
</script>

<style scoped>
.suggestion-content {
  line-height: 1.6;
  padding: 8px 10px;
  font-size: 15px;
  color: #000;
}

.suggestion-paragraph {
  margin: 0;
  text-indent: 2em;
}

.suggestion-paragraph:not(:first-child) {
  margin-top: 1px;
}
</style>
