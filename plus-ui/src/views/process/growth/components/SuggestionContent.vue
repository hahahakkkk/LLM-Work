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
  // 将文本按句子分割（以句号、感叹号、问号为分隔符，但保留分隔符）
  const sentences = props.content.split(/([。！？])/).filter((s) => s.length > 0);

  // 重新组合句子和标点符号
  const fullSentences = [];
  for (let i = 0; i < sentences.length; i += 2) {
    if (i + 1 < sentences.length) {
      fullSentences.push(sentences[i] + sentences[i + 1]);
    } else {
      fullSentences.push(sentences[i]);
    }
  }

  // 过滤掉空句子
  const filteredSentences = fullSentences.filter((s) => s.trim().length > 0);

  // 如果句子少于等于2句，直接返回
  if (filteredSentences.length <= 2) {
    return [props.content];
  }

  // 前两句作为第一段
  const firstParagraph = filteredSentences[0] + filteredSentences[1];

  // 后续每句作为独立段落，最多再显示两段（总共最多三段）
  const otherParagraphs = filteredSentences.slice(2, 4);

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
