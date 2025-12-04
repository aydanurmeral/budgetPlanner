<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">İşlemler</h2>
          <p class="mt-2 text-gray-600">Gelir ve gider kayıtlarınızı yönetin</p>
        </div>
        <button
          @click="showModal = true"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          + Yeni İşlem
        </button>
      </div>
      
      <div class="flex gap-4 flex-wrap">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ara..."
          class="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          @input="loadTransactions"
        />
        <select
          v-model="filterCategory"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          @change="loadTransactions"
        >
          <option value="">Tüm Kategoriler</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <select
          v-model="filterType"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          @change="loadTransactions"
        >
          <option value="">Tüm Tipler</option>
          <option value="income">Gelir</option>
          <option value="expense">Gider</option>
        </select>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(transaction.transaction_date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: transaction.category_color }"></div>
                <span class="text-sm text-gray-900">{{ transaction.category_name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ transaction.description || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ transaction.type === 'income' ? 'Gelir' : 'Gider' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold" :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editTransaction(transaction)"
                class="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                Düzenle
              </button>
              <button
                @click="deleteTransaction(transaction.id)"
                class="text-red-600 hover:text-red-900"
              >
                Sil
              </button>
            </td>
          </tr>
          <tr v-if="transactions.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              Henüz işlem kaydı bulunmuyor
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingTransaction ? 'İşlem Düzenle' : 'Yeni İşlem Ekle' }}
          </h3>
          <form @submit.prevent="saveTransaction" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tip</label>
              <select v-model="form.type" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Kategori</label>
              <select v-model="form.category_id" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seçiniz</option>
                <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tutar</label>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tarih</label>
              <input
                v-model="form.transaction_date"
                type="date"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <div class="flex gap-2">
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Kaydet
              </button>
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { transactionsAPI, categoriesAPI } from '../services/api'

const transactions = ref([])
const categories = ref([])
const showModal = ref(false)
const editingTransaction = ref(null)
const searchQuery = ref('')
const filterCategory = ref('')
const filterType = ref('')

const form = ref({
  category_id: '',
  amount: '',
  description: '',
  type: 'expense',
  transaction_date: new Date().toISOString().split('T')[0]
})

const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === form.value.type)
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR')
}

const loadTransactions = async () => {
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterCategory.value) params.category_id = filterCategory.value
    if (filterType.value) params.type = filterType.value
    
    const response = await transactionsAPI.getAll(params)
    transactions.value = response.data
  } catch (error) {
    console.error('İşlemler yüklenirken hata:', error)
  }
}

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getAll()
    categories.value = response.data
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error)
  }
}

const saveTransaction = async () => {
  try {
    if (editingTransaction.value) {
      await transactionsAPI.update(editingTransaction.value.id, form.value)
    } else {
      await transactionsAPI.create(form.value)
    }
    await loadTransactions()
    closeModal()
    window.dispatchEvent(new CustomEvent('data-updated'))
  } catch (error) {
    console.error('İşlem kaydedilirken hata:', error)
    alert('İşlem kaydedilemedi. Lütfen tekrar deneyin.')
  }
}

const editTransaction = (transaction) => {
  editingTransaction.value = transaction
  form.value = {
    category_id: transaction.category_id,
    amount: transaction.amount,
    description: transaction.description || '',
    type: transaction.type,
    transaction_date: transaction.transaction_date
  }
  showModal.value = true
}

const deleteTransaction = async (id) => {
  if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return
  
  try {
    await transactionsAPI.delete(id)
    await loadTransactions()
    window.dispatchEvent(new CustomEvent('data-updated'))
  } catch (error) {
    console.error('İşlem silinirken hata:', error)
    alert('İşlem silinemedi. Lütfen tekrar deneyin.')
  }
}

const closeModal = () => {
  showModal.value = false
  editingTransaction.value = null
  form.value = {
    category_id: '',
    amount: '',
    description: '',
    type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0]
  }
}

onMounted(() => {
  loadTransactions()
  loadCategories()
})
</script>


