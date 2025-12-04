<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-500">Dashboard</h2>
      <p class="mt-2 text-gray-600">Finansal özetinizi görüntüleyin</p>
    </div>
    <div class="mb-6 flex gap-4">
      <input
        v-model="startDate"
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        @change="loadStats"
      />
      <input
        v-model="endDate"
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        @change="loadStats"
      />
      <button
        @click="resetDates"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
      >
        Sıfırla
      </button>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 text-xl">↑</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Toplam Gelir</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ formatCurrency(stats.totalIncome) }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span class="text-red-600 text-xl">↓</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Toplam Gider</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ formatCurrency(stats.totalExpense) }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg" :class="stats.balance >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span class="text-indigo-600 text-xl">₺</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Bakiye</dt>
                <dd class="text-2xl font-semibold" :class="stats.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(stats.balance) }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Aylık Trend</h3>
        <div class="h-64">
          <LineChart :data="stats" />
        </div>
      </div>
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Kategori Dağılımı</h3>
        <div class="h-64">
          <PieChart :data="stats.categoryStats" />
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Kategori Bazında Harcamalar</h3>
        <div class="space-y-4">
          <div
            v-for="category in stats.categoryStats.filter(c => c.type === 'expense' && c.total > 0)"
            :key="category.name"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: category.color }"></div>
              <span class="text-sm font-medium text-gray-700">{{ category.name }}</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(category.total) }}</span>
          </div>
          <div v-if="stats.categoryStats.filter(c => c.type === 'expense' && c.total > 0).length === 0" class="text-gray-500 text-sm">
            Henüz gider kaydı bulunmuyor
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { transactionsAPI } from '../services/api'
import LineChart from '../components/LineChart.vue'
import PieChart from '../components/PieChart.vue'

const route = useRoute()
const stats = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  categoryStats: [],
  monthlyTrend: []
})

const startDate = ref('')
const endDate = ref('')

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount)
}

const loadStats = async () => {
  try {
    const response = await transactionsAPI.getStats(startDate.value, endDate.value)
    const data = response.data

    const monthlyTrend = data.monthlyTrend?.map(item => ({
      month: item.month,
      total: Number(item.total),
      type: item.type
    })) || []

    const categoryStats = data.categoryStats?.map(cat => ({
      name: cat.name,
      total: Number(cat.total),
      type: cat.type,
      color: cat.color || '#3B82F6'
    })) || []

    stats.value = {
      totalIncome: Number(data.totalIncome),
      totalExpense: Number(data.totalExpense),
      balance: Number(data.balance),
      monthlyTrend,
      categoryStats
    }

  } catch (error) {
    console.error('Dashboard verileri yüklenirken hata:', error)
  }
}

const resetDates = () => {
  startDate.value = ''
  endDate.value = ''
  loadStats()
}

const handleDataUpdate = () => {
  loadStats()
}

onMounted(() => {
  loadStats()
  window.addEventListener('data-updated', handleDataUpdate)
})

onActivated(() => {
  loadStats()
})

onUnmounted(() => {
  window.removeEventListener('data-updated', handleDataUpdate)
})
</script>


