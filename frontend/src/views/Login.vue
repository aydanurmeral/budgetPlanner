<template>
  <div class="min-h-screen flex" :class="isDark ? 'bg-gray-900' : 'bg-gray-50'">
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80"></div>
      <div class="relative z-10 flex flex-col justify-center items-center text-white p-12">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold mb-4 animate-fade-in">Finans Takip</h1>
          <p class="text-xl text-indigo-100 mb-8 animate-fade-in-delay">
            Bütçenizi kolayca yönetin ve takip edin
          </p>
          <div class="space-y-4 animate-fade-in-delay-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-lg">Gelir ve gider takibi</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span class="text-lg">Raporlar ve grafikler</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span class="text-lg">Güvenli Erişim</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-4xl font-bold mb-2" :class="isDark ? 'text-white' : 'text-gray-900'">
            Hoş Geldiniz
          </h2>
          <p class="text-gray-500 dark:text-gray-400">Hesabınıza giriş yapın</p>
        </div>

        <div
          class="rounded-2xl p-8 shadow-xl border transition-all duration-300"
          :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'"
        >
          <form class="space-y-6" @submit.prevent="handleLogin">
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                Email Adresi
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="ornek@email.com"
                class="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
                Şifre
              </label>
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                :class="isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'"
                required
              />
            </div>

            <div v-if="error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p class="text-sm text-red-600 dark:text-red-400 text-center">{{ error }}</p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Giriş yapılıyor...
              </span>
              <span v-else>Giriş Yap</span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
              Hesabınız yok mu?
              <router-link to="/register" class="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Kayıt olun
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/auth'
import backgroundImage from '../assets/images.jpg'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const isDark = ref(localStorage.getItem('darkMode') === 'true')

onMounted(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authAPI.login(form.value)
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    window.location.href = '/'
  } catch (err) {
  const message = err.response?.data?.error || 'Giriş yapılırken bir hata oluştu'
  error.value = message
  alert(message) 
}
 finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 0.6s ease-out 0.2s both;
}

.animate-fade-in-delay-2 {
  animation: fade-in 0.6s ease-out 0.4s both;
}
</style>
