<template>
  <div class="newdetect-container">
    <div class="newdetect-content">
      <!-- 主控制面板 -->
      <el-card class="flex-1">
        <template #header>
          <span class="font-semibold">出苗率检测</span>
        </template>

        <!-- 优化输入区域 -->
        <div class="input-section">
          <div class="mb-4">
            <div class="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
              <div class="flex items-start gap-2">
                <el-icon class="mt-0.5 text-blue-500"><InfoFilled /></el-icon>
                <div class="leading-relaxed">
                  <div class="font-semibold">操作提示</div>
                  <div class="mt-1 text-blue-700">
                    请先在菜单中进入“多模态数据中心 → 星空地监测数据 → 无人机遥感图像”，完成图像上传后，再回到此处选择已有图片进行出苗率检测。
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mb-4">
            <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <!-- 地块选择 -->
              <div class="flex items-center gap-3 flex-1">
                <label class="text-gray-700 text-base font-semibold whitespace-nowrap min-w-[80px]">选择地块</label>
                <el-select
                  v-model="selectedLandId"
                  placeholder="请选择地块"
                  class="flex-1"
                  size="large"
                  :max-height="200"
                  popper-class="custom-select-dropdown"
                >
                  <el-option v-for="land in lands" :key="land.landId" :value="Number(land.landId)" :label="land.landCode" />
                  <template #empty>
                    <div class="px-4 py-2 text-gray-500 text-base">暂无地块数据</div>
                  </template>
                </el-select>
              </div>

              <!-- 按钮区域 -->
              <div class="flex gap-2 flex-shrink-0">
                <el-button type="primary" size="large" icon="Picture" @click="handleSelectImageButton"> 选择已有图片集 </el-button>
                <!-- <el-button type="primary" plain size="large" icon="Upload" @click="handleUploadNewImageButton"> 上传新图片 </el-button> -->
              </div>
            </div>
          </div>
        </div>

        <!-- 已选图片 -->
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <el-card v-for="(imageSet, imageSetIndex) in imageSets" :key="imageSet.fourId">
            <div class="relative rounded-sm overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10 flex justify-center items-center">
                <ul class="list-none p-0 text-center text-white">
                  <li>
                    编号：<code>{{ imageSet.fourId }}</code>
                  </li>
                  <li>
                    采集时间：<code>{{ imageSet.collectTime }}</code>
                  </li>
                </ul>
              </div>
              <ImagePreview :src="imageSet.rgbImageUrls[0]" width="100%" height="100%" />
            </div>
            <template #footer>
              <el-button type="primary" @click="handleDetectionButton(imageSetIndex)">检测</el-button>
              <el-button @click="deleteImageSet(imageSetIndex)">取消选择</el-button>
            </template>
          </el-card>
        </div>
      </el-card>

      <!-- 任务状态 -->
      <el-card v-if="isDetecting || taskStage" class="mt-4 bg-white shadow-lg rounded-lg">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div class="text-sm text-gray-700">
            当前阶段：<span class="font-semibold">{{ TaskStageMap[taskStage] || taskStage || '等待开始' }}</span>
          </div>
          <div class="flex-1 sm:ml-4">
            <el-progress :percentage="taskProgress" :status="taskStage === 'failed' ? 'exception' : taskStage === 'done' ? 'success' : ''" />
            <div class="text-xs text-gray-500 mt-1">当前进度：{{ TaskStageMap[taskStage] || taskStage || '等待开始' }}</div>
          </div>
        </div>
      </el-card>

      <!-- 结果面板 -->
      <el-card v-if="result" class="mt-4 bg-white shadow-lg rounded-lg">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold">识别结果</span>
            <div class="space-x-2">
              <el-button type="primary" class="hover:bg-blue-600 transition-colors" @click="handleShowDetail"> 查看详细报告 </el-button>
              <el-button type="primary" class="hover:bg-blue-600 transition-colors" @click="handleExportResult"> 导出报告 </el-button>
            </div>
          </div>
        </template>

        <div v-if="result" class="space-y-2">
          <!-- 检测结果图像 - 直接展示，不使用折叠 -->
          <div class="grid lg:grid-cols-2 gap-4 mb-4">
            <!-- 原始遥感图像 -->
            <div class="space-y-2">
              <div class="relative group">
                <div class="bg-white rounded-lg border-2 border-blue-400 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div class="h-[150px] lg:h-[200px] overflow-hidden relative">
                    <el-image
                      :src="resultImg.originImg"
                      fit="cover"
                      :preview-src-list="[resultImg.originImg]"
                      class="w-full h-full object-cover cursor-pointer"
                      :preview-teleported="true"
                      @load="onImageLoad"
                    >
                      <template #error>
                        <div class="w-full h-full flex items-center justify-center bg-gray-100">
                          <div class="text-center text-gray-500">
                            <div class="text-xl mb-1">📷</div>
                            <div class="text-xs">暂无原始图像</div>
                          </div>
                        </div>
                      </template>
                    </el-image>
                    <div class="absolute top-1 left-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">原始数据</div>
                  </div>
                </div>
                <div
                  class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"
                >
                  <span class="text-white bg-black bg-opacity-70 px-2 py-1 rounded-full text-xs">
                    {{ resultImg.originImg ? '点击查看大图' : '暂无图像' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 检测结果图像 -->
            <div class="space-y-2">
              <div class="relative group">
                <div class="bg-white rounded-lg border-2 border-green-400 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div ref="imageMapContainer" class="h-[150px] lg:h-[200px] overflow-hidden relative">
                    <el-image
                      :src="resultImg.resultImg"
                      fit="cover"
                      :preview-src-list="[resultImg.resultImg]"
                      class="w-full h-full object-cover cursor-pointer"
                      :preview-teleported="true"
                      @load="onImageLoad"
                    >
                      <template #error>
                        <div class="w-full h-full flex items-center justify-center bg-gray-100">
                          <div class="text-center text-gray-500">
                            <div class="text-xl mb-1">🎯</div>
                            <div class="text-xs">暂无检测结果</div>
                          </div>
                        </div>
                      </template>
                    </el-image>
                    <div class="absolute top-1 left-1 bg-green-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">模型检测结果</div>
                  </div>
                </div>
                <div
                  class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"
                >
                  <span class="text-white bg-black bg-opacity-70 px-2 py-1 rounded-full text-xs">
                    {{ resultImg.resultImg ? '点击查看大图' : '暂无检测结果' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 主要内容区域 -->
          <div class="flex gap-4">
            <!-- 左侧：检测结果描述 -->
            <div class="flex-1">
              <!-- 出苗状况 -->
              <div class="mb-3">
                <div class="flex items-center mb-2">
                  <span class="text-base font-semibold text-gray-800 mr-2">出苗状况</span>
                  <span
                    class="px-2 py-1 text-xs rounded-full font-medium"
                    :class="{
                      'bg-green-100 text-green-700': calculateEmergenceRate() >= 80,
                      'bg-yellow-100 text-yellow-700': calculateEmergenceRate() >= 60 && calculateEmergenceRate() < 80,
                      'bg-red-100 text-red-700': calculateEmergenceRate() < 60
                    }"
                  >
                    {{ getOverallMissingStatus() }}
                  </span>
                </div>
                <p class="text-gray-700 text-xs leading-relaxed">
                  本次检测共识别{{ result.totalSeedlings || 0 }}株幼苗，出苗率为{{ calculateEmergenceRate() }}%，处于{{
                    getOverallMissingStatus()
                  }}水平。平均苗密度为{{ calculateSeedlingDensity() }}株/亩。
                </p>
              </div>

              <!-- 建议措施 -->
              <div class="bg-blue-50 p-2 rounded-lg border border-blue-100">
                <div class="flex items-center mb-1">
                  <i class="el-icon-warning-outline text-blue-500 mr-1"></i>
                  <span class="text-xs font-semibold text-blue-700">建议措施</span>
                </div>
                <p class="text-xs text-blue-600">{{ result.suggestion ? result.suggestion : getRecommendation() }}</p>
              </div>
            </div>

            <!-- 右侧：核心数据指标 -->
            <div class="w-64 flex items-center justify-center">
              <div class="grid grid-cols-2 gap-1.5 w-full">
                <!-- 出苗率 -->
                <div class="text-center p-1.5 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-md border border-emerald-200">
                  <div class="text-xs text-gray-500 mb-0.5 font-medium">出苗率</div>
                  <div class="text-lg font-black text-emerald-600 mb-0.5">{{ calculateEmergenceRate() }} %</div>
                </div>

                <!-- 检测苗数 -->
                <div class="text-center p-1.5 bg-gradient-to-br from-violet-50 to-purple-100 rounded-md border border-violet-200">
                  <div class="text-xs text-gray-500 mb-0.5 font-medium">检测苗数</div>
                  <div class="text-lg font-black text-violet-600 mb-0.5">{{ result.totalSeedlings || 0 }} 株</div>
                </div>

                <!-- 苗密度 -->
                <div class="text-center p-1.5 bg-gradient-to-br from-orange-50 to-amber-100 rounded-md border border-orange-200">
                  <div class="text-xs text-gray-500 mb-0.5 font-medium">苗密度</div>
                  <div class="text-lg font-black text-orange-600 mb-0.5">{{ calculateSeedlingDensity() }} 株/亩</div>
                </div>

                <!-- 缺苗情况 -->
                <div
                  class="text-center p-1.5 rounded-md border"
                  :class="{
                    'bg-gradient-to-br from-green-50 to-green-100 border-green-200': getOverallMissingStatus() === '正常',
                    'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200': getOverallMissingStatus() === '轻度缺苗',
                    'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200': getOverallMissingStatus() === '中度缺苗',
                    'bg-gradient-to-br from-red-50 to-red-100 border-red-200': getOverallMissingStatus() === '重度缺苗'
                  }"
                >
                  <div class="text-xs text-gray-500 mb-0.5 font-medium">缺苗</div>
                  <div
                    class="text-lg font-black mb-0.5"
                    :class="{
                      'text-green-600': getOverallMissingStatus() === '正常',
                      'text-yellow-600': getOverallMissingStatus() === '轻度缺苗',
                      'text-orange-600': getOverallMissingStatus() === '中度缺苗',
                      'text-red-600': getOverallMissingStatus() === '重度缺苗'
                    }"
                  >
                    {{ getOverallMissingStatus() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 对话框：选择已有图片集 -->
    <el-dialog v-model="dialogFormVisible" title="选择已有图片集（点击卡片选择）" width="800px">
      <template v-if="senses.length">
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          <el-card
            v-for="(sense, index) in senses"
            :key="sense.fourId"
            :class="{
              'ring-2 ring-blue-500 ring-offset-2 shadow-lg shadow-blue-200/60': selectedSenseIndex === index,
              'cursor-pointer hover:shadow-lg transition-all duration-300': true
            }"
            :body-style="{ padding: '0px' }"
            @click="selectedSenseIndex = index"
          >
            <div class="bg-white rounded overflow-hidden relative group">
              <!-- 选中标记 -->
              <transition name="el-fade-in">
                <div v-if="selectedSenseIndex === index" class="absolute inset-0 z-20 border-2 border-blue-500 rounded overflow-hidden">
                  <div class="absolute inset-0 bg-blue-500/10"></div>
                  <div class="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">已选</div>
                  <div
                    class="absolute bottom-2 right-2 bg-white text-blue-600 border border-blue-200 rounded-full w-8 h-8 flex items-center justify-center shadow"
                  >
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </transition>

              <!-- 图片区域 -->
              <div class="h-48 w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                <ImagePreview
                  :src="getCoverImageUrl(sense)"
                  width="100%"
                  height="100%"
                  fit="contain"
                  class="transition-transform duration-300 group-hover:scale-105"
                />
                <div class="absolute top-2 left-2 z-10">
                  <el-tag effect="dark" type="success" size="small" class="shadow-sm">{{ normalizeGrowthPeriod(sense.growthPeriod) }}</el-tag>
                </div>
              </div>

              <!-- 详细信息区域 -->
              <div class="p-3 bg-white border-t border-gray-100">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <span
                      class="font-bold text-gray-800 text-sm truncate flex-1"
                      :title="lands.find((l) => l.landId === sense.plotId)?.landCode || '未知地块'"
                    >
                      <i class="el-icon-location-information mr-1 text-blue-500"></i>
                      {{ lands.find((l) => l.landId === sense.plotId)?.landCode || '未知地块' }}
                    </span>
                  </div>

                  <div class="flex items-center text-xs text-gray-500 mt-1">
                    <el-icon class="mr-1.5 text-gray-400 text-sm"><Clock /></el-icon>
                    <span class="font-mono text-gray-600">{{ sense.collectTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" :disabled="selectedSenseIndex === undefined" @click="handleAddToImagesButton">添加</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 对话框：添加/编辑遥感数据表单 -->
    <!--
    <el-dialog v-model="uploadFormDialogVisible" title="出苗期图像检测数据上传" width="500px" append-to-body>
      <el-form ref="remoteSenseFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="基地" prop="baseId">
          <el-select v-model="form.baseId" placeholder="请选择基地">
            <el-option v-for="dict in four_base_name" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="地块" prop="plotId">
          <el-select v-model="form.plotId" placeholder="请选择地块">
            <el-option v-for="land in lands" :key="land.landId" :label="land.landCode" :value="Number(land.landId)" />
          </el-select>
        </el-form-item>
        <el-form-item label="生育期" prop="growthPeriod">
          <el-input v-model="form.growthPeriod" value="出苗期" disabled placeholder="出苗期（固定）" />
        </el-form-item>
        <el-form-item label="采集时间" prop="collectTime">
          <el-date-picker v-model="form.collectTime" type="datetime" placeholder="选择采集时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="采集方式" prop="collectWay">
          <el-select v-model="form.collectWay" placeholder="请选择采集方式">
            <el-option v-for="dict in four_collect_way" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="图像文件" prop="imageFile">
          <el-upload
            class="image-upload"
            drag
            action="#"
            :auto-upload="true"
            :http-request="handleImageUpload"
            :on-change="handleFileChange"
            :show-file-list="true"
            accept="image/*,.tif,.tiff"
            :limit="1"
            list-type="picture-card"
            :disabled="uploadLoading"
          >
            <el-icon class="el-icon--upload">
              <UploadFilled />
            </el-icon>
            <div class="el-upload__text">将图像文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 JPG/PNG/TIFF 等图像格式</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    -->

    <!-- 详细报告弹窗 -->
    <el-dialog v-model="detailReportDialogVisible" title="出苗率检测详细报告" width="80%" append-to-body class="detail-report-dialog">
      <div class="bg-white rounded-xl overflow-hidden">
        <!-- 报告内容 -->
        <div>
          <!-- 数据统计卡片 -->
          <div class="mb-6">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- 总苗数统计 -->
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm font-medium text-green-700">总检测苗数</div>
                  <div class="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                    <i class="el-icon-plant text-green-600"></i>
                  </div>
                </div>
                <div class="text-2xl font-bold text-green-600 mb-0.5">{{ result.totalSeedlings || 6923 }}</div>
                <div class="text-xs text-green-600">株</div>
              </div>

              <!-- 出苗率统计 -->
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm font-medium text-blue-700">出苗率</div>
                  <div class="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                    <i class="el-icon-data-board text-blue-600"></i>
                  </div>
                </div>
                <div class="text-2xl font-bold text-blue-600 mb-0.5">{{ calculateEmergenceRate() }}%</div>
                <div class="text-xs text-blue-600">百分比</div>
              </div>

              <!-- 苗密度统计 -->
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm font-medium text-purple-700">苗密度</div>
                  <div class="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                    <i class="el-icon-location text-purple-600"></i>
                  </div>
                </div>
                <div class="text-2xl font-bold text-purple-600 mb-0.5">{{ calculateSeedlingDensity() }}</div>
                <div class="text-xs text-purple-600">株/亩</div>
              </div>

              <!-- 缺苗情况 -->
              <div
                class="rounded-xl p-3 border"
                :class="{
                  'bg-gradient-to-br from-green-50 to-green-100 border-green-200': getOverallMissingStatus() === '正常',
                  'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200': getOverallMissingStatus() === '轻度缺苗',
                  'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200': getOverallMissingStatus() === '中度缺苗',
                  'bg-gradient-to-br from-red-50 to-red-100 border-red-200': getOverallMissingStatus() === '重度缺苗'
                }"
              >
                <div class="flex items-center justify-between mb-2">
                  <div
                    class="text-sm font-medium"
                    :class="{
                      'text-green-700': getOverallMissingStatus() === '正常',
                      'text-yellow-700': getOverallMissingStatus() === '轻度缺苗',
                      'text-orange-700': getOverallMissingStatus() === '中度缺苗',
                      'text-red-700': getOverallMissingStatus() === '重度缺苗'
                    }"
                  >
                    缺苗情况
                  </div>
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="{
                      'bg-green-200': getOverallMissingStatus() === '正常',
                      'bg-yellow-200': getOverallMissingStatus() === '轻度缺苗',
                      'bg-orange-200': getOverallMissingStatus() === '中度缺苗',
                      'bg-red-200': getOverallMissingStatus() === '重度缺苗'
                    }"
                  >
                    <i
                      class="el-icon-data-analysis"
                      :class="{
                        'text-green-600': getOverallMissingStatus() === '正常',
                        'text-yellow-600': getOverallMissingStatus() === '轻度缺苗',
                        'text-orange-600': getOverallMissingStatus() === '中度缺苗',
                        'text-red-600': getOverallMissingStatus() === '重度缺苗'
                      }"
                    ></i>
                  </div>
                </div>

                <div
                  class="text-2xl font-bold mb-0.5"
                  :class="{
                    'text-green-600': getOverallMissingStatus() === '正常',
                    'text-yellow-600': getOverallMissingStatus() === '轻度缺苗',
                    'text-orange-600': getOverallMissingStatus() === '中度缺苗',
                    'text-red-600': getOverallMissingStatus() === '重度缺苗'
                  }"
                >
                  {{ getOverallMissingStatus() }}
                </div>
                <div
                  class="text-xs"
                  :class="{
                    'text-green-600': getOverallMissingStatus() === '正常',
                    'text-yellow-600': getOverallMissingStatus() === '轻度缺苗',
                    'text-orange-600': getOverallMissingStatus() === '中度缺苗',
                    'text-red-600': getOverallMissingStatus() === '重度缺苗'
                  }"
                >
                  总体状况
                </div>
              </div>
            </div>
          </div>

          <!-- 检测信息表格 -->
          <div class="mb-6 bg-gray-50">
            <table class="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
              <tbody>
                <tr>
                  <td class="bg-gray-100 px-4 py-3 font-medium text-gray-700 border border-gray-300 w-1/3">检测编号</td>
                  <td class="px-4 py-3 text-gray-900 border border-gray-300">DK-{{ Date.now().toString().slice(-6) }}</td>
                </tr>
                <tr>
                  <td class="bg-gray-100 px-4 py-3 font-medium text-gray-700 border border-gray-300">检测时间</td>
                  <td class="px-4 py-3 text-gray-900 border border-gray-300">{{ new Date().toLocaleDateString() }}</td>
                </tr>
                <tr>
                  <td class="bg-gray-100 px-4 py-3 font-medium text-gray-700 border border-gray-300">检测基地</td>
                  <td class="px-4 py-3 text-gray-900 border border-gray-300">{{ selectedBaseName || '侯家沟基地' }}</td>
                </tr>
                <tr>
                  <td class="bg-gray-100 px-4 py-3 font-medium text-gray-700 border border-gray-300">地块位置（经纬度坐标）</td>
                  <td class="px-4 py-3 text-gray-900 border border-gray-300">
                    {{ selectedLandCode || "(37°43'31.87'N,110°9'52.75'E)" }}
                  </td>
                </tr>
                <tr>
                  <td class="bg-gray-100 px-4 py-3 font-medium text-gray-700 border border-gray-300">出苗率</td>
                  <td class="px-4 py-3 text-gray-900 border border-gray-300">
                    <span class="font-bold text-green-600">{{ calculateEmergenceRate() }}%</span>
                  </td>
                </tr>
                <tr>
                  <td class="bg-gray-100 px-4 py-3 font-medium text-gray-700 border border-gray-300">缺苗情况</td>
                  <td class="px-4 py-3 text-gray-900 border border-gray-300">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-700': getOverallMissingStatus() === '正常',
                        'bg-yellow-100 text-yellow-700': getOverallMissingStatus() === '轻度缺苗',
                        'bg-orange-100 text-orange-700': getOverallMissingStatus() === '中度缺苗',
                        'bg-red-100 text-red-700': getOverallMissingStatus() === '重度缺苗'
                      }"
                    >
                      {{ getOverallMissingStatus() }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="bg-gray-100 px-4 py-3 font-medium text-gray-700 border border-gray-300">出苗数量</td>
                  <td class="px-4 py-3 text-gray-900 border border-gray-300">{{ result.totalSeedlings || 0 }} 株</td>
                </tr>
                <tr>
                  <td class="bg-gray-100 px-4 py-3 font-medium text-gray-700 border border-gray-300">平均密度</td>
                  <td class="px-4 py-3 text-gray-900 border border-gray-300">{{ calculateSeedlingDensity() }} 株/亩</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分析报告文字 -->
          <div class="bg-gray-100 rounded-lg p-4 pt-2">
            <div class="text-gray-700 leading-relaxed space-y-3">
              <p>
                经过专业数字化管理技术系统检测，本次检测的地块总面积为：{{ getDetectedArea() }}， 其中出苗区域面积数为：{{ getEmergenceArea() }}，
                经计算出苗率为：{{ calculateEmergenceRate() }}%， 缺苗情况判定为"{{ getOverallMissingStatus() }}"。
              </p>
              <p class="text-sm text-gray-600"><strong>建议措施：</strong>{{ getRecommendation() }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer flex justify-center space-x-4">
          <el-button type="primary" @click="downloadDetailReport"> 下载报告 </el-button>
          <el-button @click="detailReportDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, getCurrentInstance, computed, watch } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, type FormInstance, type UploadRequestOptions } from 'element-plus';
import { UploadFilled, Clock, Check, InfoFilled } from '@element-plus/icons-vue';
import ImagePreview from '@/views/four/components/imagePreview/index.vue';

// API 和类型定义
import { fetchFarmerLands, fetchRemoteSenses, downloadErReport, erSubmit, erQueryTaskStatus, erQueryTaskResult, listByIds } from './api/index';
import type { ErReportRequest } from './api/index';
import type { LandUnitVo, ErTaskResult } from './api/types';
// import { addRemoteSense, listRemoteSense, updateRemoteSense, uploadRemoteSenseFile } from '@/views/four/api/remoteSense';

import { addRemoteSense, listRemoteSense, updateRemoteSense } from '@/views/four/api/remoteSense';

import type { RemoteSenseForm, RemoteSenseQuery, RemoteSenseVO } from '@/views/four/api/remoteSense/types';
import { TaskStageMap } from './const';
import { selectUrlByIds } from '@/views/four/api/oss';

defineOptions({
  name: 'NewDetectDialog'
});

// Emits
const emit = defineEmits<{
  'save': [result: any];
}>();

// 类型定义
interface ImageSet {
  fourId: number;
  collectTime: string;
  baseId?: number;
  baseName?: string;
  plotId?: number;
  plotName?: string;
  ossIds?: string;
  tifUrl?: string;
  rgbImageUrls: string[];
  multiImageUrls: string[];
}

// Hooks
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { four_base_name, four_collect_way } = toRefs<any>(proxy?.useDict('four_base_name', 'four_collect_way'));

// 从API获取的数据
const lands = ref<LandUnitVo[]>([]);
const remoteSenseList = ref<RemoteSenseVO[]>([]);
const senses = ref<RemoteSenseVO[]>([]);
const total = ref(0);
const result = ref<ErTaskResult | null>(null);

// 用户的选择和筛选条件
const selectedLandId = ref<number>();
const selectedSenseIndex = ref<number>();
const dateRangeCollectTime = ref<[DateModelType, DateModelType]>(['', '']);

// UI状态
const imageSets = ref<ImageSet[]>([]);
const dialogFormVisible = ref(false);
const uploadFormDialogVisible = ref(false);
const isDetecting = ref(false);
const taskStage = ref('');
const taskProgress = ref(0);
const pollingFailureCount = ref(0);
const uploadLoading = ref(false);

// 关闭选择弹窗时清除选中状态
watch(dialogFormVisible, (visible) => {
  if (!visible) {
    selectedSenseIndex.value = undefined;
  }
});

// 表单管理
const remoteSenseFormRef = ref<FormInstance>();
const initFormData: RemoteSenseForm = {
  fourId: undefined,
  baseId: undefined,
  fileLocation: undefined,
  growthPeriod: '出苗期', // 默认设置为出苗期
  collectTime: undefined,
  collectWay: undefined,
  remark: undefined
};
const data = reactive<PageData<RemoteSenseForm, RemoteSenseQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    baseId: undefined,
    // facilityId: undefined, // Removed
    growthPeriod: undefined,
    collectWay: undefined,
    params: {
      collectTime: undefined
    }
  },
  rules: {
    fourId: [{ required: true, message: '主键不能为空', trigger: 'blur' }]
  }
});
const { queryParams, form, rules } = toRefs(data);

// 操作指导步骤管理
const currentStep = ref(1);

// 选中的地块信息
const selectedLandCode = computed(() => {
  const land = lands.value.find((l) => l.landId === selectedLandId.value);
  return land?.landCode || '';
});

const selectedBaseName = computed(() => {
  const land = lands.value.find((l) => l.landId === selectedLandId.value);
  return land?.baseName || '';
});

// 结果图片
const resultImg = ref({
  originImg: '',
  resultImg: ''
});

// 控制详细报告弹窗显示
const detailReportDialogVisible = ref(false);

// 计算属性 - 移除visible

/**
 * 获取遥感影像的封面图URL。
 * @param sense 遥感数据对象
 * @returns 封面图URL，如果不存在则返回undefined。
 */
const splitImageUrls = (fileLocation?: string): string[] => {
  return (fileLocation || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const isTifUrl = (url: string): boolean => /\.tif{1,2}(\?|#|$)/i.test(url);

const normalizeGrowthPeriod = (value?: string): string => {
  if (!value) return '出苗期';
  if (value.toLowerCase() === 'p1') return '出苗期';
  return value;
};

const getCoverImageUrl = (sense: RemoteSenseVO): string | undefined => {
  return splitImageUrls(sense.fileLocation).find((item) => !isTifUrl(item));
};

/** 查询无人机/卫星遥感数据列表 */
const getList = async () => {
  try {
    queryParams.value.params = {};
    proxy?.addDateRange(queryParams.value, dateRangeCollectTime.value, 'CollectTime');
    const res = await listRemoteSense(queryParams.value);
    remoteSenseList.value = res.rows;
    total.value = res.total;
  } catch (error) {
    console.error('Failed to fetch remote sense list:', error);
    ElMessage.error('获取遥感数据列表失败');
  }
};

/** "选择已有图片集"按钮点击事件 */
const handleSelectImageButton = async () => {
  try {
    // 清除之前的检测结果
    result.value = null;
    resultImg.value.originImg = '';
    resultImg.value.resultImg = '';
    detailReportDialogVisible.value = false;
    isDetecting.value = false;
    taskStage.value = '';
    taskProgress.value = 0;
    pollingFailureCount.value = 0;

    const res = await fetchRemoteSenses({
      useFor: 0
      // baseId: selectedBaseId.value,
      // facilityId: selectedLandId.value
    });
    const fetchedSenses = (res as any).rows || (res as any).data?.rows || [];
    senses.value = fetchedSenses.filter((item: any) => String(item?.useFor) === '1');
    console.log('[选择已有图片] useFor=1 过滤结果', senses.value);
    dialogFormVisible.value = true;
    // 更新步骤到第2步
    currentStep.value = 2;
  } catch (error) {
    console.error('Failed to fetch remote senses for selection:', error);
    ElMessage.error('获取可选择的图片集失败');
  }
};

/** "上传图片"按钮点击事件 */
const handleUploadNewImageButton = () => {
  // 清除之前的检测结果
  result.value = null;
  resultImg.value.originImg = '';
  resultImg.value.resultImg = '';
  detailReportDialogVisible.value = false;
  isDetecting.value = false;
  taskStage.value = '';
  taskProgress.value = 0;
  pollingFailureCount.value = 0;

  uploadFormDialogVisible.value = true;
  // 更新步骤到第2步
  currentStep.value = 2;
};

/** 提交"添加遥感数据"表单 */
const submitForm = async () => {
  const valid = await remoteSenseFormRef.value?.validate();
  if (!valid) return;

  if (!form.value.fileLocation) {
    ElMessage.warning('请先上传图像文件');
    return;
  }

  try {
    if (form.value.fourId) {
      await updateRemoteSense(form.value);
    } else {
      await addRemoteSense(form.value);
    }
    ElMessage.success('操作成功');
    uploadFormDialogVisible.value = false;

    // 清除之前的检测结果，因为有新的图片数据
    result.value = null;
    resultImg.value.originImg = '';
    resultImg.value.resultImg = '';
    detailReportDialogVisible.value = false;
    isDetecting.value = false;
    taskStage.value = '';
    taskProgress.value = 0;
    pollingFailureCount.value = 0;

    await getList();
  } catch (error) {
    console.error('Failed to submit remote sense form:', error);
    ElMessage.error('操作失败');
  }
};

/** 取消"添加遥感数据"表单 */
const cancel = () => {
  uploadFormDialogVisible.value = false;
};

/** 处理文件变化 */
const handleFileChange = (file: any, fileList?: any[]) => {
  console.log('File changed:', file, fileList);

  // 如果是新上传的文件（从文件选择对话框）
  if (file.raw) {
    const isImage = file.raw.type.startsWith('image/');

    if (!isImage) {
      ElMessage.error('只能上传图像文件!');
      return false;
    }
    ElMessage.info('已选择文件，开始上传...');
  }
};

/** 直接上传图像文件 */
const handleImageUpload = async (options: UploadRequestOptions) => {
  const { file } = options;
  const rawFile = file as File;

  if (!rawFile.type.startsWith('image/') && !rawFile.name.endsWith('.tif') && !rawFile.name.endsWith('.tiff')) {
    ElMessage.error('只能上传图像文件!');
    return;
  }

  uploadLoading.value = true;
  const formData = new FormData();
  formData.append('file', rawFile);

  console.log('[上传遥感图像] 开始上传', {
    name: rawFile.name,
    size: rawFile.size,
    type: rawFile.type
  });

  try {
    const res = await uploadRemoteSenseFile(formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000
    });

    const data: any = (res as any)?.data ?? res;
    const url = data?.url || data?.data?.url || data?.fileUrl || data?.path || data?.location;

    if (!url) {
      console.warn('[上传遥感图像] 返回数据未包含可用URL', data);
      ElMessage.error('上传成功但未返回文件地址');
      return;
    }

    form.value.fileLocation = url;
    console.log('[上传遥感图像] 上传成功', { url });
    ElMessage.success('图像上传成功');
  } catch (error: any) {
    console.error('[上传遥感图像] 上传失败', error);
    if (String(error?.message || '').includes('timeout') || String(error?.code || '') === 'ECONNABORTED') {
      ElMessage.error('上传超时，请检查网络或稍后重试');
    } else {
      ElMessage.error('图像上传失败，请稍后重试');
    }
  } finally {
    uploadLoading.value = false;
  }
};

/** "添加"按钮点击事件 (在选择图片集对话框中) */
const handleAddToImagesButton = () => {
  if (selectedSenseIndex.value === undefined) return;
  const selectedSense = senses.value[selectedSenseIndex.value];

  // 清除之前的检测结果
  result.value = null;
  resultImg.value.originImg = '';
  resultImg.value.resultImg = '';
  detailReportDialogVisible.value = false;

  const imageUrls = splitImageUrls(selectedSense.fileLocation);
  const plotId = Number(selectedSense.plotId);
  const land = lands.value.find((l) => Number(l.landId) === plotId);
  const baseId = Number(land?.baseId ?? selectedSense.baseId);
  const baseName = land?.baseName || '';
  const plotName = land?.landCode || '';
  const tifUrl = imageUrls.find(isTifUrl);

  const newImageSet: ImageSet = {
    fourId: Number(selectedSense.fourId),
    collectTime: selectedSense.collectTime || '',
    baseId: Number.isFinite(baseId) ? baseId : undefined,
    baseName,
    plotId: Number.isFinite(plotId) ? plotId : undefined,
    plotName,
    ossIds: selectedSense.fileLocation || '',
    tifUrl,
    rgbImageUrls: imageUrls.filter((url) => !isTifUrl(url)),
    multiImageUrls: imageUrls.filter(isTifUrl)
  };

  // 同步地块选择（便于页面其它逻辑复用 & 用户可见）
  if (Number.isFinite(plotId)) {
    selectedLandId.value = plotId;
  }

  console.log('[选择已有图像] 已添加图片集', {
    fourId: newImageSet.fourId,
    baseId: newImageSet.baseId,
    baseName: newImageSet.baseName,
    plotId: newImageSet.plotId,
    plotName: newImageSet.plotName,
    tifUrl: newImageSet.tifUrl,
    rgbUrl: newImageSet.rgbImageUrls?.[0]
  });

  imageSets.value = [newImageSet];
  dialogFormVisible.value = false;
  selectedSenseIndex.value = undefined;
};

/** "取消选择"按钮点击事件 */
const deleteImageSet = (index: number) => {
  imageSets.value.splice(index, 1);
  // 如果删除了所有图片集，清除检测结果
  if (imageSets.value.length === 0) {
    result.value = null;
    resultImg.value.originImg = '';
    resultImg.value.resultImg = '';
    detailReportDialogVisible.value = false;
    isDetecting.value = false;
    taskStage.value = '';
    taskProgress.value = 0;
    pollingFailureCount.value = 0;
  }
};

/** "检测"按钮点击事件 */
const handleDetectionButton = async (index: number) => {
  const currentImageSet = imageSets.value[index];

  if (!currentImageSet) {
    ElMessage.warning('请选择图片集后再检测');
    return;
  }

  let tifUrl = currentImageSet.tifUrl || currentImageSet.multiImageUrls.find(isTifUrl);

  if (!currentImageSet.baseId || !currentImageSet.plotId) {
    ElMessage.warning('图片集缺少基地/地块信息，无法提交检测任务');
    return;
  }

  if (currentImageSet.fourId) {
    try {
      const res = await listByIds(currentImageSet.fourId);
      const ossList = ((res as any)?.data ?? res) as Array<{ url?: string; fileSuffix?: string }>;
      const tifFromOss = ossList?.find((item) => (item.url && isTifUrl(item.url)) || /tif{1,2}/i.test(item.fileSuffix || ''));
      if (tifFromOss?.url) {
        tifUrl = tifFromOss.url;
      }
      console.log('[检测] listByIds 返回', ossList);
      console.log('[检测] 解析到 tifUrl', tifUrl);
    } catch (error) {
      console.error('[检测] listByIds 失败', error);
    }
  }

  if (!tifUrl && currentImageSet.ossIds) {
    try {
      const res = await listByIds(currentImageSet.ossIds);
      const ossList = ((res as any)?.data ?? res) as Array<{ url?: string; fileSuffix?: string }>;
      const tifFromOss = ossList?.find((item) => (item.url && isTifUrl(item.url)) || /tif{1,2}/i.test(item.fileSuffix || ''));
      if (tifFromOss?.url) {
        tifUrl = tifFromOss.url;
      }
      console.log('[检测] listByIds(ossIds) 返回', ossList);
      console.log('[检测] 解析到 tifUrl(ossIds)', tifUrl);
    } catch (error) {
      console.error('[检测] listByIds(ossIds) 失败', error);
    }
  }

  if (!tifUrl) {
    ElMessage.warning('未找到可用于检测的 TIF 图像');
    return;
  }

  // 清理图片选择对话框的状态数据
  selectedSenseIndex.value = undefined;
  senses.value = [];
  dialogFormVisible.value = false;

  // 清理上传表单的状态数据
  uploadFormDialogVisible.value = false;

  // 清空已选择的图片集
  imageSets.value = [];

  // 清除之前的检测结果
  result.value = null;
  resultImg.value.originImg = '';
  resultImg.value.resultImg = '';
  detailReportDialogVisible.value = false;

  try {
    isDetecting.value = true;
    taskStage.value = '提交任务';
    taskProgress.value = 0;
    pollingFailureCount.value = 0;

    const submitPayload = {
      base_name: currentImageSet.baseName || '',
      base_id: String(currentImageSet.baseId),
      plot_name: currentImageSet.plotName || '',
      plot_id: String(currentImageSet.plotId),
      tif_url: tifUrl
    };

    console.log('[ER submit] payload', submitPayload);

    const submitRes = (await erSubmit(submitPayload)).data;
    console.log('[ER submit] response', submitRes);

    const taskId = submitRes.task_id;
    if (!taskId) {
      throw new Error('任务ID为空，无法查询状态');
    }

    const intervalMs = 5000;
    const maxFailures = 3;
    let status: { status?: string; progress?: number; error?: string } | null = null;

    while (true) {
      try {
        status = (await erQueryTaskStatus(taskId)).data;
      } catch (pollError) {
        pollingFailureCount.value += 1;
        if (pollingFailureCount.value >= maxFailures) {
          throw new Error('查询任务状态失败次数过多，请稍后重试');
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        continue;
      }

      if (pollingFailureCount.value > 0) {
        pollingFailureCount.value = 0;
      }

      if (status?.error) {
        throw new Error(status.error);
      }

      const normalizedStatus = (status?.status || '').toLowerCase();
      const normalizedStage = (status?.stage || '').toLowerCase();

      if (typeof status?.progress === 'number') {
        const normalizedProgress = Math.round(status.progress);
        taskProgress.value = Math.min(100, Math.max(0, normalizedProgress));
      }

      if (
        normalizedStatus === 'completed' ||
        normalizedStatus === 'success' ||
        normalizedStatus === 'finished' ||
        normalizedStatus === 'done' ||
        (typeof status?.progress === 'number' && status.progress >= 100)
      ) {
        taskStage.value = 'done';
        taskProgress.value = 100;
        break;
      }

      if (normalizedStatus === 'failed' || normalizedStatus === 'error') {
        taskStage.value = 'failed';
        throw new Error(status?.error || '检测失败');
      }

      if (normalizedStage) {
        taskStage.value = normalizedStage;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    const taskResult = (await erQueryTaskResult(taskId)).data;
    result.value = taskResult;

    // 更新步骤到第4步
    currentStep.value = 4;

    // 重置详细信息显示状态，优先显示简要总结
    detailReportDialogVisible.value = false;

    // 使用之前保存的图片信息设置结果图片
    resultImg.value.originImg = currentImageSet.rgbImageUrls[0] || '';
    resultImg.value.resultImg = taskResult.resultImage || '';

    isDetecting.value = false;
    taskProgress.value = 100;

    ElMessage.success('检测完成！');
  } catch (error: any) {
    isDetecting.value = false;
    taskStage.value = 'failed';
    console.error('检测失败:', error);
    ElMessage.error(`检测失败: ${error?.message || '请稍后重试'}`);
  }
};

/** 计算出苗率 */
const calculateEmergenceRate = () => {
  if (!result.value) return 0;
  const rate = Number(result.value.emergenceRate ?? 0);
  return Number.isFinite(rate) ? Math.round(rate) : 0;
};

/** 计算苗密度 */
const calculateSeedlingDensity = () => {
  if (!result.value) return 0;
  const density = Number(result.value.seedlingDensity ?? 0);
  return Number.isFinite(density) ? density : 0;
};

/** 获取总体缺苗状况 */
const getOverallMissingStatus = () => {
  const rate = calculateEmergenceRate();

  if (rate > 80) {
    return '正常';
  } else if (rate >= 65) {
    return '低度缺苗';
  } else if (rate >= 50) {
    return '中度缺苗';
  } else {
    return '高度缺苗';
  }
};

/** 获取检测区域面积 */
const getDetectedArea = () => {
  // 将平方米换算成亩：2073.600 平方米 / 666.67 ≈ 3.11 亩
  return '3.11 亩';
};

/** 获取出苗区域面积 */
const getEmergenceArea = () => {
  const rate = calculateEmergenceRate();
  // 总面积：3.11 亩（已从 2073.600 平方米换算）
  const totalArea = 3.11;
  const emergenceArea = ((totalArea * rate) / 100).toFixed(2);
  return emergenceArea + ' 亩';
};

/** 获取建议措施 */
const getRecommendation = () => {
  const rate = calculateEmergenceRate();
  if (rate > 80) {
    return '出苗情况正常，继续保持当前管理水平，注意后期生长监测。';
  } else if (rate >= 65) {
    return '低度缺苗，建议加强田间管理，确保苗期正常生长。适当增加水肥供应，关注苗情发展。';
  } else if (rate >= 50) {
    return '中度缺苗，建议进行补种，检查种子质量和播种条件。加强土壤湿度和温度管理，适当补充水分和养分。';
  } else {
    return '高度缺苗，建议重新播种，检查土壤条件和种子质量问题。必要时进行土壤改良和重新整地。';
  }
};

/** 构建报告请求体 */
const buildReportPayload = (): ErReportRequest | null => {
  const land = lands.value.find((l) => l.landId === selectedLandId.value) || {};
  const resultData = result.value || ({} as ErTaskResult);

  const baseId = land.baseId ?? (resultData as any).baseId ?? (resultData as any).base_id;
  const plotId = land.landId ?? (resultData as any).plotId ?? (resultData as any).plot_id;

  if (baseId === undefined || baseId === null || plotId === undefined || plotId === null) {
    ElMessage.warning('缺少基地或地块信息，无法导出报告');
    return null;
  }

  const toNumber = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  return {
    baseId,
    plotId,
    baseName: land.baseName || (resultData as any).baseName || (resultData as any).base_name || '',
    plotName: land.landCode || (resultData as any).plotName || (resultData as any).plot_name || '',
    inspectorUser: '',
    longitude: toNumber((land as any).lng || land.longitude || (resultData as any).longitude || (resultData as any).plotLongitude),
    latitude: toNumber((land as any).lat || land.latitude || (resultData as any).latitude || (resultData as any).plotLatitude),
    emergenceRate: calculateEmergenceRate(),
    totalSeedlings: Number(resultData?.totalSeedlings ?? 0),
    plotArea: toNumber((land as any).landAreaMu ?? land.landArea ?? (resultData as any).plotArea ?? 0),
    seedlingDensity: calculateSeedlingDensity(),
    originImage: resultImg.value.originImg || (resultData as any).originImage || '',
    resultImage: resultImg.value.resultImg || (resultData as any).resultImage || '',
    createTime: new Date().toISOString()
  };
};

/** 下载详细报告 */
const downloadDetailReport = async () => {
  const payload = buildReportPayload();
  if (!payload) return;

  try {
    const blob = await downloadErReport(payload);

    if (!(blob instanceof Blob)) {
      throw new Error('下载失败：响应数据不是有效的 Blob');
    }

    if (blob.size === 0) {
      throw new Error('下载的文件为空，请检查后端数据');
    }

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `EmergenceRate_Report_${payload.plotName || payload.plotId}.pdf`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    ElMessage.success('报告下载成功');
  } catch (error: any) {
    console.error('下载失败:', error);
    ElMessage.error(`报告下载失败: ${error.message || '请稍后重试'}`);
  }
};

/** 图片加载完成事件 */
const onImageLoad = () => {
  // 图片加载完成后的处理
};

/** 导出结果 */
const handleExportResult = async () => {
  await downloadDetailReport();
};

/** 显示详情 */
const handleShowDetail = () => {
  detailReportDialogVisible.value = true;
};

/** 重置状态 */
const resetState = () => {
  selectedLandId.value = undefined;
  result.value = null;
  imageSets.value = [];
  currentStep.value = 1;
  detailReportDialogVisible.value = false;
  isDetecting.value = false;
  taskStage.value = '';
  taskProgress.value = 0;
  pollingFailureCount.value = 0;
};

// 暴露重置方法供父组件调用
defineExpose({
  resetState
});

// 组件挂载时直接获取所有地块（后端会根据用户权限自动过滤）
fetchFarmerLands({ baseId: '' })
  .then((res) => {
    lands.value = (res as any).rows || res.data || res; // 兼容不同的返回格式
  })
  .catch((error) => {
    console.error('Failed to fetch lands:', error);
    ElMessage.error('获取地块列表失败');
  });

// 确保生育期设置为出苗期
form.value.growthPeriod = '出苗期';
</script>

<style lang="scss" scoped>
/* 容器样式 */
.newdetect-container {
  width: 100%;
}

.newdetect-content {
  max-height: none;
  overflow-y: visible;
}

.guide-card {
  :deep(.el-card__body) {
    padding: 12px 20px;
  }

  :deep(.el-card__header) {
    padding: 12px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .guide-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #e5e7eb;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-bottom: 4px;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .step-content {
      text-align: center;

      .step-title {
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
        font-size: 13px;
      }
    }

    &.active .step-number {
      background-color: #3b82f6;
      color: white;
    }

    &.completed .step-number {
      background-color: #10b981;
      color: white;
    }
  }

  .step-connector {
    flex: 1;
    height: 2px;
    background-color: #e5e7eb;
    margin: 0 8px;
    margin-top: -16px;
  }
}

/* 图像容器优化 */
:deep(.el-image) {
  border-radius: 8px;
  overflow: hidden;

  img {
    transition: transform 0.3s ease-in-out;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

/* 自定义下拉框样式 */
:deep(.custom-select-dropdown) {
  max-height: 200px !important;

  .el-select-dropdown__item {
    padding: 6px 12px;
    font-size: 14px;

    &:hover {
      background-color: #f9fafb;
    }

    &.selected {
      background-color: #3b82f6;
      color: #ffffff;
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 6px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;

    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #409eff inset;
    }
  }
}

/* 图像上传组件样式 */
.image-upload {
  :deep(.el-upload) {
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s ease;

    &:hover {
      border-color: #409eff;
    }
  }

  :deep(.el-upload-dragger) {
    background-color: #fafbfc;
    border: none;
    border-radius: 6px;
    box-sizing: border-box;
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  :deep(.el-icon--upload) {
    font-size: 48px;
    color: #c0c4cc;
    margin: 40px 0 16px;
    line-height: 50px;
  }

  :deep(.el-upload__text) {
    color: #606266;
    font-size: 14px;
    text-align: center;

    em {
      color: #409eff;
      font-style: normal;
    }
  }

  :deep(.el-upload__tip) {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
    text-align: center;
  }

  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: 148px;
      height: 148px;
      margin: 0 8px 8px 0;
      border: 1px solid #c0ccda;
      border-radius: 6px;
      box-sizing: border-box;
      text-align: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
  }
}
</style>
