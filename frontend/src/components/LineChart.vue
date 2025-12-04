<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = () => {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  const incomeData = {}
  const expenseData = {}

  
  const monthlyTrend = props.data?.monthlyTrend || []
  
  monthlyTrend.forEach(item => {
    if (item && item.month) {
      if (item.type === 'income') {
        incomeData[item.month] = parseFloat(item.total) || 0
      } else if (item.type === 'expense') {
        expenseData[item.month] = parseFloat(item.total) || 0
      }
    }
  })

  const allMonths = new Set()
  monthlyTrend.forEach(item => {
    if (item && item.month) {
      allMonths.add(item.month)
    }
  })
  
  const months = Array.from(allMonths).sort()
  
 
  if (months.length === 0) {
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.push(monthStr)
    }
  }
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Gelir',
          data: months.map(m => incomeData[m] || 0),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Gider',
          data: months.map(m => expenseData[m] || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 0
              }).format(value)
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  createChart()
})

watch(() => props.data?.monthlyTrend, () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })
</script>


