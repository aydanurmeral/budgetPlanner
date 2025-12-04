<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Array,
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
  
  const expenseCategories = props.data?.filter(c => c.type === 'expense' && c.total > 0) || []
  
 
  if (expenseCategories.length === 0) {
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    })
    return
  }
  
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: expenseCategories.map(c => c.name),
      datasets: [{
        data: expenseCategories.map(c => c.total),
        backgroundColor: expenseCategories.map(c => c.color),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 0
              }).format(context.parsed)
              return `${label}: ${value}`
            }
          }
        }
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  createChart()
})

watch(() => props.data, () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })
</script>


