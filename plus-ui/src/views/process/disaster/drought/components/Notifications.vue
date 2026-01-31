<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>通知设置</span>
    </div>

    <el-form label-width="120px" class="settings-form">
      <el-form-item label="发送邮件通知">
        <el-switch v-model="settings.emailNotification" />
      </el-form-item>

      <!-- 邮箱表格和添加 -->
      <el-form-item label="通知邮箱列表">
        <el-table :data="emailPageData" border size="small" style="width: 100%; margin-bottom: 10px" :row-key="(row) => row">
          <el-table-column prop="email" label="邮箱地址" />
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button type="text" size="small" @click="removeEmail(emailPageStart + $index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          layout="prev, pager, next"
          :page-size="pageSize"
          :current-page="emailCurrentPage"
          :total="settings.emails.length"
          @current-change="handleEmailPageChange"
          style="margin-bottom: 10px"
        />
        <el-input
          v-model="newEmail"
          size="small"
          placeholder="添加邮箱，按回车确认"
          @keyup.enter.native.prevent="addEmail"
          style="width: 250px"
          clearable
        />
      </el-form-item>

      <el-form-item label="发送短信通知">
        <el-switch v-model="settings.smsNotification" />
      </el-form-item>

      <!-- 手机号表格和添加 -->
      <el-form-item label="通知手机号列表">
        <el-table :data="phonePageData" border size="small" style="width: 100%; margin-bottom: 10px" :row-key="(row) => row">
          <el-table-column prop="phone" label="手机号" />
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button type="text" size="small" @click="removePhone(phonePageStart + $index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          layout="prev, pager, next"
          :page-size="pageSize"
          :current-page="phoneCurrentPage"
          :total="settings.phones.length"
          @current-change="handlePhonePageChange"
          style="margin-bottom: 10px"
        />
        <el-input
          v-model="newPhone"
          size="small"
          placeholder="添加手机号，按回车确认"
          @keyup.enter.native.prevent="addPhone"
          style="width: 250px"
          clearable
        />
      </el-form-item>

      <el-form-item label="通知频率">
        <el-radio-group v-model="settings.frequency">
          <el-radio label="即时">即时</el-radio>
          <el-radio label="每日">每日</el-radio>
          <el-radio label="每周">每周</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="预警信息内容">
        <el-input type="textarea" rows="4" v-model="settings.alertMessage" placeholder="请输入预警信息内容" maxlength="500" show-word-limit />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置并发送测试消息</el-button>
        <el-button @click="resetSettings">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';

const pageSize = 4;

const settings = reactive({
  emailNotification: true,
  smsNotification: false,
  frequency: '每日',
  emails: [
    'example1@test.com',
    'example2@test.com',
    'example3@test.com',
    'example4@test.com',
    'example5@test.com',
    'example6@test.com',
    'example7@test.com'
  ],
  phones: ['13800000000', '13900000000', '13700000000', '13600000000', '13500000000', '13400000000', '13300000000'],
  alertMessage: '请注意，侯家沟001号发生特旱，请及时处理。'
});

const newEmail = ref('');
const newPhone = ref('');

// 分页状态
const emailCurrentPage = ref(1);
const phoneCurrentPage = ref(1);

const emailPageStart = computed(() => (emailCurrentPage.value - 1) * pageSize);
const phonePageStart = computed(() => (phoneCurrentPage.value - 1) * pageSize);

const emailPageData = computed(() => settings.emails.slice(emailPageStart.value, emailPageStart.value + pageSize).map((email) => ({ email })));

const phonePageData = computed(() => settings.phones.slice(phonePageStart.value, phonePageStart.value + pageSize).map((phone) => ({ phone })));

function addEmail() {
  const email = newEmail.value.trim();
  if (!email) return;
  if (!validateEmail(email)) {
    alert('请输入有效的邮箱地址');
    return;
  }
  if (settings.emails.includes(email)) {
    alert('该邮箱已存在');
    return;
  }
  settings.emails.push(email);
  newEmail.value = '';
  emailCurrentPage.value = Math.ceil(settings.emails.length / pageSize);
}

function removeEmail(index) {
  settings.emails.splice(index, 1);
  if (emailCurrentPage.value > Math.ceil(settings.emails.length / pageSize)) {
    emailCurrentPage.value = Math.max(1, emailCurrentPage.value - 1);
  }
}

function addPhone() {
  const phone = newPhone.value.trim();
  if (!phone) return;
  if (!validatePhone(phone)) {
    alert('请输入有效的手机号码');
    return;
  }
  if (settings.phones.includes(phone)) {
    alert('该手机号已存在');
    return;
  }
  settings.phones.push(phone);
  newPhone.value = '';
  phoneCurrentPage.value = Math.ceil(settings.phones.length / pageSize);
}

function removePhone(index) {
  settings.phones.splice(index, 1);
  if (phoneCurrentPage.value > Math.ceil(settings.phones.length / pageSize)) {
    phoneCurrentPage.value = Math.max(1, phoneCurrentPage.value - 1);
  }
}

function handleEmailPageChange(page) {
  emailCurrentPage.value = page;
}

function handlePhonePageChange(page) {
  phoneCurrentPage.value = page;
}

function saveSettings() {
  if (settings.emailNotification && settings.emails.length === 0) {
    alert('请至少添加一个通知邮箱');
    return;
  }
  if (settings.smsNotification && settings.phones.length === 0) {
    alert('请至少添加一个通知手机号');
    return;
  }
  if (!settings.alertMessage.trim()) {
    alert('预警信息内容不能为空');
    return;
  }

  let msg = `预警信息内容：\n${settings.alertMessage}\n\n`;

  if (settings.emailNotification) {
    msg += `邮件将发送至：${settings.emails.join('，')}\n`;
  }
  if (settings.smsNotification) {
    msg += `短信将发送至：${settings.phones.join('，')}\n`;
  }
  msg += `通知频率：${settings.frequency}`;

  alert(msg);
}

function resetSettings() {
  settings.emailNotification = true;
  settings.smsNotification = false;
  settings.frequency = '每日';
  settings.emails = [];
  settings.phones = [];
  settings.alertMessage = '这里是预警信息内容，默认示例。';
  newEmail.value = '';
  newPhone.value = '';
  emailCurrentPage.value = 1;
  phoneCurrentPage.value = 1;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^\d{11,15}$/;
  return re.test(phone);
}
</script>

<style scoped>
.box-card {
  margin: 20px;
}
.settings-form {
  max-width: 700px;
}
</style>
